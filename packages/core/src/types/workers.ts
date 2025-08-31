// worker/worker.types.ts
import { EntityDefinition } from "./entity";
import { CodeSet, EntityData, StageData } from "./stage";

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
  LOG = "LOG",
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
    initStageData: StageData;
  };
}

export interface ExecuteCommand {
  type: WorkerMessage.EXECUTE;
  payload: {
    codes: CodeSet;
    stageData: StageData;
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
  data: {
    renderDataList: EntityData[];
  };
}

export interface ExecutionResultMessage {
  type: WorkerMessage.FINISHED;
  data: {
    success: boolean;
    reason?: string;
  };
}

export interface ErrorMessage {
  type: WorkerMessage.ERROR;
  data: {
    success: boolean;
    reason: string;
  };
}

export type WorkerResponse =
  | TurnUpdateMessage
  | ExecutionResultMessage
  | ErrorMessage;
