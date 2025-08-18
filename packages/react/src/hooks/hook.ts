import React, { useCallback, useEffect, useState } from "react";
import {
  CodeExecutor,
  ExecutionResult,
  RuntimeState,
  WorkerNotInitializedError,
  ExecutionAllResult,
  StateChange,
} from "@coblocks-stage/core";

interface UseCodeExecutionResult {
  executeCode: (code: string, characterId?: number) => Promise<ExecutionResult>;
  executeAllCharacters: (
    characterCodes: Map<number, string>
  ) => Promise<ExecutionAllResult>;
  syncState: (state: RuntimeState) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  isReady: boolean;
  logs: string[];
  stateChanges: StateChange[];
  isExecuting: boolean;
}

export const useCodeExecutor = (): UseCodeExecutionResult => {
  const [codeExecutor, setCodeExecutor] = useState<CodeExecutor | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stateChanges, setStateChanges] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  useEffect(() => {
    const executor = new CodeExecutor();

    executor.on("log", (data: any) => {
      setLogs((prev) => [...prev.slice(-99), data.message]);
    });

    executor.on("state_change", (data: any) => {
      setStateChanges((prev) => [...prev.slice(-49), data]);
    });

    executor.on("error", (data: any) => {
      console.error("Worker Error: ", data);
    });

    setCodeExecutor(executor);
    setIsReady(true);

    return () => {
      executor.terminate();
    };
  }, []);

  const executeCode = useCallback(
    async (code: string, characterId: number = 1): Promise<ExecutionResult> => {
      if (!codeExecutor) {
        throw new WorkerNotInitializedError("CodeExecutor is not initialized.");
      }

      setLogs([]);
      setStateChanges([]);
      setIsExecuting(true);

      try {
        const result = await codeExecutor.executeCode(code, characterId);
        return result;
      } finally {
        setIsExecuting(false);
      }
    },
    [codeExecutor]
  );

  const executeAllCharacters = useCallback(
    async (
      characterCodes: Map<number, string>
    ): Promise<ExecutionAllResult> => {
      if (!codeExecutor) {
        throw new Error("CodeExecutor is not initialized.");
      }

      setIsExecuting(true);
      setLogs([]);
      setStateChanges([]);
      try {
        return await codeExecutor.executeAllCharacters(characterCodes);
      } finally {
        setIsExecuting(false);
      }
    },
    [codeExecutor]
  );

  const syncState = useCallback(
    async (state: RuntimeState): Promise<void> => {
      if (!codeExecutor) return;
      await codeExecutor.syncState(state);
    },
    [codeExecutor]
  );

  const pause = useCallback(async (): Promise<void> => {
    if (!codeExecutor) return;
    await codeExecutor.pauseExecution();
  }, [codeExecutor]);

  const resume = useCallback(async (): Promise<void> => {
    if (!codeExecutor) return;
    await codeExecutor.resumeExecution();
  }, [codeExecutor]);

  return {
    executeCode,
    executeAllCharacters,
    syncState,
    pause,
    resume,
    isReady,
    logs,
    stateChanges,
    isExecuting,
  };
};
