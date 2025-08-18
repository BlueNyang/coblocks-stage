import { RuntimeState, ExecutionResult, StateChange } from "@/types/execution";
import { CharacterDirection } from "@/types/character";
import { ObjectID } from "@/types/objects";
import { CannotCollectError } from "@/errors/objError";

export class WorkerSandbox {
  private runtimeState: RuntimeState | null = null;
  private log: string[] = [];
  private stateChanges: StateChange[] = [];
  private startTime: number = 0;
  private isPaused: boolean = false;
  private executionId: string = "";
  private currentCharacterId: number = -1;

  constructor() {}

  // API 생성
  createAPI(characterId: number) {
    this.currentCharacterId = characterId;

    return {
      character: {
        move: (direction: string | CharacterDirection) => {
          this.checkPaused();

          if (!this.runtimeState || !this.runtimeState.character) {
            throw new Error("Runtime state or character not initialized");
          }

          const character = this.runtimeState.character.get(characterId);
          if (!character) {
            throw new Error(
              `Character with ID ${characterId} not found in runtime state.`
            );
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
            newPos.x >= this.runtimeState!.map.width ||
            newPos.y < 0 ||
            newPos.y >= this.runtimeState!.map.height
          ) {
            throw new Error(`Character cannot move outside map boundaries.`);
          }

          // check tile
          const tileKey = `${newPos.x},${newPos.y}`;
          const tile = this.runtimeState!.map.tiles.get(tileKey);
          if (tile && !tile.canPass) {
            throw new Error(`Character cannot move onto tile: ${tileKey}`);
          }

          // check collisions
          const objectAtNewPos = Array.from(
            this.runtimeState.objects.values()
          ).filter((obj) => obj.x === newPos.x && obj.y === newPos.y);

          for (const obj of objectAtNewPos) {
            if (!obj.canPass) {
              throw new Error(
                `Character cannot move through object: ${obj.id}`
              );
            }
          }

          // check collisions for other character
          const otherCharacters = Array.from(
            this.runtimeState.character.values()
          ).filter((char) => char.id !== characterId);

          const characterAtPos = otherCharacters.find((char) => {
            const pos = char.getPosition();
            return pos.x === newPos.x && pos.y === newPos.y;
          });

          if (characterAtPos) {
            throw new Error(
              `Character cannot move onto another character: ${characterAtPos.id}`
            );
          }

          // Move character
          character.moveTo(newPos.x, newPos.y);
          character.setDirection(dir);

          // Log state change
          this.stateChanges.push({
            type: "CHARACTER_MOVE",
            timestamp: Date.now(),
            data: {
              characterId,
              from: oldPos,
              to: { ...character.getPosition() },
              direction,
            },
          });
          this.log.push(`Character moved ${direction}`);
        },

        getPosition: () => ({
          ...this.runtimeState!.character.get(characterId)?.getPosition(),
        }),
        getDirection: () =>
          this.runtimeState!.character.get(characterId)?.getDirection(),
        getInventory: () => {
          if (!this.runtimeState?.character) return [];
          return [
            ...(this.runtimeState.character.get(characterId)?.getInventory() ||
              []),
          ];
        },

        interact: () => {
          this.checkPaused();

          const character = this.runtimeState!.character.get(characterId);
          if (!character) {
            throw new Error("Character not initialized");
          }

          const charPos = character.getPosition();
          const objectAtPosition = Array.from(
            this.runtimeState!.objects.values()
          ).filter((obj) => obj.x === charPos.x && obj.y === charPos.y);

          if (objectAtPosition.length === 0) {
            this.log.push("No objects to interact with at current position.");
            throw new Error("No objects to interact with at current position.");
          }

          objectAtPosition.forEach((obj) => {
            if ("interact" in obj && typeof obj.interact === "function") {
              obj.interact();
              this.stateChanges.push({
                type: "OBJECT_INTERACT",
                timestamp: Date.now(),
                data: {
                  characterId,
                  objectId: obj.id,
                  objectType: obj.type,
                  position: { x: obj.x, y: obj.y },
                },
              });
              this.log.push(
                `Interacted with object: ${obj.id} of type ${obj.type}`
              );
            }
          });
        },
      },

      objects: {
        getById: (id: ObjectID) => {
          const obj = this.runtimeState!.objects.get(id);
          return obj ? this.createObjectProxy(obj, characterId) : null;
        },

        getByType: (type: string) => {
          return Array.from(this.runtimeState!.objects.values())
            .filter((obj) => obj.type === type)
            .map((obj) => this.createObjectProxy(obj, characterId));
        },

        getAt: (x: number, y: number) => {
          return Array.from(this.runtimeState!.objects.values())
            .filter((obj) => obj.x === x && obj.y === y)
            .map((obj) => this.createObjectProxy(obj, characterId));
        },
      },

      map: {
        getSize: () => {
          if (!this.runtimeState?.map) return { width: 0, height: 0 };
          return {
            width: this.runtimeState.map.width,
            height: this.runtimeState.map.height,
          };
        },

        getTitleAt: (x: number, y: number) => {
          if (!this.runtimeState?.map) return null;
          const tileKey = `${x},${y}`;
          const tile = this.runtimeState.map.tiles.get(tileKey);
          return tile
            ? {
                id: tile.id,
                type: tile.type,
                x: tile.x,
                y: tile.y,
                canPass: tile.canPass,
              }
            : null;
        },

        isPassable: (x: number, y: number) => {
          const tileKey = `${x},${y}`;
          const tile = this.runtimeState?.map.tiles.get(tileKey);
          return tile ? tile.canPass : false;
        },
      },

      runtime: {
        wait: async (ms: number) => {
          this.checkPaused();
          return new Promise((resolve) => {
            setTimeout(resolve, Math.min(ms, 1000));
          });
        },

        getOtherCharacters: () => {
          if (!this.runtimeState?.character) return [];
          return Array.from(this.runtimeState.character.values())
            .filter((char) => char.id !== characterId)
            .map((char) => ({
              id: char.id,
              position: char.getPosition(),
              direction: char.getDirection(),
            }));
        },

        getAllCharacters: () => {
          if (!this.runtimeState?.character) return [];
          return Array.from(this.runtimeState.character.values()).map(
            (char) => ({
              id: char.id,
              position: char.getPosition(),
              direction: char.getDirection(),
            })
          );
        },
      },

      console: {
        log: (...args: any[]) => {
          const msg = args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg) : String(arg)
            )
            .join(" ");
          this.log.push(msg);
        },

        warn: (...args: any[]) => {
          const msg = args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg)
            )
            .join(" ");
          this.log.push(msg);
        },

        error: (...args: any[]) => {
          const msg = args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg)
            )
            .join(" ");
          this.log.push(msg);
        },
      },
    };
  }

  createObjectProxy(obj: any, characterId: number): any {
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

      interact:
        "interact" in obj
          ? () => {
              this.checkPaused();
              obj.interact();
              this.stateChanges.push({
                type: "OBJECT_INTERACT",
                timestamp: Date.now(),
                data: {
                  characterId,
                  objectId: obj.id,
                  objectType: obj.type,
                },
              });
            }
          : undefined,

      collect:
        "collect" in obj
          ? () => {
              this.checkPaused();
              const character = this.runtimeState!.character.get(characterId);
              if (!character) {
                throw new Error("Character not found");
              }

              if (obj.isCollected && obj.isCollected()) {
                throw new CannotCollectError(
                  `Object ${obj.id} is already collected.`
                );
              }

              obj.collect(character);
              this.stateChanges.push({
                type: "INVENTORY_CHANGE",
                timestamp: Date.now(),
                data: {
                  characterId,
                  objectId: obj.id,
                  objectType: obj.type,
                },
              });
            }
          : undefined,

      drop:
        "drop" in obj && "isCollected" in obj
          ? (x: number, y: number) => {
              this.checkPaused();
              const character = this.runtimeState?.character.get(characterId);

              if (!character) throw new Error("Character not found");

              if (!obj.isCollected()) {
                throw new Error(`Object ${obj.id} is not collected.`);
              }

              obj.drop(character, x, y);
              this.stateChanges.push({
                type: "INVENTORY_CHANGE",
                timestamp: Date.now(),
                data: {
                  characterId,
                  objectId: obj.id,
                  objectType: obj.type,
                  position: { x, y },
                },
              });
            }
          : undefined,

      isCollected: obj.isCollected ? () => obj.isCollected() : undefined,

      getDistance: (x: number, y: number) => {
        return Math.abs(obj.x - x) + Math.abs(obj.y - y);
      },
    };
  }

  async execute(characterId: number, code: string): Promise<ExecutionResult> {
    this.log = [];
    this.stateChanges = [];
    this.startTime = Date.now();
    this.isPaused = false;

    try {
      const api = this.createAPI(characterId);
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
        characterId,
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
        characterId,
      };
    }
  }

  async executeAll(
    characterCodes: Map<number, string>
  ): Promise<Map<number, ExecutionResult>> {
    this.log = [];
    this.stateChanges = [];
    this.startTime = Date.now();
    this.executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.isPaused = false;

    const results = new Map<number, ExecutionResult>();

    const promises = Array.from(characterCodes.entries()).map(
      async ([characterId, code]) => {
        const result = await this.execute(characterId, code);
        return { characterId, result };
      }
    );

    const resolvedResults = await Promise.all(promises);

    resolvedResults.forEach(({ characterId, result }) => {
      results.set(characterId, result);
    });

    return results;
  }

  syncState(state: RuntimeState): void {
    this.runtimeState = {
      ...state,
      objects: new Map(Object.entries(state.objects)),
      map: {
        ...state.map,
        tiles: new Map(Object.entries(state.map.tiles)),
      },
      character: new Map(state.character),
    };

    this.log = [];
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  private checkPaused(): void {
    if (this.isPaused) {
      throw new Error("Execution is paused");
    }
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
        resp = await sandbox.execute(payload.characterId, payload.code);
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
