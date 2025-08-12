import { Character } from "@/types/character";

/** Unique tile identifier */
export type TileID = string;

/** Constructor type for creating BaseTile instances */
export type TileConstructor<T extends BaseTile> = (id: string, options: TileOptions) => T;

/** Base interface for all game tiles */
export interface BaseTile {
  readonly type: string;
  canPass: boolean;
  x: number;
  y: number;

  getImage(): any | null;
  getColor(): any | null;
  isPassable(): boolean;
  toJSON(): object;
}

/** Configuration options for creating tiles */
export interface TileOptions {
  readonly type: string;
  readonly x: number;
  readonly y: number;
  readonly image: any | null;
  readonly color?: any | null;
}
