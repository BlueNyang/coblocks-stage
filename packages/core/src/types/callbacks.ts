import { Character } from "./character";
import { BaseObject, ObjectState } from "./objects";

/** Callback types for object behaviors */

export type ImageProvider = (object: BaseObject) => any | null;
export type IconProvider = (object: BaseObject) => any | null;
export type PassabilityChecker = (
  object: BaseObject,
  character: Character
) => boolean;
export type InteractionHandler = (
  object: BaseObject,
  character: Character
) => void;
export type StateChangeHandler = (
  object: BaseObject,
  oldState: ObjectState,
  newState: ObjectState
) => void;
export type CollectionHandler = (
  object: BaseObject,
  character: Character
) => void;
export type DropHandler = (
  object: BaseObject,
  character: Character,
  x: number,
  y: number
) => void;

/**
 * Callbacks for object behaviors
 */
export interface ObjectCallbacks {
  onGetImage?: ImageProvider;
  onGetIcon?: IconProvider;
  onIsPassable?: PassabilityChecker;
  onStateChange?: StateChangeHandler;
}

export interface InteractableObjectCallbacks extends ObjectCallbacks {
  onInteract?: InteractionHandler;
}

export interface CollectibleObjectCallbacks extends ObjectCallbacks {
  onCollect?: CollectionHandler;
  onDrop?: DropHandler;
}
