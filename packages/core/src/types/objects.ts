import { Character } from "@/types/character";

/**
 * @type ObjectState
 * @description Object State Type for representing the state of an object
 * @author [BlueNyang]
 */
export type ObjectState = string;

/**
 * @type StateList
 * @description List of states for objects, mapping state names to their values
 * @author [BlueNyang]
 */
export type StateList = ObjectState[];

/**
 * @type ObjectID
 * @description Unique identifier for objects in the game world
 * @author [BlueNyang]
 */
export type ObjectID = string;

/**
 * @interface BaseObject
 * @description Base Object Interface for defining the structure of stage objects
 * @author [BlueNyang]
 * @property id - Unique identifier for the object
 * @property type - Type of the object (e.g., 'tree', 'rock')
 * @property x - X coordinate of the object
 * @property y - Y coordinate of the object
 * @property state - Current state of the object
 * @property canPass - Indicates if the object can be passed by a character
 *
 * @property setState - Method to set a new state for the object
 * @property isValidState - Method to check if a state is valid for the object
 * @property getImage - Method to get the image associated with the object
 * @property getIcon - Method to get the icon associated with the object
 * @property isPassable - Method to check if the object is passable by a character
 * @property toJSON - Method to convert the object to a JSON representation
 * @property fromJSON - Method to create a BaseObject instance from a JSON representation
 * @example
 * const myObject: BaseObject = {
 *   id: 'object1',
 *   type: 'tree',
 *   x: 100,
 *   y: 200,
 *   state: 'default'
 * };
 */
export interface BaseObject {
  readonly id: string;
  readonly type: string;
  readonly stateList?: StateList;
  canPass: boolean;
  state: ObjectState;
  x: number;
  y: number;

  setState: (state: ObjectState) => void; // Sets the state of the object
  isValidState: (state: ObjectState) => boolean;
  getImage: () => any | null; // 실제 이미지 타입에 따라 변경 (예: HTMLImageElement | null)
  getIcon: () => any | null; // 실제 아이콘 타입에 따라 변경
  isPassable: (character: Character) => boolean; // character 타입에 따라 변경
  toJSON: () => object;
}

/**
 * @interface IInteractable
 * @description Interactable Interface for defining objects that can be interacted with
 * @author [BlueNyang]
 * @property relatedObjects - Array of related objects that can be interacted with
 * @property interact - Method to interact with the object
 * @example
 *  const myObject: IInteractable = {
 *    relatedObjects: [],
 *    interact(character: Character) {
 *      console.log(`${character.name} interacts with the object.`);
 *    }
 *  };
 */
export interface IInteractable extends BaseObject {
  /**
   * @method interact
   * @description Method to handle interaction with the object
   * @author [BlueNyang]
   * @param character Character - The character interacting with the object
   * @return void
   * @example
   * myObject.interact(character);
   */

  readonly relatedObjects: IInteractable[];

  interact: () => void;
}

/**
 * @interface ICollectible
 * @description Collectible Interface for defining objects that can be collected
 * @author [BlueNyang]
 * @property collected - Indicates whether the object has been collected
 * @property collect - Method to collect the object
 * @property drop - Method to drop the object
 * @property isCollected - Method to check if the object has been collected
 * @property setCollected - Method to set the collected state of the object
 */
export interface ICollectible extends BaseObject {
  collected: boolean;

  collect: (character: Character) => void;
  drop: (character: Character, x: number, y: number) => void;
  isCollected: () => boolean;
  setCollected: (collected: boolean) => void;
}

/**
 * @type ObjectOptions
 * @description Options for creating a whole object
 * @author [BlueNyang]
 * @property id - Unique identifier for the object
 * @property type - Type of the object (e.g., 'tree', 'rock')
 * @property x - X coordinate of the object
 * @property y - Y coordinate of the object
 * @property state - Optional state of the object, defaults to a predefined state
 * @property canPass - Optional flag indicating if the object can be passed through, defaults to true
 * @example
 * const options: ObjectOptions = {
 *   id: 'object1',
 *   type: 'tree',
 *   x: 100,
 *   y: 200,
 *   state: 'default',
 *   canPass: true
 * }
 */
export interface ObjectOptions {
  readonly id: string;
  readonly type: string;
  readonly x: number;
  readonly y: number;
  readonly stateList?: StateList; // Optional, defaults to an empty array
  state?: ObjectState; // Optional, defaults to a predefined state
  canPass?: boolean; // Optional, defaults to true
}

/**
 * @interface InteractableObjectOptions
 * @description Options for creating an InteractableObject
 * @author [BlueNyang]
 * @property relatedObjects - Array of related objects that can be interacted with
 * @example
 * const interactableOptions: InteractableObjectOptions = {
 *  id: 'interactable1',
 *  type: 'button',
 *  x: 200,
 *  y: 300,
 *  stateList: ['default', 'pressed'],
 *  state: 'default',
 *  canPass: true,
 *  relatedObjects: []
 * };
 */
export interface InteractableObjectOptions extends ObjectOptions {
  readonly relatedObjects: IInteractable[]; // Optional, defaults to an empty array
}

/**
 * @interface CollectibleObjectOptions
 * @description Options for creating a CollectibleObject
 * @author [BlueNyang]
 * @property collected - Indicates whether the object has been collected, defaults to false
 * @example
 * const collectibleOptions: CollectibleObjectOptions = {
 *  id: 'collectible1',
 *  type: 'coin',
 *  x: 150,
 *  y: 250,
 *  stateList: ['default', 'collected'],
 *  state: 'default',
 *  canPass: true,
 *  collected: false
 * };
 */
export interface CollectibleObjectOptions extends ObjectOptions {
  collected?: boolean; // Optional, defaults to false
}

/**
 * @type ObjectConstructor
 * @description Constructor type for creating BaseObject instances
 * @author [BlueNyang]
 * @param options - Options for creating the object
 * @returns A new instance of BaseObject
 * @example
 * const myObject: BaseObject = new MyObjectConstructor({
 *  id: 'object1',
 *  type: 'tree',
 *  x: 100,
 *  y: 200,
 *  state: 'default'
 * });
 */
export type ObjectConstructor<T extends ObjectOptions = ObjectOptions> = new (
  options: T
) => BaseObject;
