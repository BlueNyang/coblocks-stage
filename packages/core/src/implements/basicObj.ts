import type {
  ICollectible,
  IInteractable,
  InteractableObjectOptions,
  CollectibleObjectOptions,
  ObjectState,
  StateList,
} from "@/types/objects";
import { InvalidObjectStateError, CannotCollectError, CannotDropError } from "@/errors/objError";
import { Character } from "@/types/character";
import { ObjectCallbacks } from "@/types/callbacks";

/**
 * Object that can be interacted with by characters
 */
export class InteractableObject implements IInteractable {
  x: number;
  y: number;

  state: ObjectState = "default"; // Default state
  canPass: boolean = true;

  readonly id: string;
  readonly type: string;
  readonly relatedObjects: IInteractable[] = [];
  readonly stateList: StateList;
  readonly callbacks: ObjectCallbacks;

  constructor(options: InteractableObjectOptions) {
    this.id = options.id;
    this.type = options.type;
    this.relatedObjects = options.relatedObjects;
    this.stateList = options.stateList || [];
    this.callbacks = options.callbacks || ({} as ObjectCallbacks);

    this.x = options.x;
    this.y = options.y;

    this.state = options.state || "default";
    this.canPass = options.canPass || true;
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
    return this.stateList && this.stateList.includes(state);
  }

  getImage(): any | null {
    console.warn("getImage() method should be overridden in subclasses");
    return null;
  }

  getIcon(): any | null {
    console.warn("getIcon() method should be overridden in subclasses");
    return null;
  }

  isPassable(_character: Character): boolean {
    return this.canPass;
  }

  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      state: this.state,
    };
  }

  interact(): void {
    this.relatedObjects.forEach((obj) => {
      if (typeof obj.interact === "function") {
        obj.interact();
      }
    });

    console.warn(`${this.type} object should override interact() method for custom behavior`);
  }
}

/**
 * Object that can be collected by characters
 */
export class CollectibleObject implements ICollectible {
  x: number;
  y: number;
  canPass: boolean;
  state: string;
  collected: boolean;

  readonly id: string;
  readonly type: string;
  readonly stateList: StateList;
  readonly callbacks: ObjectCallbacks;

  constructor(options: CollectibleObjectOptions) {
    this.id = options.id;
    this.type = options.type;
    this.stateList = options.stateList || [];
    this.callbacks = options.callbacks || ({} as ObjectCallbacks);

    this.x = options.x;
    this.y = options.y;
    this.canPass = options.canPass || true;
    this.state = options.state || "default";
    this.collected = options.collected || false;
  }

  setState(state: ObjectState): void {
    if (this.isValidState(state)) {
      this.state = state;
    } else {
      console.warn(`Invalid state: ${state} for object type: ${this.type}`);
      throw new InvalidObjectStateError(`Invalid state: ${state} for object type: ${this.type}`);
    }
  }

  isValidState(state: ObjectState): boolean {
    return this.stateList.includes(state);
  }

  getImage(): any | null {
    console.warn("getImage() method should be overridden in subclasses");
    return null;
  }

  getIcon(): any | null {
    console.warn("getIcon() method should be overridden in subclasses");
    return null;
  }

  isPassable(character: Character): boolean {
    // This method can be customized based on character properties
    console.warn("isPassable() method should be overridden in subclasses");
    return this.canPass;
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
    this.x = x;
    this.y = y;
    console.log(`${character.name} dropped ${this.type} at (${x}, ${y})`);
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
      x: this.x,
      y: this.y,
      state: this.state,
      collected: this.collected,
    };
  }
}
