import { Position, EntityType, RenderData } from "@/types/common";

export abstract class Entity {
  public readonly id: string;
  public readonly typeId: string;
  public abstract readonly entityType: EntityType;
  public abstract readonly isPassable: boolean;

  public position: Position;
  public state: string = "default";

  constructor(id: string, typeId: string, position: Position) {
    this.id = id;
    this.typeId = typeId;
    this.position = position;
  }

  public abstract getRenderData(): RenderData;
}
