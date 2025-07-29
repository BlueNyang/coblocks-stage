/** Error thrown when an object cannot be dropped */
export class WorkerNotInitializedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkerNotInitializedError";
  }
}
