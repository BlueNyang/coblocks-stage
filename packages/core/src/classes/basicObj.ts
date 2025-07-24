import type {
  BaseObject,
  ICollectible,
  IInteractable,
  InteractableObjectOptions,
  CollectibleObjectOptions,
  ObjectState,
  StateList,
} from "@/types/objects";
import { Character } from "@/types/character";

/**
 * @description InteractableObject class that extends BaseObject and implements IInteractable.
 * It represents an object in the game world that can be interacted with by characters.
 * @author [BlueNyang]
 * @property {string} id - Unique identifier for the object
 * @property {string} type - Type of the object (e.g., 'tree', 'rock')
 * @property {number} x - X coordinate of the object
 * @property {number} y - Y coordinate of the object
 * @property {ObjectState[]} stateList - List of valid states for the object
 * @property {IInteractable[]} relatedObjects - Array of related objects that can be interacted with
 * @property {ObjectState} state - Current state of the object
 * @property {boolean} canPass - Indicates if the object can be passed through by characters
 * @implements {IInteractable}
 * @example
 * const interactableObject = new InteractableObject({
 *   id: 'button1',
 *   type: 'button',
 *   x: 100,
 *   y: 200,
 *   relatedObjects: []
 * }, {
 *   values: ['default', 'pressed']
 * });
 * interactableObject.interact();
 */
export class InteractableObject implements IInteractable {
  x: number;
  y: number;

  state: ObjectState = "default"; // Default state
  canPass: boolean = true;

  readonly id: string;
  readonly type: string;
  readonly relatedObjects: IInteractable[] = [];
  readonly stateList: ObjectState[];

  /**
   * @constructor
   * @param {InteractableObjectOptions} options - Options for creating the InteractableObject
   * @param {StateList} [stateList] - Optional state list, defaults to an empty array
   */
  constructor(options: InteractableObjectOptions) {
    this.id = options.id;
    this.type = options.type;
    this.relatedObjects = options.relatedObjects;
    this.stateList = options.stateList || [];

    this.x = options.x;
    this.y = options.y;

    this.state = options.state || "default"; // Default state if not provided
    this.canPass = options.canPass || true; // Default to true if not provided
  }

  /**
   * @description Sets a new state for the object if it is valid.
   * @author [BlueNyang]
   * @param {ObjectState} newState - The new state to set for the object
   * @throws {Error} If the new state is not valid for the object type
   * @example
   *  const success = interactableObject.setState('pressed');
   */
  setState(newState: ObjectState): void {
    if (this.isValidState(newState)) {
      this.state = newState;
    } else {
      console.warn(`Invalid state: ${newState} for object type: ${this.type}`);
      throw new Error(`Invalid state: ${newState} for object type: ${this.type}`);
    }
  }

  /**
   * @description Checks if the provided state is valid for this object.
   * @author [BlueNyang]
   * @param {ObjectState} state - The state to check for validity
   * @returns {boolean} True if the state is valid, false otherwise
   * @example
   *  const isValid = interactableObject.isValidState('pressed');
   */
  isValidState(state: ObjectState): boolean {
    return this.stateList && this.stateList.includes(state);
  }

  getImage(): any | null {
    return null;
  }
  getIcon(): any | null {
    return null;
  }

  /**
   * @description Checks if the object is passable by a character.
   * @author [BlueNyang]
   * @param {Character} _character - The character attempting to pass through the object
   * @returns {boolean} True if the object is passable, false otherwise
   * @example
   *  const canPass = interactableObject.isPassable(character);
   */
  isPassable(_character: Character): boolean {
    return this.canPass;
  }

  /**
   * @description Converts the object to a JSON representation.
   * @author [BlueNyang]
   * @returns {object} JSON representation of the object
   * @example
   *  const json = interactableObject.toJSON();
   *  console.log(json);
   */
  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      state: this.state,
    };
  }

  /**
   * @description Interacts with the object, triggering related objects' interact methods.
   * This method should be overridden by subclasses for custom behavior.
   * @author [BlueNyang]
   * @throws {Error} If the method is not overridden in a subclass
   * @example
   *  interactableObject.interact();
   */
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
 * @description CollectibleObject class that extends BaseObject and implements ICollectible.
 * It represents an object in the game world that can be collected by characters.
 * @author [BlueNyang]
 * @property {string} id - Unique identifier for the object
 * @property {string} type - Type of the object (e.g., 'coin', 'gem')
 * @property {boolean} canPass - Indicates if the object can be passed by a character
 * @property {ObjectState} state - Current state of the object
 * @property {number} x - X coordinate of the object
 * @property {number} y - Y coordinate of the object
 * @property {boolean} collected - Indicates if the object has been collected
 * @implements {ObjectOptions}
 * @implements {ICollectible}
 * @example
 * const collectibleObject = new CollectibleObject(
 *  {
 *    id: 'coin1',
 *    type: 'coin',
 *    x: 150,
 *    y: 250,
 *    canPass: true,
 *    state: 'default',
 *    collected: false
 *  });
 */
export class CollectibleObject implements ICollectible {
  x: number;
  y: number;
  canPass: boolean;
  state: string;
  collected: boolean;

  readonly id: string;
  readonly type: string;
  readonly stateList: ObjectState[];

  /**
   * @constructor
   * @param {CollectibleObjectOptions} options - Options for creating the CollectibleObject
   */
  constructor(options: CollectibleObjectOptions) {
    this.id = options.id;
    this.type = options.type;
    this.stateList = options.stateList || [];
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
      throw new Error(`Invalid state: ${state} for object type: ${this.type}`);
    }
  }

  isValidState(state: ObjectState): boolean {
    return this.stateList.includes(state);
  }

  getImage() {
    throw new Error("Method not implemented.");
  }

  getIcon() {
    throw new Error("Method not implemented.");
  }

  isPassable(character: Character): boolean {
    return this.canPass;
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

  collect(character: Character): void {
    this.collected = true;
    character.inventory.push(this.id);
  }

  drop(character: Character, x: number, y: number): void {
    throw new Error("Method not implemented.");
  }

  isCollected(): boolean {
    throw new Error("Method not implemented.");
  }
  setCollected(collected: boolean): void {
    throw new Error("Method not implemented.");
  }
}
