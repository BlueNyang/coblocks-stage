import { RuntimeState, ExecutionResult, StateChange } from "@/types/execution";
import { CharacterDirection } from "@/types/character";
import { ObjectID } from "@/types/objects";
import { InteractableObject, CollectibleObject } from "@/implements/basicObj";
import { CannotCollectError } from "@/errors/objError";

export class WorkerSandbox {
  private runtimeState: RuntimeState | null = null;
  private log: string[] = [];
  private stateChanges: StateChange[] = [];
  private startTime: number = 0;

  constructor() {}

  createAPI() {
    const self = this;

    return {
      character: {
        move: (direction: CharacterDirection) => {
          if (!self.runtimeState || !self.runtimeState.character) {
            throw new Error("Runtime state or character not initialized");
          }

          const character = self.runtimeState.character;
          const oldPos = { ...character.getPosition() };

          switch (direction) {
            case CharacterDirection.UP:
              character.moveTo(oldPos.x, oldPos.y - 1);
              break;
            case CharacterDirection.DOWN:
              character.moveTo(oldPos.x, oldPos.y + 1);
              break;
            case CharacterDirection.LEFT:
              character.moveTo(oldPos.x - 1, oldPos.y);
              break;
            case CharacterDirection.RIGHT:
              character.moveTo(oldPos.x + 1, oldPos.y);
              break;
            default:
              throw new Error(`Invalid direction: ${direction}`);
          }

          character.setDirection(direction);

          self.stateChanges.push({
            type: "CHARACTER_MOVE",
            timestamp: Date.now(),
            data: { from: oldPos, to: { ...character.getPosition() }, direction },
          });
          self.log.push(`Character moved ${direction}`);
        },

        getPosition: () => ({ ...self.runtimeState!.character.getPosition() }),

        interact: () => {
          const charPos = self.runtimeState!.character.getPosition();
          const objectAtPosition = Array.from(self.runtimeState!.objects.values()).filter(
            (obj) => obj.x === charPos.x && obj.y === charPos.y
          );

          objectAtPosition.forEach((obj) => {
            if ("interact" in obj && typeof obj.interact === "function") {
              obj.interact();
              self.stateChanges.push({
                type: "OBJECT_INTERACT",
                timestamp: Date.now(),
                data: { objectId: obj.id, objectType: obj.type },
              });
              self.log.push(`Interacted with object: ${obj.id} of type ${obj.type}`);
            }
          });

          if (objectAtPosition.length === 0) {
            self.log.push("No objects to interact with at current position.");
          }
        },
      },

      objects: {
        getById: (id: ObjectID) => {
          const obj = self.runtimeState!.objects.get(id);
          return obj ? self.createObjectProxy(obj) : null;
        },

        getByType: (type: string) => {
          return Array.from(self.runtimeState!.objects.values())
            .filter((obj) => obj.type === type)
            .map((obj) => self.createObjectProxy(obj));
        },

        getAt: (x: number, y: number) => {
          return Array.from(self.runtimeState!.objects.values())
            .filter((obj) => obj.x === x && obj.y === y)
            .map((obj) => self.createObjectProxy(obj));
        },
      },

      wait: async (ms: number) => {
        return new Promise((resolve) => {
          setTimeout(resolve, Math.min(ms, 1000));
        });
      },

      console: {
        log: (...args: any[]) => {
          const msg = args
            .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
            .join(" ");
          self.log.push(msg);
        },
      },
    };
  }

  createObjectProxy(obj: any): any {
    return {
      id: obj.id,
      type: obj.type,
      x: obj.x,
      y: obj.y,
      state: obj.state,
      canPass: obj.canPass,

      getImage: obj.getImage ? () => obj.getImage() : undefined,
      getIcon: obj.getIcon ? () => obj.getIcon() : undefined,
      isPassable: obj.isPassable ? (character: any) => obj.isPassable(character) : undefined,

      interact: obj.interact
        ? () => {
            obj.interact();
            this.stateChanges.push({
              type: "OBJECT_INTERACT",
              timestamp: Date.now(),
              data: { objectId: obj.id, objectType: obj.type },
            });
          }
        : undefined,

      collect: obj.collect
        ? (character: any) => {
            if (obj.isCollected && obj.isCollected()) {
              throw new CannotCollectError(`Object ${obj.id} is already collected.`);
            }

            obj.collect(character);
            this.stateChanges.push({
              type: "INVENTORY_CHANGE",
              timestamp: Date.now(),
              data: { objectId: obj.id, objectType: obj.type },
            });
          }
        : undefined,

      isCollected: obj.isCollected ? () => obj.isCollected() : undefined,
    };
  }

  async execute(code: string): Promise<ExecutionResult> {
    this.log = [];
    this.stateChanges = [];
    this.startTime = Date.now();

    try {
      const result = await new Promise((resolve, reject) => {
        const api = this.createAPI();
        const wrappedCode = `
        (async function(api) {
          "use strict";
          ${code}
        })(arguments[0]);
        `;

        const executor = new Function("api", wrappedCode);
        const res = executor(api);

        if (res && typeof res.then === "function") {
          res
            .then((value: any) => {
              resolve(value);
            })
            .catch((error: any) => {
              reject(error);
            });
        } else {
          resolve(res);
        }
      });

      return {
        success: true,
        result,
        logs: this.log,
        stateChanges: this.stateChanges,
        executionTime: Date.now() - this.startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          type: error.message.includes("Syntax error")
            ? "SYNTAX"
            : error.message.includes("Dangerous")
              ? "SECURITY"
              : "RUNTIME",
          message: error.message,
          stack: error.stack,
        },
        logs: this.log,
        stateChanges: this.stateChanges,
        executionTime: Date.now() - this.startTime,
      };
    }
  }

  syncState(state: RuntimeState): void {
    this.runtimeState = state;
  }
}

const sandbox = new WorkerSandbox();

self.onmessage = async function (event) {
  const { type, payload, id } = event.data;

  switch (type) {
    case "SYNC_STATE":
      const restoredState = {
        ...payload.gameState,
        objects: new Map(Object.entries(payload.gameState.objects)),
      };
      sandbox.syncState(restoredState);
      break;

    case "EXECUTE_CODE":
      const result = await sandbox.execute(payload.code);
      self.postMessage({ type: "EXECUTION_RESULT", payload: result, id });
      break;

    case "TERMINATE":
      self.close();
      break;
  }
};
