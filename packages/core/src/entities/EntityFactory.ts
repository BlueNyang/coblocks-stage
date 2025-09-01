import {
  StageCharacterDefinition,
  EntityDefinition,
  StageObjectDefinition,
  TileDefinition,
} from "@/types/entity";
import { EntityType } from "@/types/common";
import { StageCharacter } from "./StageCharacter";
import { Entity } from "./base/Entity";
import { StageTile } from "./StageTile";
import { StageObject } from "./StageObject";
import { EntityData } from "@/types/stage";

export class EntityFactory {
  private static instance: EntityFactory;
  private registry: Map<string, EntityDefinition>;

  private constructor() {
    this.registry = new Map();
  }

  public static getInstance(): EntityFactory {
    if (!EntityFactory.instance) {
      EntityFactory.instance = new EntityFactory();
    }
    return EntityFactory.instance;
  }

  /**
   * Registers a new entity definition.
   * @param definition The entity definition to register.
   */
  public registerEntity(definition: EntityDefinition): void {
    if (!definition.typeId) {
      console.log("[Factory] registerEntity: Invalid entity definition");
      return;
    }

    if (this.registry.has(definition.typeId)) {
      console.log("[Factory] registerEntity: Entity type already registered");
      return;
    }

    this.registry.set(definition.typeId, definition);
  }

  /**
   * Creates a new entity instance.
   * @param typeId The type ID of the entity.
   * @param id The ID of the entity.
   * @param initPos The initial position of the entity.
   * @param initDirc The initial direction of the entity.
   * @returns The created entity instance or null if the definition is not found.
   */
  public create(typeId: string, data: EntityData): Entity | null {
    const def = this.registry.get(typeId);

    if (!def) {
      console.log("[Factory] create: Entity definition not found");
      return null;
    }

    switch (def.entityType) {
      case EntityType.CHARACTER:
        if (data.entityType !== EntityType.CHARACTER) return null;
        return new StageCharacter(
          data.id,
          def as StageCharacterDefinition,
          data.position,
          data.partNumber,
          data.color,
          data.imageSet,
          data.direction,
          data.state,
          data.inventory
        );
      case EntityType.OBJECT:
        if (data.entityType !== EntityType.OBJECT) return null;
        return new StageObject(
          data.id,
          def as StageObjectDefinition,
          data.position,
          data.color,
          data.imageSet,
          data.state,
          data.relatedObjectIds
        );
      case EntityType.TILE:
        if (data.entityType !== EntityType.TILE) return null;
        return new StageTile(data.id, def as TileDefinition, data.position);
      default:
        console.log("[Factory] create: Unknown entity type");
        return null;
    }
  }
}
