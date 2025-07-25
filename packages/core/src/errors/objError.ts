/** Error thrown when an invalid object state is used */
export class InvalidObjectStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidObjectStateError";
  }
}

/** Error thrown when an object cannot be collected */
export class CannotCollectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CannotCollectError";
  }
}

/** Error thrown when an object cannot be dropped */
export class CannotDropError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CannotDropError";
  }
}
