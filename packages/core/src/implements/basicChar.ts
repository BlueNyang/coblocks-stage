import { InteractableObject } from "@/implements/basicObj";
import { Character, CharacterDirection, CharacterOptions } from "@/types/character";
import { Position } from "@/types/commonType";

export class BasicCharacter implements Character {
  readonly id: number;
  readonly name: string;
  inventory: string[];
  position: { x: number; y: number };
  direction: CharacterDirection;
  executionCode?: string;

  constructor(
    id: number,
    options: CharacterOptions,
    position: Position,
    direction: CharacterDirection
  ) {
    this.id = id;
    this.name = options.name;
    this.inventory = [];
    this.position = position || { x: 0, y: 0 };
    this.direction = direction || CharacterDirection.UP;
  }

  static fromObject(object: any): BasicCharacter {
    return new BasicCharacter(
      object.id,
      {
        id: object.id,
        name: object.name,
      },
      object.position,
      object.direction
    );
  }

  addToInventory(itemId: string): void {
    this.inventory.push(itemId);
  }

  removeFromInventory(itemId: string): void {
    this.inventory = this.inventory.filter((id) => id !== itemId);
  }

  setDirection(direction: CharacterDirection): void {
    this.direction = direction;
  }

  moveTo(x: number, y: number): void {
    this.position = { x, y };
  }

  isPosition(x: number, y: number): boolean {
    return this.position.x === x && this.position.y === y;
  }

  interactWith(object: InteractableObject): void {
    object.interact(this);
  }

  getInventory(): string[] {
    return this.inventory;
  }

  getPosition(): { x: number; y: number } {
    return this.position;
  }

  getDirection(): CharacterDirection {
    return this.direction;
  }

  setExecutionCode(code: string): void {
    this.executionCode = code;
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
