import {
  CodeSet,
  EntityDefinition,
  StageData,
} from "@croffledev/coblocks-stage-core";

export interface StageSize {
  width: number;
  height: number;
}

export interface StageState {
  isRunning: boolean;
  isPaused: boolean;
}

export interface StageConfig {
  size: StageSize;
  tileSize?: number; // px per tile, default 32
  backgroundColor?: string;
  showGrid?: boolean;
}

export interface StageProps {
  config: StageConfig;
  entityDefinitions: EntityDefinition[];
  stageData: StageData;
  codes: CodeSet;
  onExecutionComplete: () => void;
  onError: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface StageRef {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  loadData: (data: StageData) => void;
  getCurrentState: () => StageState;
}
