import { Position } from "@/types/commonType";
import { BaseTile, TileOptions } from "@/types/tiles";

export class PassableTile implements BaseTile {
  readonly id: string;
  readonly type: string;
  readonly position: Position;
  readonly image: any | null;
  readonly color: any | null;
  readonly canPass: boolean = true;

  constructor(id: string, options: TileOptions, position: Position) {
    this.id = id;
    this.type = options.type;
    this.image = options.image;
    this.color = options.color;
    this.position = position;
  }

  getImage(): any | null {
    return this.image;
  }

  getColor(): any | null {
    return this.color;
  }

  isPosition(x: number, y: number): boolean {
    return this.position.x === x && this.position.y === y;
  }

  isPassable(): boolean {
    return this.canPass; // Default implementation
  }

  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      canPass: this.canPass,
    };
  }
}

export class UnpassableTile implements BaseTile {
  readonly id: string;
  readonly type: string;
  readonly position: Position;
  readonly image: any | null;
  readonly color: any | null;
  readonly canPass: boolean = false;

  constructor(id: string, options: TileOptions, position: Position) {
    this.id = id;
    this.type = options.type;
    this.image = options.image;
    this.color = options.color;
    this.position = position;
  }

  getImage(): any | null {
    return this.image;
  }

  getColor(): any | null {
    return this.color;
  }

  isPosition(x: number, y: number): boolean {
    return this.position.x === x && this.position.y === y;
  }

  isPassable(): boolean {
    return this.canPass; // Default implementation
  }

  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      canPass: this.canPass,
    };
  }
}
