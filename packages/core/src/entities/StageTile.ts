import { EntityType, Position } from "@/types/common";
import { Entity } from "./base/Entity";
import { TileDefinition } from "@/types/entity";
import { EntityData } from "@/types/stage";

export class StageTile extends Entity {
  public override readonly entityType: EntityType = EntityType.TILE;
  public override readonly isPassable: boolean;

  constructor(id: string, definition: TileDefinition, position: Position) {
    super(
      id,
      definition.typeId,
      position,
      definition.color,
      definition.imageUrl
    );
    this.isPassable = definition.isPassable;
  }

  public override getRenderData(): EntityData {
    return {
      entityType: EntityType.TILE,
      id: this.id,
      typeId: this.typeId,
      position: this.position,
    };
  }
}
