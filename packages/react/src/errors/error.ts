class WorkerNotInitializedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkerNotInitializedError";
  }
}
