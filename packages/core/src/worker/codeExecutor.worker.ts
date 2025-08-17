import { RuntimeState, ExecutionResult, StateChange } from "@/types/execution";
import { CharacterDirection } from "@/types/character";
import { ObjectID } from "@/types/objects";
import { CannotCollectError } from "@/errors/objError";
import { get } from "http";

export class WorkerSandbox {
  private runtimeState: RuntimeState | null = null;
  private log: string[] = [];
  private stateChanges: StateChange[] = [];
  private startTime: number = 0;
  private isPaused: boolean = false;
  private executionId: string = "";

  constructor() {}

  // API 생성
  createAPI() {
    const self = this;

    return {
      character: {
        move: (direction: string | CharacterDirection) => {
          if (!self.runtimeState || !self.runtimeState.character) {
            throw new Error("Runtime state or character not initialized");
          }
          let dir: CharacterDirection;
          const strDir = String(direction).toLowerCase();

          switch (strDir) {
            case "up":
              dir = CharacterDirection.UP;
              break;
            case "down":
              dir = CharacterDirection.DOWN;
              break;
            case "left":
              dir = CharacterDirection.LEFT;
              break;
            case "right":
              dir = CharacterDirection.RIGHT;
              break;
            default:
              throw new Error(`Invalid direction: ${direction}`);
          }

          const character = self.runtimeState.character;
          const oldPos = { ...character.getPosition() };

          // processing movement
          const newPos = { ...oldPos };
          switch (dir) {
            case CharacterDirection.UP:
              newPos.y -= 1;
              break;
            case CharacterDirection.DOWN:
              newPos.y += 1;
              break;
            case CharacterDirection.LEFT:
              newPos.x -= 1;
              break;
            case CharacterDirection.RIGHT:
              newPos.x += 1;
              break;
            default:
              throw new Error(
                `Invalid direction: ${direction}. Use 'up', 'down', 'left', or 'right'.`
              );
          }

          // check boundaries
          if (
            newPos.x < 0 ||
            newPos.x >= self.runtimeState.map.width ||
            newPos.y < 0 ||
            newPos.y >= self.runtimeState.map.height
          ) {
            throw new Error(`Character cannot move outside map boundaries.`);
          }

          // check collisions
          const objectAtNewPos = Array.from(
            self.runtimeState.objects.values()
          ).filter((obj) => obj.x === newPos.x && obj.y === newPos.y);

          for (const obj of objectAtNewPos) {
            if (!obj.canPass) {
              throw new Error(
                `Character cannot move through object: ${obj.id}`
              );
            }
          }

          // Move character
          character.moveTo(newPos.x, newPos.y);
          character.setDirection(dir);

          // Log state change
          self.stateChanges.push({
            type: "CHARACTER_MOVE",
            timestamp: Date.now(),
            data: {
              from: oldPos,
              to: { ...character.getPosition() },
              direction,
            },
          });
          self.log.push(`Character moved ${direction}`);
        },

        getPosition: () => ({ ...self.runtimeState!.character.getPosition() }),
        getDirection: () => self.runtimeState!.character.getDirection(),
        getInventory: () => {
          if (!self.runtimeState?.character) return [];
          return [...self.runtimeState.character.getInventory()];
        },

        interact: () => {
          if (this.isPaused) {
            throw new Error("Game is paused");
          }

          if (!self.runtimeState?.character) {
            throw new Error("Character not initialized");
          }

          const charPos = self.runtimeState!.character.getPosition();
          const objectAtPosition = Array.from(
            self.runtimeState!.objects.values()
          ).filter((obj) => obj.x === charPos.x && obj.y === charPos.y);

          if (objectAtPosition.length === 0) {
            throw new Error("No objects to interact with at current position.");
            self.log.push("No objects to interact with at current position.");
          }

          objectAtPosition.forEach((obj) => {
            if ("interact" in obj && typeof obj.interact === "function") {
              obj.interact();
              self.stateChanges.push({
                type: "OBJECT_INTERACT",
                timestamp: Date.now(),
                data: {
                  objectId: obj.id,
                  objectType: obj.type,
                  position: { x: obj.x, y: obj.y },
                },
              });
              self.log.push(
                `Interacted with object: ${obj.id} of type ${obj.type}`
              );
            }
          });
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
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg) : String(arg)
            )
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
      isPassable: obj.isPassable
        ? (character: any) => obj.isPassable(character)
        : undefined,

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
              throw new CannotCollectError(
                `Object ${obj.id} is already collected.`
              );
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

      getDistance: (x: number, y: number) => {
        return Math.abs(obj.x - x) + Math.abs(obj.y - y);
      },
    };
  }

  async execute(code: string): Promise<ExecutionResult> {
    this.log = [];
    this.stateChanges = [];
    this.startTime = Date.now();
    this.isPaused = false;

    try {
      const api = this.createAPI();
      const result = await new Promise((resolve, reject) => {
        try {
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
        } catch (error) {
          reject(error);
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
    this.runtimeState = {
      ...state,
      objects: new Map(Object.entries(state.objects)),
    };
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }
}

const sandbox = new WorkerSandbox();

self.onmessage = async function (event) {
  const { type, payload, id } = event.data;
  try {
    let resp;

    switch (type) {
      case "SYNC_STATE":
        const restoredState = {
          ...payload.runtimeState,
          objects: new Map(Object.entries(payload.runtimeState.objects)),
        };
        sandbox.syncState(restoredState);
        resp = { success: true };
        break;

      case "EXECUTE_CODE":
        resp = await sandbox.execute(payload.code);
        break;

      case "PAUSE":
        sandbox.pause();
        resp = { success: true, message: "Paused" };
        break;

      case "RESUME":
        sandbox.resume();
        resp = { success: true, message: "Resumed" };
        break;

      case "TERMINATE":
        self.close();
        break;

      default:
        resp = { success: false, message: "Unknown action" };
    }

    self.postMessage({
      type: "RESPONSE",
      payload: resp,
      id,
    });
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      payload: { success: false, message: "Internal error" },
      id,
    });
  }
};
