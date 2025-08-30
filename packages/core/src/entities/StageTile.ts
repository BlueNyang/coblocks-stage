import { EntityType, Position, RenderData } from "@/types/type";
import { Entity } from "./base/Entity";
import { TileDefinition } from "@/types/entity";

export class StageTile extends Entity {
  public override entityType: EntityType = EntityType.TILE;
  public color: string;

  constructor(
    id: string,
    definition: TileDefinition,
    position: Position,
    state?: string
  ) {
    super(id, definition.typeId, position);
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
