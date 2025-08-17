import { WorkerNotInitializedError } from "@/errors/workerError";
import { ExecutionResult, RuntimeState } from "@/types/execution";

export class CodeExecutor {
  private worker: Worker | null = null;
  private messageId: number = 0;
  private pendingMessages = new Map<string, { resolve: Function; reject: Function }>();
  private eventHandler = new Map<string, Function>();

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    // Separate worker initialization for development and production
    if (process.env.NODE_ENV === "development") {
      // Use a direct path that doesn't rely on import.meta
      this.worker = new Worker("/src/worker/codeExecutor.worker.ts", {
        type: "module",
      });
    } else {
      // Production
      this.worker = new Worker("/workers/codeExecutor.worker.js");
    }

    this.setupWorkerHandlers();
  }

  private setupWorkerHandlers(): void {
    if (!this.worker) return;

    this.worker.onmessage = (event) => {
      const { type, payload, id } = event.data;

      // processing response message
      if (id && this.pendingMessages.has(id)) {
        const { resolve } = this.pendingMessages.get(id)!;
        this.pendingMessages.delete(id);
        resolve(payload);
        return;
      }
      // 실시간 이벤트 처리
      switch (type) {
        case "LOG":
          this.handleLog(payload);
          break;
        case "STATE_CHANGE":
          this.handleStateChange(payload);
          break;
        case "ERROR":
          this.handleWorkerError(payload);
          break;
      }
    };

    this.worker.onerror = (error) => {
      console.error("Worker error:", error);
      this.emit("worker_error", error);
    };
  }

  on(event: string, handler: Function): void {
    this.eventHandler.set(event, handler);
  }

  private emit(event: string, data: any): void {
    const handler = this.eventHandler.get(event);
    if (handler) handler(data);
  }

  private handleLog(payload: any): void {
    console.log("[Worker] Log: ", payload.message);
    this.emit("LOG", payload);
  }

  private handleStateChange(payload: any): void {
    console.log("[Worker] State Change: ", payload);
    this.emit("STATE_CHANGE", payload);
  }

  private handleWorkerError(payload: any): void {
    console.error("[Worker] Error: ", payload);
    this.emit("ERROR", payload);
  }

  private async sendMessage(type: string, payload?: any): Promise<any> {
    if (!this.worker) {
      throw new WorkerNotInitializedError("Worker is not initialized.");
    }

    const messageId = (++this.messageId).toString();

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(messageId, { resolve, reject });

      this.worker!.postMessage({
        type,
        payload,
        id: messageId,
      });
    });
  }

  async syncState(runtimeState: RuntimeState): Promise<void> {
    if (!this.worker) return;

    const serializedState = {
      runtimeState: {
        ...runtimeState,
        objects: Object.fromEntries(runtimeState.objects),
      },
    };

    await this.sendMessage("SYNC_STATE", serializedState);
  }

  async executeCode(code: string): Promise<ExecutionResult> {
    return this.sendMessage("EXECUTE_CODE", { code });
  }

  async pauseExecution(): Promise<void> {
    await this.sendMessage("PAUSE_EXECUTION");
  }

  async resumeExecution(): Promise<void> {
    await this.sendMessage("RESUME_EXECUTION");
  }

  terminate(): void {
    if (this.worker) {
      this.pendingMessages.clear();

      this.worker.postMessage({ type: "TERMINATE" });
      this.worker.terminate();
      this.worker = null;
    }
  }
}
