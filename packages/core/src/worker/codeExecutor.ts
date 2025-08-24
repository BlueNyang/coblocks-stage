import { WorkerNotInitializedError } from "@/errors/workerError";
import {
  RuntimeState,
  ExecutionResult,
  ExecutionAllResult,
} from "@/types/execution";

export class CodeExecutor {
  private worker: Worker | null = null;
  private messageId: number = 0;
  private pendingMessages = new Map<
    string,
    { resolve: Function; reject: Function }
  >();
  private eventHandler = new Map<string, Function>();

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    this.worker = new Worker(
      "/node_modules/@coblocks-stage/core/dist/codeExecutor.worker.js",
      {
        type: "module",
      }
    );

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
        case "SYNC_STATE":
          this.syncState(payload);
          break;
        case "EXECUTE_CODE":
          this.executeCode(payload);
          break;
        case "EXECUTE_ALL_CHARACTERS":
          this.executeAllCharacters(payload);
          break;
        case "PAUSE":
          this.pauseExecution();
          break;
        case "RESUME":
          this.resumeExecution();
          break;
        case "TERMINATE":
          this.terminate();
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
        map: {
          ...runtimeState.map,
          tiles: Object.fromEntries(runtimeState.map.tiles),
        },
        character: Object.fromEntries(runtimeState.character),
      },
    };

    await this.sendMessage("SYNC_STATE", serializedState);
  }

  async executeCode(
    code: string,
    characterId: number = 1
  ): Promise<ExecutionResult> {
    return this.sendMessage("EXECUTE_CODE", { characterId, code });
  }

  async executeAllCharacters(
    characterCodes: Map<number, string>
  ): Promise<ExecutionAllResult> {
    const payload = {
      characterCodes: Object.fromEntries(characterCodes),
    };

    const response = await this.sendMessage("EXECUTE_ALL_CHARACTERS", payload);

    console.log("[Worker] Response is ", response);

    return {
      results: new Map(
        Object.entries(response.results).map(([key, value]) => [
          Number(key),
          value as ExecutionResult,
        ])
      ),
      allSuccessful: Array.from(Object.values(response.results)).every(
        (result: any) => result.success
      ),
    };
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
