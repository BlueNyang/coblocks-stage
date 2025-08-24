import { Character } from "@/types/character";

/** Object state identifier */
export type ObjectState = string;
/** List of available object states */
export type StateList = ObjectState[];
/** Unique object identifier */
export type ObjectID = string;

export type StageObjects = IInteractable | ICollectible;
export type StageObjectOptions =
  | InteractableObjectOptions
  | CollectibleObjectOptions;

/** Constructor type for creating BaseObject instances */
export type ObjectConstructor<T extends ObjectOptions> = (
  id: string,
  options: T
) => BaseObject;

/** Base interface for all game objects */
export interface BaseObject {
  readonly id: string;
  readonly type: string;
  readonly stateList?: StateList;
  readonly images?: Map<string, string>; // Map of state to image URL
  canPass: boolean;
  state: ObjectState;
  x: number;
  y: number;

  setState(state: ObjectState): void;
  isValidState(state: ObjectState): boolean;
  getImage(): string | null;
  isPassable(character: Character): boolean;
  toJSON(): object;
}

/** Objects that can be interacted with */
export interface IInteractable extends BaseObject {
  readonly relatedObjects: IInteractable[];
  interact(character: Character): void;
}

/** Objects that can be collected */
export interface ICollectible extends BaseObject {
  collected: boolean;

  collect(character: Character): void;
  drop(character: Character, x: number, y: number): void;
  isCollected(): boolean;
  setCollected(collected: boolean): void;
}

/** Configuration options for creating objects */
export interface ObjectOptions {
  readonly type: string;
  readonly x: number;
  readonly y: number;
  readonly stateList?: StateList;
  state?: ObjectState;
  canPass?: boolean;
  images?: Map<string, string>; // Map of state to image URL
}

/** Configuration for interactable objects */
export interface InteractableObjectOptions extends ObjectOptions {
  readonly relatedObjects: IInteractable[];
}

/** Configuration for collectible objects */
export interface CollectibleObjectOptions extends ObjectOptions {
  collected?: boolean;
}

export function isInteractable(object: BaseObject): object is IInteractable {
  return "interact" in object && typeof object.interact === "function";
}

export function isCollectible(object: BaseObject): object is ICollectible {
  return "collect" in object && typeof object.collect === "function";
}
