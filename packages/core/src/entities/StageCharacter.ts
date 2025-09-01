import { Direction, EntityType, Position } from "@/types/common";
import { Entity } from "./base/Entity";
import { ImageSet, StageCharacterDefinition } from "@/types/entity";
import { StageObject } from "./StageObject";
import { EntityData } from "@/types/stage";

export class StageCharacter extends Entity {
  public override readonly entityType: EntityType = EntityType.CHARACTER;
  public override readonly isPassable: boolean = false;
  public direction: Direction = Direction.DOWN;
  public state: string = "default";
  public partNumber: number;
  public inventory: StageObject[];

  constructor(
    id: string,
    definition: StageCharacterDefinition,
    position: Position,
    partNumber: number,
    color: string,
    imageSet?: ImageSet,
    direction?: Direction,
    state?: string,
    inventory?: StageObject[]
  ) {
    super(id, definition.typeId, position, color, imageSet);
    this.direction = direction || Direction.DOWN;
    this.partNumber = partNumber;
    this.state = state || "default";
    this.inventory = inventory || [];
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

  public getRenderData(): EntityData {
    return {
      entityType: EntityType.CHARACTER,
      id: this.id,
      typeId: this.typeId,
      partNumber: this.partNumber,
      position: this.position,
      color: this.color,
      imageSet: this.imageSet,
      direction: this.direction,
      state: this.state,
      inventory: this.inventory,
    };
  }
}
