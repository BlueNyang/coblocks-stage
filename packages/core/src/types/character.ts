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
  interactWith(objectId: ObjectID): void;
  getInventory(): ObjectID[];
  getPosition(): { x: number; y: number };
  getDirection(): CharacterDirection;
  toJSON(): object;
  fromJSON(data: object): void;
}

/** Character movement directions */
export enum CharacterDirection {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}
