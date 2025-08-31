import { Entity } from "@/entities/base/Entity";
import { EntityFactory } from "../entities/EntityFactory";
import { EntityDefinition } from "@/types/entity";
import { CodeSet, EntityData, StageData } from "@/types/stage";
import { Direction, Position } from "@/types/common";
import { WorkerAPI } from "./WorkerAPI";
import { Action, ActionType, WorkerMessage } from "@/types/workers";
import { StageCharacter } from "@/entities/StageCharacter";
import { StageObject } from "@/entities/StageObject";
import { StageTile } from "@/entities/StageTile";
import {
  CannotMoveError,
  CharacterNotFound,
  ObjectNotCollectible,
  ObjectNotFound,
  ObjectNotInteractable,
  WorkerError,
} from "@/errors/workerError";

export class WorkerSandbox {
  private factory: EntityFactory;

  private characters: Map<string, StageCharacter>;
  private stageObjects: Map<string, StageObject>;
  private stageTiles: Map<string, StageTile>;

  private executorId: NodeJS.Timeout | null = null;
  private isPaused: boolean = false;
  private executionSpeed: number = 300;

  private executors: Map<string, Generator> = new Map();

  constructor(executionSpeed: number) {
    this.factory = EntityFactory.getInstance();
    this.executionSpeed = executionSpeed;

    this.characters = new Map();
    this.stageObjects = new Map();
    this.stageTiles = new Map();
  }

  public initialize(
    entityDefinitions: EntityDefinition[],
    initStageData: StageData
  ) {
    for (const def of entityDefinitions) {
      this.factory.registerEntity(def);
    }

    this.setupStage(initStageData);
  }

  public run(codes: CodeSet, initStageData: StageData) {
    // this.setupStage(initStageData);

    for (const charId in codes) {
      const code: string = codes[charId];
      const api = new WorkerAPI(this, charId);
      const generator = new Function(
        "api",
        `return function* generatorExecutor() {
          ${code}
        }
      `
      )(api) as GeneratorFunction;

      this.executors.set(charId, generator(api));
    }

    this.nextTurn();
  }

  private setupStage(stageData: StageData) {
    for (const characterData of stageData.characters) {
      const character = this.factory.create(
        characterData.typeId,
        characterData
      ) as StageCharacter;

      if (character) {
        this.characters.set(character.id, character);
      }
    }

    for (const objectData of stageData.objects) {
      const stageObject = this.factory.create(
        objectData.typeId,
        objectData
      ) as StageObject;
      if (stageObject) {
        this.stageObjects.set(stageObject.id, stageObject);
      }
    }

    for (const tileData of stageData.tiles) {
      const stageTile = this.factory.create(
        tileData.typeId,
        tileData
      ) as StageTile;
      if (stageTile) {
        this.stageTiles.set(stageTile.id, stageTile);
      }
    }

    postMessage({
      type: WorkerMessage.UPDATE,
      payload: this.getRenderDataSet(),
    });
  }

  public pause(): void {
    if (this.executorId) {
      clearTimeout(this.executorId);
      this.executorId = null;
    }
    this.isPaused = true;

    postMessage({ type: WorkerMessage.PAUSED });
  }

  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;

      postMessage({ type: WorkerMessage.RESUMED });
      this.nextTurn();
    }
  }

  public stop(): void {
    if (this.executorId) {
      clearTimeout(this.executorId);
      this.executorId = null;
    }
    this.isPaused = false;
    this.executors.clear();
    this.characters.clear();
    this.stageObjects.clear();
    this.stageTiles.clear();

    this.isPaused = false;

    postMessage({
      type: WorkerMessage.STOPPED,
      payload: { success: false, reason: "Aborted" },
    });
  }

  public isPassable(position: Position): boolean {
    for (const char of this.characters.values()) {
      if (this.isSamePosition(char.position, position)) {
        return false;
      }
    }

    const tile = this.getTileAtPos(position);
    if (!tile || !tile.isPassable) return false;

    const object = this.getObjectAtPos(position);
    if (object && !object.isPassable) return false;

    return true;
  }

  private getObjectAtPos(position: Position): StageObject | null {
    for (const object of this.stageObjects.values()) {
      if (this.isSamePosition(object.position, position)) {
        return object;
      }
    }
    return null;
  }

  private getTileAtPos(position: Position): StageTile | null {
    for (const tile of this.stageTiles.values()) {
      if (this.isSamePosition(tile.position, position)) {
        return tile;
      }
    }
    return null;
  }

  private nextTurn(): void {
    const turnActions: Action[] = [];

    const charList = Array.from(this.executors.keys());

    charList.forEach((charId) => {
      const executor = this.executors.get(charId);

      if (executor) {
        const action = executor.next();

        if (action.done) {
          this.executors.delete(charId);
        } else {
          turnActions.push(action.value as Action);
        }
      }
    });

    const result: boolean = this.processTurnActions(turnActions);

    if (!result) {
      this.stop();
      return;
    }

    postMessage({
      type: WorkerMessage.UPDATE,
      payload: this.getRenderDataSet(),
    });

    if (this.executors.size > 0) {
      this.executorId = setTimeout(() => this.nextTurn(), this.executionSpeed);
    } else {
      postMessage({ type: WorkerMessage.FINISHED, payload: { success: true } });
    }
  }

  private processTurnActions(actions: Action[]): boolean {
    console.log(
      `[WorkerSandbox] Processing Turn Actions: this turn has ${actions.length} actions.`
    );

    actions.forEach((action) => {
      try {
        this.actionBranch(action);
      } catch (error) {
        postMessage({
          type: WorkerMessage.ERROR,
          payload: { success: false, reason: (error as WorkerError).message },
        });
        return false;
      }
    });
    return true;
  }

  private actionBranch(action: Action): void {
    console.log("[WorkerSandbox] Action Branch:", action);
    switch (action.type) {
      case ActionType.MOVE:
        this.moveAction(action.payload);
        break;
      case ActionType.INTERACTION:
        this.interactAction(action.payload);
        break;
      case ActionType.COLLECT:
        this.collectAction(action.payload);
        break;
      case ActionType.DROP:
        this.dropAction(action.payload);
        break;
      case ActionType.WAIT:
        break;
      case ActionType.TURN:
        this.turnAction(action.payload);
        break;
      case ActionType.LOG:
        this.logAction(action.payload);
        break;
      default:
        console.warn(`[WorkerSandbox] Unknown action type: ${action.type}`);
        break;
    }
  }

  private moveAction(payload: any): void {
    const { characterId, direction } = payload;
    const character = this.characters.get(characterId);

    if (!character) {
      console.log("[WorkerSandbox] Character not found:", characterId);
      throw new CharacterNotFound(`Character(id:${characterId}) not found`);
    }

    const targetDirection =
      direction === "front" ? character.direction : direction;
    const newPosition = this.getNewPosition(
      character.position,
      targetDirection
    );

    if (this.isPassable(newPosition)) {
      character.move(targetDirection);
    } else {
      console.log(
        "[WorkerSandbox] Move blocked:",
        characterId,
        "direction:",
        targetDirection
      );
      throw new CannotMoveError(
        `(${newPosition.x}, ${newPosition.y}) is blocked`
      );
    }
  }

  private interactAction(payload: any): void {
    const { characterId: characterId } = payload;
    const character = this.characters.get(characterId);
    if (!character) {
      console.log(
        "[WorkerSandbox] Interacting character not found:",
        characterId
      );
      throw new CharacterNotFound(`Character(id:${characterId}) not found`);
    }

    const targetId = this.getObjectIdAtFront(character);

    if (!targetId) {
      console.log("[WorkerSandbox] Interacting targetId not found");
      throw new ObjectNotFound(`targetId not found`);
    }

    const object = this.stageObjects.get(targetId);
    if (!object) {
      console.log("[WorkerSandbox] Target object not found:", targetId);
      throw new ObjectNotFound(`Object(id:${targetId}) not found`);
    }

    if (!object.isInteractable) {
      console.log(
        "[WorkerSandbox] Target object is not interactable:",
        targetId
      );
      throw new ObjectNotInteractable(
        `Object(id:${targetId}) is not interactable`
      );
    }

    if (object.state !== "interacted") {
      if (object.relatedObjectIds.length > 0) {
        console.log(
          "[WorkerSandbox] Interacting with related objects:",
          object.relatedObjectIds
        );
        object.relatedObjectIds.forEach((relatedId) => {
          const relatedObject = this.stageObjects.get(relatedId);
          if (!relatedObject) return;

          if (relatedObject.isCollectible) {
            const key = character.inventory.find(
              (item) => item.id === relatedId
            );
            if (!key) {
              console.log(
                "[WorkerSandbox] Key not found in inventory:",
                relatedId
              );
              return;
            }
          }
          if (relatedObject.isInteractable) {
            relatedObject.state = "interacted";
          }
        });
      }
      object.state = "interacted";
    } else {
      console.log(
        "[WorkerSandbox] Target object has already been interacted with:",
        targetId
      );
    }
  }

  private collectAction(payload: any): void {
    const characterId = payload.characterId;
    const character = this.characters.get(characterId);
    if (!character) {
      console.log(
        "[WorkerSandbox] Collecting character not found:",
        characterId
      );
      throw new CharacterNotFound(`Character(id:${characterId}) not found`);
    }

    const targetId =
      payload.objectId === "front"
        ? this.getObjectIdAtFront(character)
        : payload.objectId;

    if (!targetId) {
      console.log("[WorkerSandbox] Collecting targetId not found");
      throw new ObjectNotFound(`targetId not found`);
    }

    const object = this.stageObjects.get(targetId);
    if (!object) {
      console.log("[WorkerSandbox] Collecting object not found:", targetId);
      throw new ObjectNotFound(`Object(id:${targetId}) not found`);
    }

    if (!object.isCollectible) {
      console.log(
        "[WorkerSandbox] Collecting object is not collectible:",
        targetId
      );
      throw new ObjectNotCollectible(
        `Object(id:${targetId}) is not collectible`
      );
    }

    character.collect(object);
    this.stageObjects.delete(object.id);
  }

  private getObjectIdAtFront(character: StageCharacter): string {
    const position = character.position;
    const direction = character.direction;

    const frontObjectPosition = this.getNewPosition(position, direction);
    console.log("[WorkerSandbox] Front object position:", frontObjectPosition);

    const object = Array.from(this.stageObjects.values()).find((obj) =>
      this.isSamePosition(obj.position, frontObjectPosition)
    );

    return object ? object.id : "";
  }

  private dropAction(payload: any): void {
    const {
      characterId: characterId,
      objectId: objectId,
      position: position,
    } = payload;
    const character = this.characters.get(characterId);
    if (!character) {
      console.log("[WorkerSandbox] Dropping character not found:", characterId);
      throw new CharacterNotFound(`Character(id:${characterId}) not found`);
    }

    const object = character.inventory.find((item) => item.id === objectId);
    if (!object) {
      console.log("[WorkerSandbox] Dropping object not found:", objectId);
      throw new ObjectNotFound(`Object(id:${objectId}) not found`);
    }

    character.drop(object);
    object.position = position;
    this.stageObjects.set(object.id, object);
  }

  private turnAction(payload: any): void {
    const { characterId: characterId, direction: direction } = payload;

    const character = this.characters.get(characterId);
    if (!character) {
      console.log("[WorkerSandbox] Turning character not found:", characterId);
      throw new CharacterNotFound(`Character(id:${characterId}) not found`);
    }

    character.direction = direction;
  }

  private logAction(payload: any): void {
    const { characterId, message } = payload;
    console.log(`[WorkerSandbox] ${characterId}: ${message}`);
  }

  private getNewPosition(currentPos: Position, direction: Direction): Position {
    switch (direction) {
      case Direction.UP:
        return { x: currentPos.x, y: currentPos.y - 1 };
      case Direction.DOWN:
        return { x: currentPos.x, y: currentPos.y + 1 };
      case Direction.LEFT:
        return { x: currentPos.x - 1, y: currentPos.y };
      case Direction.RIGHT:
        return { x: currentPos.x + 1, y: currentPos.y };
      default:
        return currentPos;
    }
  }

  private isSamePosition(pos1: Position, pos2: Position): boolean {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  private getRenderDataSet(): EntityData[] {
    const renderDataSet: EntityData[] = [];

    const entities: Entity[] = [
      ...this.characters.values(),
      ...this.stageObjects.values(),
      ...this.stageTiles.values(),
    ];

    for (const entity of entities) {
      // const renderData: EntityData = {
      //   id: entity.id,
      //   typeId: entity.typeId,
      //   entityType: entity.entityType,
      //   position: entity.position,
      //   state: entity.state,
      //   color: entity.color,
      //   imageUrl: entity.imageUrl,
      //   relatedObjectIds: (entity as StageObject).relatedObjectIds,
      //   direction: (entity as Character).direction,
      //   inventory: (entity as Character).inventory,
      // };
      const renderData = entity.getRenderData();
      renderDataSet.push(renderData);
    }

    return renderDataSet;
  }
}
