import { Direction, EntityType, Position, RenderData } from "@/types/common";
import { Entity } from "./base/Entity";
import { CharacterDefinition } from "@/types/entity";
import { StageObject } from "./StageObject";

export class Character extends Entity {
  public override readonly entityType: EntityType = EntityType.CHARACTER;
  public override readonly isPassable: boolean = false;
  public direction: Direction = Direction.DOWN;
  public color: string;
  public partNumber: number;
  public inventory: StageObject[];

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

  public move(direction: Direction): void {
    switch (direction) {
      case Direction.UP:
        this.position.y -= 1;
        break;
      case Direction.DOWN:
        this.position.y += 1;
        break;
      case Direction.LEFT:
        this.position.x -= 1;
        break;
      case Direction.RIGHT:
        this.position.x += 1;
        break;
    }
  }

  public collect(object: StageObject): void {
    this.inventory.push(object);
  }

  public drop(object: StageObject): void {
    const index = this.inventory.indexOf(object);
    if (index > -1) {
      this.inventory.splice(index, 1);
    }
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
