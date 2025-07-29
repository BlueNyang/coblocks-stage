import { WorkerNotInitializedError } from "@/errors/workerError";
import { ExecutionResult, RuntimeState } from "@/types/execution";

export class CodeExecutor {
  private worker: Worker | null = null;
  private messageId: number = 0;
  private pendingMessages = new Map<string, { resolve: Function; reject: Function }>();

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    if (process.env.NODE_ENV === "development") {
      // Use a direct path that doesn't rely on import.meta
      this.worker = new Worker("/src/worker/codeExecutor.worker.ts", {
        type: "module",
      });
    } else {
      this.worker = new Worker("/workers/codeExecutor.worker.js");
    }

    this.setupWorkerHandlers();
  }

  private setupWorkerHandlers(): void {
    if (!this.worker) return;

    this.worker.onmessage = (event) => {
      const { type, payload, id } = event.data;

      if (id && this.pendingMessages.has(id)) {
        const { resolve } = this.pendingMessages.get(id)!;
        this.pendingMessages.delete(id);
        resolve(payload);
      } else {
        this.handleWorkerEvent(type, payload);
      }
    };

    this.worker.onerror = (error) => {
      console.error("Worker error:", error);
    };
  }

  private handleWorkerEvent(type: string, payload: any): void {
    switch (type) {
      case "LOG":
        console.log("[Worker] Log: ", payload);
        break;
      case "STATE_CHANGE":
        console.log("[Worker] State Change: ", payload);
        break;
    }
  }

  async syncState(runtimeState: RuntimeState): Promise<void> {
    if (!this.worker) return;

    const serializedState = {
      runtimeState: {
        ...runtimeState,
        objects: Object.fromEntries(runtimeState.objects),
      },
    };

    this.worker.postMessage({
      type: "SYNC_STATE",
      payload: serializedState,
    });
  }

  async executeCode(code: string): Promise<ExecutionResult> {
    if (!this.worker) {
      throw new WorkerNotInitializedError("Worker is not initialized.");
    }

    const msgId = (++this.messageId).toString();

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(msgId, {
        resolve: (result: ExecutionResult) => {
          resolve(result);
        },
        reject: (error: Error) => {
          reject(error);
        },
      });

      this.worker!.postMessage({
        type: "EXECUTE_CODE",
        payload: { code },
        id: msgId,
      });
    });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.postMessage({ type: "TERMINATE" });
      this.worker.terminate();
      this.worker = null;
    }
  }
}
