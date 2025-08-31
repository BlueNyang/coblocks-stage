import { StageObject } from "@/entities/StageObject";
import { Direction, EntityType, Position } from "./common";

export type CodeSet = {
  [key: string]: string;
};

export interface ObjectData {
  entityType: EntityType.OBJECT;
  id: string;
  typeId: string;
  position: Position;
  state?: string;
  color: string;
  imageUrl?: string;
  relatedObjectIds?: string[];
}

export interface StageCharacterData {
  entityType: EntityType.CHARACTER;
  id: string;
  partNumber: number;
  typeId: string;
  position: Position;
  color: string;
  imageUrl?: string;
  direction?: Direction;
  state?: string;
  inventory?: StageObject[];
}

export interface TileData {
  entityType: EntityType.TILE;
  id: string;
  typeId: string;
  position: Position;
}

export type EntityData = StageCharacterData | ObjectData | TileData;

export interface StageData {
  characters: StageCharacterData[];
  objects: ObjectData[];
  tiles: TileData[];
}
