/**
 * Entity position in the stage.
 */
export type Position = {
  x: number;
  y: number;
};

/**
 * Character movement directions.
 */
export enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

/**
 * Entity types in the stage.
 */
export enum EntityType {
  CHARACTER = "character",
  OBJECT = "object",
  TILE = "tile",
}

/**
 * Object types in the stage.
 */
export enum StageObjectType {
  INTERACTABLE = "interactable",
  COLLECTIBLE = "collectible",
}
