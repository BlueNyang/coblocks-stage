import { Direction, Position } from "@/types/common";
import { WorkerSandbox } from "./WorkerSandbox";
import { Action, ActionType } from "@/types/workers";

export class WorkerAPI {
  constructor(
    private workerSandbox: WorkerSandbox,
    private owner: string
  ) {}

  public move(direction: Direction): Action {
    return {
      type: ActionType.MOVE,
      payload: {
        characterId: this.owner,
        direction,
      },
    };
  }

  public interact(): Action {
    return {
      type: ActionType.INTERACTION,
      payload: {
        characterId: this.owner,
      },
    };
  }

  public collect(objectId: string): Action {
    return {
      type: ActionType.COLLECT,
      payload: {
        characterId: this.owner,
        objectId,
      },
    };
  }

  public drop(objectId: string): Action {
    return {
      type: ActionType.DROP,
      payload: {
        characterId: this.owner,
        objectId,
      },
    };
  }

  public wait(): Action {
    return {
      type: ActionType.WAIT,
      payload: {
        characterId: this.owner,
      },
    };
  }

  public turn(direction: Direction): Action {
    return {
      type: ActionType.TURN,
      payload: {
        characterId: this.owner,
        direction,
      },
    };
  }

  public log(message: string): Action {
    return {
      type: ActionType.LOG,
      payload: {
        characterId: this.owner,
        message,
      },
    };
  }

  public isPassable(position: Position): boolean {
    return this.workerSandbox.isPassable(position);
  }
}
