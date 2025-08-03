import { BaseTile, TileOptions } from "@/types/tiles";

export class PassableTile implements BaseTile {
  readonly id: string;
  readonly type: string;
  readonly x: number;
  readonly y: number;
  readonly image: any | null;
  readonly color: any | null;
  readonly canPass: boolean = true;

  constructor(options: TileOptions) {
    this.id = options.id;
    this.type = options.type;
    this.x = options.x;
    this.y = options.y;
    this.image = options.image;
    this.color = options.color;
  }

  getImage(): any | null {
    return this.image;
  }

  getColor(): any | null {
    return this.color;
  }

  isPassable(): boolean {
    return this.canPass; // Default implementation
  }

  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      canPass: this.canPass,
    };
  }
}

export class UnpassableTile implements BaseTile {
  readonly id: string;
  readonly type: string;
  readonly x: number;
  readonly y: number;
  readonly image: any | null;
  readonly color: any | null;
  readonly canPass: boolean = false;

  constructor(options: TileOptions) {
    this.id = options.id;
    this.type = options.type;
    this.x = options.x;
    this.y = options.y;
    this.image = options.image;
    this.color = options.color;
  }

  getImage(): any | null {
    return this.image;
  }

  getColor(): any | null {
    return this.color;
  }

  isPassable(): boolean {
    return this.canPass; // Default implementation
  }

  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      canPass: this.canPass,
    };
  }
}