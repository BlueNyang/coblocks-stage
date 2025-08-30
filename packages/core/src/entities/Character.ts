import { Direction, EntityType, Position, RenderData } from "@/types/type";
import { Entity } from "./base/Entity";
import { CharacterDefinition } from "@/types/entity";

export class Character extends Entity {
  public readonly entityType: EntityType = EntityType.CHARACTER;
  public direction: Direction = Direction.DOWN;
  public color: string;
  public partNumber: number;
  public inventory: string[];

  constructor(
    id: string,
    definition: CharacterDefinition,
    position: Position,
    direction?: Direction,
    state?: string
  ) {
    super(id, definition.typeId, position);
    this.direction = direction || Direction.DOWN;
    this.color = definition.color;
    this.partNumber = definition.partNumber;
    this.state = state || "default";
    this.inventory = [];
  }

  public getRenderData(): RenderData {
    return {
      id: this.id,
      typeId: this.typeId,
      entityType: this.entityType,
      position: this.position,
      state: this.state,
    };
  }
}
