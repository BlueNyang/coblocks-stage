import { Character } from "@/types/character";
import { Position } from "./commonType";

/** Object state identifier */
export type ObjectState = string;
/** List of available object states */
export type StateList = ObjectState[];

export type StageObject = IInteractable | ICollectible;

/** Base interface for all game objects */
export interface BaseObject {
  readonly id: string;
  readonly type: string;
  readonly stateList?: StateList;
  readonly images?: Map<string, string>; // Map of state to image URL
  canPass: boolean;
  state: ObjectState;
  position: Position;

  setState(state: ObjectState): void;
  isValidState(state: ObjectState): boolean;
  isPosition(x: number, y: number): boolean;
  getImage(): string | null;
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
  readonly stateList?: StateList;
  state?: ObjectState;
  canPass?: boolean;
  images?: Map<string, string>; // Map of state to image URL
}

export function isInteractable(object: BaseObject): object is IInteractable {
  return "interact" in object && typeof object.interact === "function";
}

export function isCollectible(object: BaseObject): object is ICollectible {
  return "collect" in object && typeof object.collect === "function";
}
