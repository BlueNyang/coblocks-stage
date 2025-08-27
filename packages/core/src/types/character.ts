import { InteractableObject } from "@/implements/basicObj";
import { Position } from "./commonType";

/**
 * Character interface for game interactions
 */
export interface Character {
  readonly id: number;
  readonly name: string;
  inventory: string[];
  position: Position;
  direction: CharacterDirection;
  executionCode?: string;

  addToInventory(itemId: string): void;
  removeFromInventory(itemId: string): void;
  setDirection(direction: CharacterDirection): void;
  moveTo(x: number, y: number): void;
  isPosition(x: number, y: number): boolean;
  interactWith(objectId: InteractableObject): void;
  getInventory(): string[];
  getPosition(): { x: number; y: number };
  getDirection(): CharacterDirection;
  setExecutionCode(code: string): void;
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
}

export type CharacterConstructor = (id: number, options: CharacterOptions) => Character;
