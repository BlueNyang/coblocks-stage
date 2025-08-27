import type {
  ICollectible,
  IInteractable,
  ObjectOptions,
  ObjectState,
  StateList,
} from "@/types/objects";
import { InvalidObjectStateError, CannotCollectError, CannotDropError } from "@/errors/objError";
import { Character } from "@/types/character";
import { Position } from "@/types/commonType";

/**
 * Object that can be interacted with by characters
 */
export class InteractableObject implements IInteractable {
  position: Position;
  state: ObjectState = "default"; // Default state
  canPass: boolean = true;

  readonly id: string;
  readonly type: string;
  readonly relatedObjects: IInteractable[] = [];
  readonly stateList: StateList;
  readonly images?: Map<string, string>;

  constructor(
    id: string,
    options: ObjectOptions,
    position: Position,
    relatedObjects: IInteractable[]
  ) {
    this.id = id;
    this.type = options.type;
    this.stateList = options.stateList || [];
    this.images = options.images;
    this.state = options.state || "default";
    this.canPass = options.canPass || true;

    this.position = position;
    this.relatedObjects = relatedObjects;
  }

  setState(newState: ObjectState): void {
    if (this.isValidState(newState)) {
      this.state = newState;
    } else {
      console.warn(`Invalid state: ${newState} for object type: ${this.type}`);
      throw new InvalidObjectStateError(`Invalid state: ${newState} for object type: ${this.type}`);
    }
  }

  isValidState(state: ObjectState): boolean {
    return this.stateList.includes(state);
  }

  isPosition(x: number, y: number): boolean {
    return this.position.x === x && this.position.y === y;
  }

  getImage(): string | null {
    return this.images?.get(this.state) || null;
  }

  interact(character: Character): void {
    this.relatedObjects.forEach((obj) => {
      if (typeof obj.interact === "function") {
        obj.interact(character);
      }
    });
  }

  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      state: this.state,
      relatedObjects: this.relatedObjects.map((obj) => obj.id),
    };
  }
}

/**
 * Object that can be collected by characters
 */
export class CollectibleObject implements ICollectible {
  position: Position;
  canPass: boolean;
  state: string;
  collected: boolean;

  readonly id: string;
  readonly type: string;
  readonly stateList: StateList;
  readonly images?: Map<string, string>;

  constructor(id: string, options: ObjectOptions, position: Position, collected: boolean) {
    this.id = id;
    this.type = options.type;
    this.stateList = options.stateList || [];
    this.images = options.images;
    this.canPass = options.canPass || true;
    this.state = options.state || "default";

    this.position = position;
    this.collected = collected;
  }

  setState(state: ObjectState): void {
    if (this.isValidState(state)) {
      const oldState = this.state;
      this.state = state;
    } else {
      console.warn(`Invalid state: ${state} for object type: ${this.type}`);
      throw new InvalidObjectStateError(`Invalid state: ${state} for object type: ${this.type}`);
    }
  }

  isValidState(state: ObjectState): boolean {
    return this.stateList.includes(state);
  }

  isPosition(x: number, y: number): boolean {
    return this.position.x === x && this.position.y === y;
  }

  getImage(): string | null {
    return this.images?.get(this.state) || null;
  }

  collect(character: Character): void {
    if (this.isCollected()) {
      console.warn(`${this.type} is already collected.`);
      throw new CannotCollectError(`${this.type} is already collected.`);
    }

    this.setCollected(true);
    character.addToInventory(this.id);
  }

  drop(character: Character, x: number, y: number): void {
    if (!this.isCollected()) {
      console.warn(`${this.type} is not collected and cannot be dropped.`);
      throw new CannotDropError(`${this.type} is not collected and cannot be dropped.`);
    }

    this.setCollected(false);
    // Remove the object from the character's inventory
    character.removeFromInventory(this.id);
    this.position = { x, y };
  }

  isCollected(): boolean {
    return this.collected;
  }

  setCollected(collected: boolean): void {
    this.collected = collected;
  }

  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      state: this.state,
      collected: this.collected,
    };
  }
}
