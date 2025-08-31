import { EntityComponentProps } from "@/types/entity";
import {
  StageCharacter,
  EntityType,
  ObjectData,
  TileData,
  TileDefinition,
} from "@coblocks-stage/core";
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
      {entity.imageUrl ? (
        <img
          src={entity.imageUrl}
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
            r={cellWidth / 2}
            fill="currentColor"
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
      {entity.imageUrl ? (
        <img
          src={entity.imageUrl}
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
      {definition.imageUrl ? (
        <img src={definition.imageUrl} />
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
