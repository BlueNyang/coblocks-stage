import { Position, EntityType } from "@/types/common";
import { EntityData } from "@/types/stage";

export abstract class Entity {
  public readonly id: string;
  public readonly typeId: string;
  public readonly color: string;
  public readonly imageUrl?: string;
  public abstract readonly entityType: EntityType;
  public abstract readonly isPassable: boolean;

  public position: Position;

  constructor(
    id: string,
    typeId: string,
    position: Position,
    color: string,
    imageUrl?: string
  ) {
    this.id = id;
    this.typeId = typeId;
    this.position = position;
    this.color = color;
    this.imageUrl = imageUrl;
  }

  public abstract getRenderData(): EntityData;
}
