import { Position } from "./commonType";

/** Unique tile identifier */
export type TileID = string;

/** Constructor type for creating BaseTile instances */
export type TileConstructor<T extends BaseTile> = (id: string, options: TileOptions) => T;

/** Base interface for all game tiles */
export interface BaseTile {
  readonly id: TileID;
  readonly type: string;
  canPass: boolean;
  position: Position;

  getImage(): any | null;
  getColor(): any | null;
  isPosition(x: number, y: number): boolean;
  isPassable(): boolean;
  toJSON(): object;
}

/** Configuration options for creating tiles */
export interface TileOptions {
  readonly type: string;
  readonly image: any | null;
  readonly color: any | null;
}
