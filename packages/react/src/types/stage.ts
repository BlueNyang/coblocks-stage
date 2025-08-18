import {
  Character,
  StageObjects,
  BaseTile,
  RuntimeState,
} from "@coblocks-stage/core/";

export interface StageSize {
  width: number;
  height: number;
}

export interface StageConfig {
  size: StageSize;
  tileSize?: number; // px per tile, default 32
  backgroundColor?: string;
  showGrid?: boolean;
}

export interface StageData {
  tiles: BaseTile[];
  objects: StageObjects[];
  characters: Character[];
  characterCodes?: Map<number, string>;
}

export interface StageState {
  isInitialized: boolean;
  isRunning: boolean;
  isPaused: boolean;
  currentState: RuntimeState | null;
  initialState: RuntimeState | null;
}

export interface StageProps {
  config: StageConfig;
  data?: StageData;
  onStateChange?: (state: StageState) => void;
  onExecutionComplete?: (results: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface StageRef {
  start: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  reset: () => void;
  loadData: (data: StageData) => void;
  getCurrentState: () => StageState;
  executeCode: (characterId: number, code: string) => Promise<void>;
}
