import { EntityType } from "@/types/common";

/**
 * Base interface for all entities in the game.
 * All entities must have a typeId to identify their type.
 * @field typeId: The unique identifier for the entity type.
 * @field entityType: The category of the entity (character, object, tile).
 * @field color: The color of the entity.
 * @field isPassable: Whether the entity can be passed through.
 */
export interface BaseEntityDefinition {
  typeId: string;
  entityType: EntityType;
  isPassable: boolean;
}

/**
 * Character definition in the game.
 * @field direction: The current movement direction of the character.
 */
export interface StageCharacterDefinition extends BaseEntityDefinition {
  entityType: EntityType.CHARACTER;
}

/**
 * Object definition in the game.
 * @field isInteractable: Whether the object can be interacted with.
 * @field isCollectible: Whether the object can be collected.
 */
export interface StageObjectDefinition extends BaseEntityDefinition {
  entityType: EntityType.OBJECT;
  isInteractable: boolean;
  isCollectible: boolean;
}

/**
 * Tile definition in the game.
 */
export interface TileDefinition extends BaseEntityDefinition {
  entityType: EntityType.TILE;
  color: string;
  imageUrl?: string;
}

/**
 * Entity definition in the game.
 */
export type EntityDefinition =
  | StageCharacterDefinition
  | StageObjectDefinition
  | TileDefinition;
