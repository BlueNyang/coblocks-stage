import { InteractableObject, ObjectID } from "@/index";
import { Character, CharacterDirection, CharacterOptions } from "@/types/character";

export class BasicCharacter implements Character {
  readonly id: number;
  readonly name: string;
  inventory: ObjectID[];
  position: { x: number; y: number };
  direction: CharacterDirection;

  constructor(options: CharacterOptions) {
    this.id = options.id;
    this.name = options.name;
    this.inventory = [];
    this.position = options.position || { x: 0, y: 0 };
    this.direction = options.direction || CharacterDirection.UP;
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
    object.interact();
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
