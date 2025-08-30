import { Direction, Position } from "./common";

export type CodeSet = {
  [key: string]: string;
};

export interface ObjectData {
  id: string;
  typeId: string;
  initPos: Position;
  initDirection?: Direction;
  state?: string;
}

export interface StageData {
  characters: ObjectData[];
  objects: ObjectData[];
  tiles: ObjectData[];
}
