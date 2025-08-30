// worker/worker.types.ts
import { EntityDefinition } from "./entity";
import { RenderData } from "./common";
import { CodeSet } from "./stage";

export interface Action {
  type: ActionType;
  payload: any;
}

export enum ActionType {
  MOVE = "MOVE",
  INTERACTION = "INTERACTION",
  COLLECT = "COLLECT",
  DROP = "DROP",
  WAIT = "WAIT",
  TURN = "TURN",
}

export enum WorkerMessage {
  INITIALIZE = "INITIALIZE",
  EXECUTE = "EXECUTE",
  PAUSED = "PAUSED",
  RESUMED = "RESUMED",
  STOPPED = "STOPPED",
  UPDATE = "UPDATE",
  FINISHED = "FINISHED",
  ERROR = "ERROR",
}

// Main -> WorkerSandbox
export interface InitializeCommand {
  type: WorkerMessage.INITIALIZE;
  payload: {
    executionSpeed: number;
    entityDefinitions: EntityDefinition[];
  };
}

export interface ExecuteCommand {
  type: WorkerMessage.EXECUTE;
  payload: {
    codes: CodeSet;
    stageData: any;
  };
}

export interface PauseCommand {
  type: WorkerMessage.PAUSED;
  payload: {};
}

export interface ResumeCommand {
  type: WorkerMessage.RESUMED;
  payload: {};
}

export interface StopCommand {
  type: WorkerMessage.STOPPED;
  payload: {};
}

export type WorkerCommand =
  | InitializeCommand
  | ExecuteCommand
  | PauseCommand
  | ResumeCommand
  | StopCommand;

// WorkerSandbox -> Main
export interface TurnUpdateMessage {
  type: WorkerMessage.UPDATE;
  payload: RenderData[];
}

export interface ExecutionResultMessage {
  type: WorkerMessage.FINISHED;
  payload: {
    success: boolean;
    reason?: string;
  };
}

export interface ErrorMessage {
  type: WorkerMessage.ERROR;
  payload: {
    success: boolean;
    reason: string;
  };
}

export type WorkerResponse = TurnUpdateMessage | ExecutionResultMessage | ErrorMessage;
