import { WorkerCommand, WorkerMessage } from "@/types/workers";
import { WorkerSandbox } from "./WorkerSandbox";

let workerSandbox: WorkerSandbox;

self.onmessage = (event: MessageEvent<WorkerCommand>) => {
  const { type, payload } = event.data;

  switch (type) {
    case WorkerMessage.INITIALIZE:
      workerSandbox = new WorkerSandbox(payload.executionSpeed);
      workerSandbox.initialize(payload.entityDefinitions);
      break;
    case WorkerMessage.EXECUTE:
      workerSandbox.run(payload.codes, payload.stageData);
      break;
    case WorkerMessage.PAUSED:
      workerSandbox.pause();
      break;
    case WorkerMessage.RESUMED:
      workerSandbox.resume();
      break;
    case WorkerMessage.STOPPED:
      workerSandbox.stop();
      break;
  }
};

console.log("[Worker] Initialized");
