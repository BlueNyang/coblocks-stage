export class WorkerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkerError";
  }
}

export class CannotMoveError extends WorkerError {
  constructor(message: string) {
    super(message);
    this.name = "CannotMoveError";
  }
}

export class CharacterNotFound extends WorkerError {
  constructor(message: string) {
    super(message);
    this.name = "CharacterNotFound";
  }
}

export class ObjectNotFound extends WorkerError {
  constructor(message: string) {
    super(message);
    this.name = "ObjectNotFound";
  }
}

export class ObjectNotInteractable extends WorkerError {
  constructor(message: string) {
    super(message);
    this.name = "ObjectNotInteractable";
  }
}

export class ObjectNotCollectible extends WorkerError {
  constructor(message: string) {
    super(message);
    this.name = "ObjectNotCollectible";
  }
}
