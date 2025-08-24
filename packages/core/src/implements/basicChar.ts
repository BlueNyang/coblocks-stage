import { InteractableObject } from "@/implements/basicObj";
import { ObjectID } from "@/types/objects";
import {
  Character,
  CharacterDirection,
  CharacterOptions,
} from "@/types/character";

export class BasicCharacter implements Character {
  readonly id: number;
  readonly name: string;
  inventory: ObjectID[];
  position: { x: number; y: number };
  direction: CharacterDirection;

  constructor(id: number, options: CharacterOptions) {
    this.id = id;
    this.name = options.name;
    this.inventory = [];
    this.position = options.position || { x: 0, y: 0 };
    this.direction = options.direction || CharacterDirection.UP;
  }

  static fromObject(object: any): BasicCharacter {
    return new BasicCharacter(object.id, {
      id: object.id,
      name: object.name,
      inventory: object.inventory,
      position: object.position,
      direction: object.direction,
    });
  }

  addToInventory(itemId: ObjectID): void {
    this.inventory.push(itemId);
  }

  removeFromInventory(itemId: ObjectID): void {
    this.inventory = this.inventory.filter((id) => id !== itemId);
  }

  setDirection(direction: CharacterDirection): void {
    this.direction = direction;
  }

  moveTo(x: number, y: number): void {
    this.position = { x, y };
  }

  interactWith(object: InteractableObject): void {
    object.interact(this);
  }

  getInventory(): ObjectID[] {
    return this.inventory;
  }

  getPosition(): { x: number; y: number } {
    return this.position;
  }

  getDirection(): CharacterDirection {
    return this.direction;
  }

  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      inventory: this.inventory,
      position: this.position,
      direction: this.direction,
    };
  }
}
