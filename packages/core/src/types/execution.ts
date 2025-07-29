import { Character } from "@/types/character";
import { StageObjects } from "@/types/objects";

export interface RuntimeState {
  character: Character;
  objects: Map<string, StageObjects>;
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
  stateChanges?: StateChange[];
  executionTime?: number;
}

export interface StateChange {
  type: "CHARACTER_MOVE" | "OBJECT_INTERACT" | "OBJECT_STATE_CHANGE" | "INVENTORY_CHANGE";
  timestamp: number;
  data: any;
}

export interface WorkerMesage {
  type: "EXECUTE" | "SYNC_STATE" | "TRIGGER_EVENT" | "TERMINATE";
  payload: any;
  id?: string;
}
