import { ObjectID } from "@/types/objects";

/**
 * @description Chracter Class to be the subject of interactions in the running time.
 * @author [BlueNyang]
 * @property id - Unique identifier for the character
 * @property name - Name of the character
 * @property inventory - Array of collectable items the character has
 * @property position - Position of the character in the game world
 * @property direction - Direction the character is facing
 * @example
 * const character: Character = {
 *   id: 1,
 *   name: 'Hero',
 *   position: { x: 0, y: 0 },
 * };
 */
export interface Character {
  id: number;
  name: string;
  inventory: ObjectID[];
  position: { x: number; y: number };
  direction: CharacterDirection;
}

/**
 * @enum CharacterDirection
 * @description Enumeration for character movement directions
 * @author [BlueNyang]
 */
export enum CharacterDirection {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}
