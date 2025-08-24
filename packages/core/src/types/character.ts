import { BasicCharacter } from "@/implements/basicChar";
import { InteractableObject } from "@/implements/basicObj";
import { ObjectID } from "@/types/objects";

/**
 * Character interface for game interactions
 */
export interface Character {
  readonly id: number;
  readonly name: string;
  inventory: ObjectID[];
  position: { x: number; y: number };
  direction: CharacterDirection;

  addToInventory(itemId: ObjectID): void;
  removeFromInventory(itemId: ObjectID): void;
  setDirection(direction: CharacterDirection): void;
  moveTo(x: number, y: number): void;
  interactWith(objectId: InteractableObject): void;
  getInventory(): ObjectID[];
  getPosition(): { x: number; y: number };
  getDirection(): CharacterDirection;
  toJSON(): object;
}

/** Character movement directions */
export enum CharacterDirection {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

export interface CharacterOptions {
  readonly id: number;
  readonly name: string;
  inventory?: ObjectID[];
  position?: { x: number; y: number };
  direction?: CharacterDirection;
}

export type CharacterConstructor = (
  id: number,
  options: CharacterOptions
) => Character;
