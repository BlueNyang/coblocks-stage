export class WorkerFactory {
  static createWorker(): Worker {
    return new Worker(new URL("./main.worker.js", import.meta.url).href, {
      type: "module",
    });
  }
}
