import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useCodeExecutor } from "../hooks/hook";
import { StageProps, StageRef } from "../types/stage";
import { StageData } from "@croffledev/coblocks-stage-core";
import EntityComponent from "./EntityComponent";

const CoblocksStage = forwardRef<StageRef, StageProps>(
  (
    {
      config,
      entityDefinitions,
      stageData,
      codes,
      onExecutionComplete,
      onError,
      className = "",
      style = {},
    },
    ref
  ) => {
    const {
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
    } = useCodeExecutor();

    const [internalData, setInternalData] = useState<StageData | null>(null);

    const tileSize = config.tileSize || 32;
    const showGrid = config.showGrid ?? true;

    // Initialize stage when data is loaded and executor is ready
    useEffect(() => {
      console.log("[Stage] Initializing");

      if (isReady) {
        try {
          setInternalData(stageData);
          initialize(entityDefinitions, stageData);
        } catch (error) {
          onError(error as Error);
        }
      }
    }, [isReady, config]);

    // Stage control methods
    const startExecution = useCallback(() => {
      if (!isReady) {
        onError(new Error("Stage is not initialized"));
        return;
      }
      if (stageState.isRunning) {
        onError(new Error("Stage is already running"));
        return;
      }
      if (!internalData) {
        onError(new Error("No internal data available for execution"));
        return;
      }
      if (!codes) {
        onError(new Error("No codes available for execution"));
        return;
      }

      try {
        executeCode(codes, internalData);
        onExecutionComplete();
      } catch (error) {
        onError?.(error as Error);
      }
    }, [stageState.isRunning, internalData, onExecutionComplete, onError]);

    const pauseExecution = useCallback(() => {
      if (!stageState.isRunning || stageState.isPaused) return;

      try {
        pause();
      } catch (error) {
        onError?.(error as Error);
      }
    }, [stageState.isRunning, stageState.isPaused, pause, onError]);

    const resumeExecution = useCallback(() => {
      if (!stageState.isRunning || !stageState.isPaused) return;

      try {
        resume();
      } catch (error) {
        onError?.(error as Error);
      }
    }, [stageState.isRunning, stageState.isPaused, resume, onError]);

    const resetStage = useCallback(() => {
      try {
        initialize(entityDefinitions, stageData);
      } catch (error) {
        onError?.(error as Error);
      }
    }, [entityDefinitions, stageData, initialize, onError]);

    const loadStageData = useCallback(
      (stageData: StageData) => {
        try {
          setInternalData(stageData);
          initialize(entityDefinitions, stageData);
        } catch (error) {
          onError?.(error as Error);
        }
      },
      [entityDefinitions, stageData, initialize, onError]
    );

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        start: startExecution,
        pause: pauseExecution,
        resume: resumeExecution,
        reset: resetStage,
        loadData: loadStageData,
        getCurrentState: () => stageState,
      }),
      [
        startExecution,
        pauseExecution,
        resumeExecution,
        resetStage,
        loadStageData,
        stageState,
      ]
    );

    // Render grid
    // const renderGrid = useMemo(() => {
    //   if (!showGrid) return null;

    //   const lines = [];

    //   // Vertical lines
    //   for (let x = 0; x <= config.size.width; x++) {
    //     lines.push(
    //       <line
    //         key={`v-${x}`}
    //         x1={x * tileSize}
    //         y1={0}
    //         x2={x * tileSize}
    //         y2={config.size.height * tileSize}
    //         stroke="#ddd"
    //         strokeWidth={1}
    //       />
    //     );
    //   }

    //   // Horizontal lines
    //   for (let y = 0; y <= config.size.height; y++) {
    //     lines.push(
    //       <line
    //         key={`h-${y}`}
    //         x1={0}
    //         y1={y * tileSize}
    //         x2={config.size.width * tileSize}
    //         y2={y * tileSize}
    //         stroke="#ddd"
    //         strokeWidth={1}
    //       />
    //     );
    //   }

    //   return <g>{lines}</g>;
    // }, [showGrid, config.size, tileSize]);

    // Render tiles
    const renderEntities = useMemo(() => {
      if (!renderDataList) return null;

      return renderDataList.map((entity) => {
        const definition = entityDefinitions.find(
          (def) => def.typeId === entity.typeId
        );
        if (!definition) return null;
        return (
          <EntityComponent
            key={entity.id}
            entityDefinition={definition}
            entity={entity}
            cellWidth={tileSize}
            cellHeight={tileSize}
          />
        );
      });
    }, [renderDataList]);

    const stageWidth = config.size.width * tileSize;
    const stageHeight = config.size.height * tileSize;

    return (
      <div
        className={`stage-container ${className}`}
        style={{
          border: "2px solid #ccc",
          borderRadius: "8px",
          backgroundColor: config.backgroundColor || "#fff",
          position: "relative",
          display: "inline-block",
          ...style,
        }}
      >
        {/* Status indicators */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            zIndex: 300,
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            display: "flex",
            gap: "8px",
          }}
        >
          <span
            style={{
              color: isReady ? "#4A90E2" : "#999",
            }}
          >
            {isReady ? "●" : "○"} Ready
          </span>
          <span
            style={{
              color: stageState.isRunning ? "#50C878" : "#999",
            }}
          >
            {stageState.isRunning ? "●" : "○"} Running
          </span>
          <span
            style={{
              color: stageState.isPaused ? "#FFD700" : "#999",
            }}
          >
            {stageState.isPaused ? "●" : "○"} Paused
          </span>
          {isExecuting && <span style={{ color: "#FF6B6B" }}>● Executing</span>}
        </div>

        {/* Stage SVG */}
        <svg
          width={stageWidth}
          height={stageHeight}
          style={{
            display: "block",
            border: "1px solid #ddd",
            zIndex: 250,
          }}
        >
          {/* {renderGrid} */}
        </svg>
        {renderEntities}
      </div>
    );
  }
);

CoblocksStage.displayName = "CoblocksStage";

export default CoblocksStage;
