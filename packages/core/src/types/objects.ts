import { Character } from "@/types/character";
import { ObjectCallbacks } from "@/types/callbacks";

/** Object state identifier */
export type ObjectState = string;

/** List of available object states */
export type StateList = ObjectState[];

/** Unique object identifier */
export type ObjectID = string;

/** Base interface for all game objects */
export interface BaseObject {
  readonly id: string;
  readonly type: string;
  readonly stateList?: StateList;
  readonly callbacks?: ObjectCallbacks;
  canPass: boolean;
  state: ObjectState;
  x: number;
  y: number;

  setState(state: ObjectState): void;
  isValidState(state: ObjectState): boolean;
  getImage(): any | null;
  getIcon(): any | null;
  isPassable(character: Character): boolean;
  toJSON(): object;
}

/** Objects that can be interacted with */
export interface IInteractable extends BaseObject {
  readonly relatedObjects: IInteractable[];
  interact(): void;
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
  readonly id: string;
  readonly type: string;
  readonly x: number;
  readonly y: number;
  readonly stateList?: StateList;
  readonly callbacks?: ObjectCallbacks;
  state?: ObjectState;
  canPass?: boolean;
}

/** Configuration for interactable objects */
export interface InteractableObjectOptions extends ObjectOptions {
  readonly relatedObjects: IInteractable[];
}

/** Configuration for collectible objects */
export interface CollectibleObjectOptions extends ObjectOptions {
  collected?: boolean;
}

/** Constructor type for creating BaseObject instances */
export type ObjectConstructor<T extends ObjectOptions = ObjectOptions> = new (
  options: T
) => BaseObject;
