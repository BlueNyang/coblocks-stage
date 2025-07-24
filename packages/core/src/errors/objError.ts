export class InvalidObjectStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidObjectStateError";
  }
}

export class CannotCollectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CannotCollectError";
  }
}

export class CannotDropError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CannotDropError";
  }
}
