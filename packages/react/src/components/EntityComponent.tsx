import { EntityComponentProps } from "@/types/entity";
import {
  StageCharacter,
  EntityType,
  ObjectData,
  TileData,
  TileDefinition,
  Direction,
} from "@croffledev/coblocks-stage-core";
import React, { type JSX } from "react";

export default function EntityComponent({
  entityDefinition,
  entity,
  cellHeight,
  cellWidth,
}: EntityComponentProps) {
  switch (entity.entityType) {
    case EntityType.CHARACTER:
      return getCharacterComponent(
        entity as StageCharacter,
        cellWidth,
        cellHeight
      );
    case EntityType.OBJECT:
      return getObjectComponent(entity as ObjectData, cellWidth, cellHeight);
    case EntityType.TILE:
      return getTileComponent(
        entityDefinition as TileDefinition,
        entity as TileData,
        cellWidth,
        cellHeight
      );
    default:
      return null;
  }
}

const getCharacterComponent = (
  entity: StageCharacter,
  cellWidth: number,
  cellHeight: number
): JSX.Element => {
  const zIndex = 200;

  const rotation = getRotation(entity.direction);

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${entity.position.x * cellWidth}px`,
    top: `${entity.position.y * cellHeight}px`,
    color: entity.color,
    width: `${cellWidth}px`,
    height: `${cellHeight}px`,
    transition: "all 0.3s ease-in-out",
    transform: rotation,
    zIndex: zIndex,
  };

  return (
    <div style={style}>
      {entity.imageSet ? (
        <img
          src={entity.imageSet[entity.state]}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${cellWidth} ${cellHeight}`}
        >
          <circle
            cx={cellWidth / 2}
            cy={cellHeight / 2}
            r={cellWidth / 2 - 6}
            fill="currentColor"
            stroke="black"
            strokeWidth="3"
          />
          <circle
            cx={cellWidth / 2 - 10}
            cy={10}
            r="5"
            fill="white"
            stroke="black"
            strokeWidth="2"
          />
          <circle
            cx={cellWidth / 2 + 10}
            cy={10}
            r="5"
            fill="white"
            stroke="black"
            strokeWidth="2"
          />
        </svg>
      )}
    </div>
  );
};

const getObjectComponent = (
  entity: ObjectData,
  cellWidth: number,
  cellHeight: number
): JSX.Element => {
  const zIndex = 100;

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${entity.position.x * cellWidth}px`,
    top: `${entity.position.y * cellHeight}px`,
    color: entity.color,
    width: `${cellWidth}px`,
    height: `${cellHeight}px`,
    transition: "all 0.3s ease-in-out",
    zIndex: zIndex,
  };

  return (
    <div style={style}>
      {entity.imageSet ? (
        <img
          src={entity.imageSet[entity.state || "default"]}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${cellWidth} ${cellHeight}`}
        >
          <rect width={cellWidth} height={cellHeight} fill="currentColor" />
        </svg>
      )}
    </div>
  );
};

const getTileComponent = (
  definition: TileDefinition,
  entity: TileData,
  cellWidth: number,
  cellHeight: number
): JSX.Element => {
  const zIndex = 50;

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${entity.position.x * cellWidth}px`,
    top: `${entity.position.y * cellHeight}px`,
    color: definition.color,
    width: `${cellWidth}px`,
    height: `${cellHeight}px`,
    transition: "all 0.3s ease-in-out",
    border: "0.5px solid #ddd",
    zIndex: zIndex,
  };

  return (
    <div style={style}>
      {definition.imageSet ? (
        <img src={definition.imageSet["default"]} />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${cellWidth} ${cellHeight}`}
        >
          <rect width={cellWidth} height={cellHeight} fill="currentColor" />
        </svg>
      )}
    </div>
  );
};

function getRotation(direction: Direction): string {
  switch (direction) {
    case Direction.UP:
      return "rotate(0deg)";
    case Direction.RIGHT:
      return "rotate(90deg)";
    case Direction.DOWN:
      return "rotate(180deg)";
    case Direction.LEFT:
      return "rotate(270deg)";
    default:
      return "rotate(0deg)";
  }
}
