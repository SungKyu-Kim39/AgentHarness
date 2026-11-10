import type { Phase } from "../shared/contracts";
export class Lifecycle {
  phase: Phase = "idle";
  private epoch = 0;
  get generation() {
    return this.epoch;
  }
  start() {
    if (!["idle", "stopped"].includes(this.phase))
      throw new Error(
        "이전 실행의 중지가 확인되어야 새 작업을 시작할 수 있습니다.",
      );
    this.phase = "running";
    return ++this.epoch;
  }
  stopping() {
    this.phase = "stopping";
    ++this.epoch;
  }
  confirmStop(
    aborted: boolean,
    idle: boolean,
    activeTools: number,
    childProcesses: number,
  ) {
    this.phase =
      aborted && idle && activeTools === 0 && childProcesses === 0
        ? "stopped"
        : "unconfirmed";
  }
  replay() {
    if (this.phase !== "stopped")
      throw new Error("중지가 확인된 후 답변을 재출력할 수 있습니다.");
    this.phase = "replaying";
    return ++this.epoch;
  }
  finish() {
    if (this.phase === "running") this.phase = "idle";
    else if (this.phase === "replaying") this.phase = "stopped";
  }
  valid(epoch: number) {
    return this.epoch === epoch;
  }
}
