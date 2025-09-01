import { EntityDefinition, EntityData } from "@croffledev/coblocks-stage-core";

export interface EntityComponentProps {
  entityDefinition: EntityDefinition;
  entity: EntityData;
  cellWidth: number;
  cellHeight: number;
}
