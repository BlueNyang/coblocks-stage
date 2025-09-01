import { EntityType, Position } from "@/types/common";
import { ImageSet, StageObjectDefinition } from "@/types/entity";
import { Entity } from "./base/Entity";
import { EntityData } from "@/types/stage";

export class StageObject extends Entity {
  public override readonly entityType: EntityType = EntityType.OBJECT;
  public state: string = "default";
  public override isPassable: boolean;
  public isInteractable: boolean;
  public isCollectible: boolean;
  public relatedObjectIds: string[];

  constructor(
    id: string,
    definition: StageObjectDefinition,
    position: Position,
    color: string,
    imageSet?: ImageSet,
    state?: string,
    relatedObjectIds?: string[]
  ) {
    super(id, definition.typeId, position, color, imageSet);
    this.isInteractable = definition.isInteractable;
    this.isCollectible = definition.isCollectible;
    this.isPassable = definition.isPassable;
    this.relatedObjectIds = relatedObjectIds || [];

    this.state = state || "default";
  }

  public override getRenderData(): EntityData {
    return {
      entityType: EntityType.OBJECT,
      id: this.id,
      typeId: this.typeId,
      position: this.position,
      state: this.state,
      color: this.color,
      imageSet: this.imageSet,
      relatedObjectIds: this.relatedObjectIds,
    };
  }
}
