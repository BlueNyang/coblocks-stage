import type {
  ICollectible,
  IInteractable,
  InteractableObjectOptions,
  CollectibleObjectOptions,
  ObjectState,
  StateList,
} from "@/types/objects";
import {
  InvalidObjectStateError,
  CannotCollectError,
  CannotDropError,
} from "@/errors/objError";
import { Character } from "@/types/character";
import {
  InteractableObjectCallbacks,
  CollectibleObjectCallbacks,
} from "@/types/callbacks";

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
  readonly callbacks: InteractableObjectCallbacks;

  constructor(id: string, options: InteractableObjectOptions) {
    this.id = id;
    this.type = options.type;
    this.relatedObjects = options.relatedObjects;
    this.stateList = options.stateList || [];
    this.callbacks = options.callbacks || ({} as InteractableObjectCallbacks);

    this.x = options.x;
    this.y = options.y;

    this.state = options.state || "default";
    this.canPass = options.canPass || true;
  }

  setState(newState: ObjectState): void {
    if (this.isValidState(newState)) {
      const oldState = this.state;
      this.state = newState;

      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this, oldState, newState);
      } else {
        console.warn(
          `State change callback not defined for object type: ${this.type}`
        );
      }
    } else {
      console.warn(`Invalid state: ${newState} for object type: ${this.type}`);
      throw new InvalidObjectStateError(
        `Invalid state: ${newState} for object type: ${this.type}`
      );
    }
  }

  isValidState(state: ObjectState): boolean {
    return this.stateList.includes(state);
  }

  getImage(): any | null {
    if (this.callbacks.onGetImage) {
      return this.callbacks.onGetImage(this);
    }
    return null;
  }

  getIcon(): any | null {
    if (this.callbacks.onGetIcon) {
      return this.callbacks.onGetIcon(this);
    }
    return null;
  }

  isPassable(_character: Character): boolean {
    if (this.callbacks.onIsPassable) {
      return this.callbacks.onIsPassable(this, _character);
    }
    return this.canPass;
  }

  interact(character: Character): void {
    this.relatedObjects.forEach((obj) => {
      if (typeof obj.interact === "function") {
        obj.interact(character);
      }
    });

    if (this.callbacks.onInteract) {
      this.callbacks.onInteract(this, character);
    }
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
  readonly callbacks: CollectibleObjectCallbacks;

  constructor(id: string, options: CollectibleObjectOptions) {
    this.id = id;
    this.type = options.type;
    this.stateList = options.stateList || [];
    this.callbacks = options.callbacks || ({} as CollectibleObjectCallbacks);

    this.x = options.x;
    this.y = options.y;
    this.canPass = options.canPass || true;
    this.state = options.state || "default";
    this.collected = options.collected || false;
  }

  setState(state: ObjectState): void {
    if (this.isValidState(state)) {
      const oldState = this.state;
      this.state = state;
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this, oldState, state);
      } else {
        console.warn(
          `State change callback not defined for object type: ${this.type}`
        );
      }
    } else {
      console.warn(`Invalid state: ${state} for object type: ${this.type}`);
      throw new InvalidObjectStateError(
        `Invalid state: ${state} for object type: ${this.type}`
      );
    }
  }

  isValidState(state: ObjectState): boolean {
    return this.stateList.includes(state);
  }

  getImage(): any | null {
    if (this.callbacks.onGetImage) {
      return this.callbacks.onGetImage(this);
    }
    return null;
  }

  getIcon(): any | null {
    if (this.callbacks.onGetIcon) {
      return this.callbacks.onGetIcon(this);
    }
    return null;
  }

  isPassable(character: Character): boolean {
    // This method can be customized based on character properties
    if (this.callbacks.onIsPassable) {
      return this.callbacks.onIsPassable(this, character);
    }
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
      throw new CannotDropError(
        `${this.type} is not collected and cannot be dropped.`
      );
    }

    this.setCollected(false);
    // Remove the object from the character's inventory
    character.removeFromInventory(this.id);
    this.x = x;
    this.y = y;

    if (this.callbacks.onDrop) {
      this.callbacks.onDrop(this, character, x, y);
    }
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
