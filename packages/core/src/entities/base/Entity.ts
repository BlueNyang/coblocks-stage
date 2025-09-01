import { Position, EntityType } from "@/types/common";
import { ImageSet } from "@/types/entity";
import { EntityData } from "@/types/stage";

export abstract class Entity {
  public readonly id: string;
  public readonly typeId: string;
  public readonly color: string;
  public readonly imageSet?: ImageSet;
  public abstract readonly entityType: EntityType;
  public abstract readonly isPassable: boolean;

  public position: Position;

  constructor(
    id: string,
    typeId: string,
    position: Position,
    color: string,
    imageSet?: ImageSet
  ) {
    this.id = id;
    this.typeId = typeId;
    this.position = position;
    this.color = color;
    this.imageSet = imageSet;
  }

  public abstract getRenderData(): EntityData;
}
