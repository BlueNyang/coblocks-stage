import { Character } from "@/types/character";
import { StageObjects } from "@/types/objects";

export interface RuntimeState {
  character: Character;
  objects: Map<string, StageObjects>;
  map: {
    width: number;
    height: number;
    tiles: Map<string, any>; // Assuming tiles are stored in a Map with TileID as key
  };
}

export interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: {
    type: "RUNTIME" | "TIMEOUT" | "SYNTAX" | "TYPE" | "SECURITY";
    message: string;
    line?: number;
    stack?: string;
  };
  logs: string[];
  stateChanges: StateChange[];
  executionTime: number;
}

export interface StateChange {
  type: "CHARACTER_MOVE" | "OBJECT_INTERACT" | "OBJECT_STATE_CHANGE" | "INVENTORY_CHANGE";
  timestamp: number;
  data: any;
}

export interface WorkerMessage {
  type: "EXECUTE_CODE" | "SYNC_STATE" | "TRIGGER_EVENT" | "TERMINATE" | "PAUSE" | "RESUME";
  payload: any;
  id?: string;
}
