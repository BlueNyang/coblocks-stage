import { useCallback, useEffect, useState } from "react";
import {
  CodeSet,
  EntityDefinition,
  InitializeCommand,
  ExecuteCommand,
  EntityData,
  StageData,
  WorkerMessage,
  WorkerFactory,
} from "@croffledev/coblocks-stage-core";
import { StageState } from "@/types/stage";

interface UseCodeExecutionResult {
  initialize: (definitions: EntityDefinition[], stageData: StageData) => void;
  executeCode: (codes: CodeSet, stageData: StageData) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isReady: boolean;
  stageState: StageState;
  renderDataList: EntityData[];
  error: string | null;
  isExecuting: boolean;
}

export const useCodeExecutor = (): UseCodeExecutionResult => {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [stageState, setStageState] = useState<StageState>({
    isRunning: false,
    isPaused: false,
  });
  const [renderDataList, setRenderDataList] = useState<EntityData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  useEffect(() => {
    console.log("[Stage Hook] Initializing worker");

    const worker = new Worker(
      new URL("@croffledev/coblocks-stage-core/worker", import.meta.url).href,
      {
        type: "module",
      }
    );

    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      switch (type) {
        case WorkerMessage.UPDATE:
          setRenderDataList(payload);
          break;
        case WorkerMessage.ERROR:
          setIsExecuting(false);
          setError(payload.reason);
          break;
        case WorkerMessage.FINISHED:
          setIsExecuting(false);
          setError(null);
          setStageState((prev) => ({ ...prev, isFinished: true }));
          break;
        default:
          break;
      }
    };

    worker.onerror = (event) => {
      console.error("Worker Error: ", event);
      setError(event.message);
      setStageState((prev) => ({ ...prev, isRunning: false }));
    };

    setWorker(worker);
    setIsReady(true);

    return () => {
      worker.terminate();
    };
  }, []);

  const initialize = useCallback(
    (definitions: EntityDefinition[], stageData: StageData): void => {
      console.log("[Stage Hook] initialize");
      if (!worker)
        throw new WorkerNotInitializedError("Worker is not initialized.");

      const data: InitializeCommand = {
        type: WorkerMessage.INITIALIZE,
        payload: {
          executionSpeed: 300,
          entityDefinitions: definitions,
          initStageData: stageData,
        },
      };
      worker.postMessage(data);
    },
    [worker]
  );

  const executeCode = useCallback(
    (codes: CodeSet, stageData: StageData): void => {
      if (!worker) {
        throw new WorkerNotInitializedError("Worker is not initialized.");
      }

      setStageState((prev) => ({
        ...prev,
        isFinished: false,
        isRunning: true,
      }));
      setIsExecuting(true);
      setError(null);

      try {
        const data: ExecuteCommand = {
          type: WorkerMessage.EXECUTE,
          payload: { codes, stageData },
        };
        worker.postMessage(data);
      } finally {
        setIsExecuting(false);
        setStageState((prev) => ({ ...prev, isRunning: false }));
      }
    },
    [worker]
  );

  const pause = useCallback((): void => {
    if (!worker) {
      throw new WorkerNotInitializedError("Worker is not initialized.");
    }
    try {
      worker.postMessage({ type: WorkerMessage.PAUSED });
    } catch (error) {
      console.error("Error pausing worker:", error);
    }
  }, [worker]);

  const resume = useCallback((): void => {
    if (!worker) {
      throw new WorkerNotInitializedError("Worker is not initialized.");
    }
    try {
      worker.postMessage({ type: WorkerMessage.RESUMED });
    } catch (error) {
      console.error("Error resuming worker:", error);
    }
  }, [worker]);

  return {
    initialize,
    executeCode,
    pause,
    resume,
    stop,
    isReady,
    stageState,
    renderDataList,
    error,
    isExecuting,
  };
};
