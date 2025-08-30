import { EntityType, Position, RenderData } from "@/types/common";
import { StageObjectDefinition } from "@/types/entity";
import { Entity } from "./base/Entity";

export class StageObject extends Entity {
  public override readonly entityType: EntityType = EntityType.OBJECT;
  public override isPassable: boolean;
  public color: string;
  public isInteractable: boolean;
  public isCollectible: boolean;
  public relatedObjectIds: string[];

  constructor(id: string, definition: StageObjectDefinition, position: Position, state?: string) {
    super(id, definition.typeId, position);
    this.color = definition.color;
    this.isInteractable = definition.isInteractable;
    this.isCollectible = definition.isCollectible;
    this.isPassable = definition.isPassable;
    this.relatedObjectIds = definition.relatedObjectIds;

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
