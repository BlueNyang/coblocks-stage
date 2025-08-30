import { EntityType, Position, RenderData } from "@/types/common";
import { Entity } from "./base/Entity";
import { TileDefinition } from "@/types/entity";

export class StageTile extends Entity {
  public override readonly entityType: EntityType = EntityType.TILE;
  public override readonly isPassable: boolean;
  public color: string;

  constructor(
    id: string,
    definition: TileDefinition,
    position: Position,
    state?: string
  ) {
    super(id, definition.typeId, position);
    this.isPassable = definition.isPassable;
    this.color = definition.color;
    this.state = state || "default";
  }

  public override getRenderData(): RenderData {
    return {
      id: this.id,
      typeId: this.typeId,
      entityType: this.entityType,
      position: this.position,
      state: this.state,
    };
  }
}
