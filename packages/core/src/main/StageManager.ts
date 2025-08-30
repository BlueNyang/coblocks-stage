import { Entity } from "@/entities/base/Entity";
import { EntityFactory } from "@/entities/EntityFactory";
import { EntityDefinition } from "@/types/entity";
import { CodeSet, StageData } from "@/types/stage";
import { RenderData } from "@/types/type";

export class StageManager {
  private factory: EntityFactory;
  private entities: Map<string, Entity>;

  private executors: Map<string, Generator> = new Map();

  constructor(entityDefinitions: EntityDefinition[]) {
    this.factory = EntityFactory.getInstance();
    this.entities = new Map();

    // Register entity definitions
    for (const def of entityDefinitions) {
      this.factory.registerEntity(def);
    }
  }

  public run(codes: CodeSet, initStageData: StageData) {
    this.setupStage(initStageData);
  }

  private setupStage(stageData: StageData) {
    for (const characterData of stageData.characters) {
      const character = this.factory.create(
        characterData.typeId,
        characterData
      );
      if (character) {
        this.entities.set(character.id, character);
      }
    }

    for (const objectData of stageData.objects) {
      const stageObject = this.factory.create(objectData.typeId, objectData);
      if (stageObject) {
        this.entities.set(stageObject.id, stageObject);
      }
    }

    for (const tileData of stageData.tiles) {
      const stageTile = this.factory.create(tileData.typeId, tileData);
      if (stageTile) {
        this.entities.set(stageTile.id, stageTile);
      }
    }
  }

  private getRenderDataSet(): RenderData[] {
    const renderDataSet: RenderData[] = [];

    for (const entity of this.entities.values()) {
      const renderData: RenderData = {
        id: entity.id,
        typeId: entity.typeId,
        entityType: entity.entityType,
        position: entity.position,
        state: entity.state,
      };
      renderDataSet.push(renderData);
    }

    return renderDataSet;
  }
}
