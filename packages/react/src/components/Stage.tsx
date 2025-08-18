import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useCodeExecutor } from "../hooks/hook";
import { StageProps, StageRef, StageState, StageData } from "../types/stage";
import {
  RuntimeState,
  Character,
  StageObjects,
  BaseTile,
} from "@coblocks-stage/core";

const CoblocksStage = forwardRef<StageRef, StageProps>(
  (
    {
      config,
      data,
      onStateChange,
      onExecutionComplete,
      onError,
      className = "",
      style = {},
    },
    ref
  ) => {
    const {
      executeCode,
      executeAllCharacters,
      syncState,
      pause,
      resume,
      isReady,
      logs,
      stateChanges,
      isExecuting,
    } = useCodeExecutor();

    const [stageState, setStageState] = useState<StageState>({
      isInitialized: false,
      isRunning: false,
      isPaused: false,
      currentState: null,
      initialState: null,
    });

    const [internalData, setInternalData] = useState<StageData | null>(
      data || null
    );

    const tileSize = config.tileSize || 32;
    const showGrid = config.showGrid ?? true;

    // Create runtime state from stage data
    const createRuntimeState = useCallback(
      (stageData: StageData): RuntimeState => {
        const charactersMap = new Map<number, Character>();
        stageData.characters.forEach((char) => {
          charactersMap.set(char.id, char);
        });

        const objectsMap = new Map<string, StageObjects>();
        stageData.objects.forEach((obj) => {
          objectsMap.set(obj.id, obj);
        });

        const tilesMap = new Map<string, BaseTile>();
        stageData.tiles.forEach((tile) => {
          const key = `${tile.x},${tile.y}`;
          tilesMap.set(key, tile);
        });

        return {
          character: charactersMap,
          objects: objectsMap,
          map: {
            width: config.size.width,
            height: config.size.height,
            tiles: tilesMap,
          },
        };
      },
      [config.size]
    );

    // Initialize stage when data is loaded and executor is ready
    useEffect(() => {
      if (isReady && internalData && !stageState.isInitialized) {
        try {
          const runtimeState = createRuntimeState(internalData);
          const newState: StageState = {
            isInitialized: true,
            isRunning: false,
            isPaused: false,
            currentState: runtimeState,
            initialState: structuredClone(runtimeState),
          };

          setStageState(newState);
          syncState(runtimeState);
          onStateChange?.(newState);
        } catch (error) {
          onError?.(error as Error);
        }
      }
    }, [
      isReady,
      internalData,
      stageState.isInitialized,
      createRuntimeState,
      syncState,
      onStateChange,
      onError,
    ]);

    // Update state when stage state changes
    const updateStageState = useCallback(
      (updates: Partial<StageState>) => {
        setStageState((prev) => {
          const newState = { ...prev, ...updates };
          onStateChange?.(newState);
          return newState;
        });
      },
      [onStateChange]
    );

    // Stage control methods
    const startExecution = useCallback(async () => {
      if (
        !stageState.isInitialized ||
        !internalData?.characterCodes ||
        stageState.isRunning
      ) {
        return;
      }

      try {
        updateStageState({ isRunning: true, isPaused: false });

        const results = await executeAllCharacters(internalData.characterCodes);

        updateStageState({ isRunning: false });
        onExecutionComplete?.(results);
      } catch (error) {
        updateStageState({ isRunning: false });
        onError?.(error as Error);
      }
    }, [
      stageState.isInitialized,
      stageState.isRunning,
      internalData?.characterCodes,
      updateStageState,
      executeAllCharacters,
      onExecutionComplete,
      onError,
    ]);

    const pauseExecution = useCallback(async () => {
      if (!stageState.isRunning || stageState.isPaused) return;

      try {
        await pause();
        updateStageState({ isPaused: true });
      } catch (error) {
        onError?.(error as Error);
      }
    }, [
      stageState.isRunning,
      stageState.isPaused,
      pause,
      updateStageState,
      onError,
    ]);

    const resumeExecution = useCallback(async () => {
      if (!stageState.isRunning || !stageState.isPaused) return;

      try {
        await resume();
        updateStageState({ isPaused: false });
      } catch (error) {
        onError?.(error as Error);
      }
    }, [
      stageState.isRunning,
      stageState.isPaused,
      resume,
      updateStageState,
      onError,
    ]);

    const resetStage = useCallback(() => {
      if (!stageState.initialState) return;

      try {
        const resetState = structuredClone(stageState.initialState);
        syncState(resetState);
        updateStageState({
          isRunning: false,
          isPaused: false,
          currentState: resetState,
        });
      } catch (error) {
        onError?.(error as Error);
      }
    }, [stageState.initialState, syncState, updateStageState, onError]);

    const loadStageData = useCallback(
      (newData: StageData) => {
        try {
          setInternalData(newData);
          setStageState({
            isInitialized: false,
            isRunning: false,
            isPaused: false,
            currentState: null,
            initialState: null,
          });
        } catch (error) {
          onError?.(error as Error);
        }
      },
      [onError]
    );

    const executeCharacterCode = useCallback(
      async (characterId: number, code: string) => {
        if (!stageState.isInitialized) return;

        try {
          await executeCode(code, characterId);
        } catch (error) {
          onError?.(error as Error);
        }
      },
      [stageState.isInitialized, executeCode, onError]
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
        executeCode: executeCharacterCode,
      }),
      [
        startExecution,
        pauseExecution,
        resumeExecution,
        resetStage,
        loadStageData,
        stageState,
        executeCharacterCode,
      ]
    );

    // Render grid
    const renderGrid = useMemo(() => {
      if (!showGrid) return null;

      const lines = [];

      // Vertical lines
      for (let x = 0; x <= config.size.width; x++) {
        lines.push(
          <line
            key={`v-${x}`}
            x1={x * tileSize}
            y1={0}
            x2={x * tileSize}
            y2={config.size.height * tileSize}
            stroke="#ddd"
            strokeWidth={0.5}
          />
        );
      }

      // Horizontal lines
      for (let y = 0; y <= config.size.height; y++) {
        lines.push(
          <line
            key={`h-${y}`}
            x1={0}
            y1={y * tileSize}
            x2={config.size.width * tileSize}
            y2={y * tileSize}
            stroke="#ddd"
            strokeWidth={0.5}
          />
        );
      }

      return <g>{lines}</g>;
    }, [showGrid, config.size, tileSize]);

    // Render tiles
    const renderTiles = useMemo(() => {
      if (!internalData?.tiles) return null;

      return internalData.tiles.map((tile) => {
        const image = tile.getImage();
        const color = tile.getColor();

        return (
          <g key={tile.id}>
            <rect
              x={tile.x * tileSize}
              y={tile.y * tileSize}
              width={tileSize}
              height={tileSize}
              fill={color || "#f0f0f0"}
              stroke={tile.canPass ? "none" : "#999"}
              strokeWidth={tile.canPass ? 0 : 1}
            />
            {image && (
              <image
                x={tile.x * tileSize}
                y={tile.y * tileSize}
                width={tileSize}
                height={tileSize}
                href={image}
              />
            )}
          </g>
        );
      });
    }, [internalData?.tiles, tileSize]);

    // Render objects
    const renderObjects = useMemo(() => {
      if (!internalData?.objects) return null;

      return internalData.objects
        .filter((obj) => !("isCollected" in obj) || !obj.isCollected())
        .map((obj) => {
          const image = obj.getImage();
          const icon = obj.getIcon();

          return (
            <g key={obj.id}>
              <rect
                x={obj.x * tileSize + 2}
                y={obj.y * tileSize + 2}
                width={tileSize - 4}
                height={tileSize - 4}
                fill={obj.canPass ? "rgba(0,255,0,0.3)" : "rgba(255,0,0,0.3)"}
                rx={2}
              />
              {(image || icon) && (
                <image
                  x={obj.x * tileSize + 4}
                  y={obj.y * tileSize + 4}
                  width={tileSize - 8}
                  height={tileSize - 8}
                  href={image || icon}
                />
              )}
              <text
                x={obj.x * tileSize + tileSize / 2}
                y={obj.y * tileSize + tileSize - 2}
                textAnchor="middle"
                fontSize="8"
                fill="#333"
              >
                {obj.type}
              </text>
            </g>
          );
        });
    }, [internalData?.objects, tileSize]);

    // Render characters
    const renderCharacters = useMemo(() => {
      if (!internalData?.characters) return null;

      return internalData.characters.map((char) => {
        const pos = char.getPosition();
        const direction = char.getDirection();

        // Direction indicators
        const directionOffsets = {
          up: { dx: 0, dy: -4 },
          down: { dx: 0, dy: 4 },
          left: { dx: -4, dy: 0 },
          right: { dx: 4, dy: 0 },
        };

        const offset = directionOffsets[direction] || { dx: 0, dy: 0 };

        return (
          <g key={char.id}>
            <circle
              cx={pos.x * tileSize + tileSize / 2}
              cy={pos.y * tileSize + tileSize / 2}
              r={tileSize / 3}
              fill="#4A90E2"
              stroke="#2E5C8A"
              strokeWidth={2}
            />
            <text
              x={pos.x * tileSize + tileSize / 2}
              y={pos.y * tileSize + tileSize / 2 + 3}
              textAnchor="middle"
              fontSize="10"
              fill="white"
              fontWeight="bold"
            >
              {char.id}
            </text>
            {/* Direction indicator */}
            <circle
              cx={pos.x * tileSize + tileSize / 2 + offset.dx}
              cy={pos.y * tileSize + tileSize / 2 + offset.dy}
              r={2}
              fill="#FFD700"
            />
          </g>
        );
      });
    }, [internalData?.characters, tileSize]);

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
            zIndex: 10,
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
              color: stageState.isInitialized ? "#4A90E2" : "#999",
            }}
          >
            {stageState.isInitialized ? "●" : "○"} Ready
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
          }}
        >
          {renderGrid}
          {renderTiles}
          {renderObjects}
          {renderCharacters}
        </svg>

        {/* Debug info */}
        {(logs.length > 0 || stateChanges.length > 0) && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              right: "8px",
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "10px",
              maxHeight: "100px",
              overflow: "auto",
            }}
          >
            {logs.slice(-3).map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

CoblocksStage.displayName = "CoblocksStage";

export default CoblocksStage;
