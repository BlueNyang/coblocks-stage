import { EntityType, Position, RenderData } from "@/types/type";
import { StageObjectDefinition } from "@/types/entity";
import { Entity } from "./base/Entity";

export class StageObject extends Entity {
  public override entityType: EntityType = EntityType.OBJECT;
  public color: string;
  public isInteractable: boolean;
  public isCollectible: boolean;

  constructor(
    id: string,
    definition: StageObjectDefinition,
    position: Position,
    state?: string
  ) {
    super(id, definition.typeId, position);
    this.color = definition.color;
    this.isInteractable = definition.isInteractable;
    this.isCollectible = definition.isCollectible;

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
