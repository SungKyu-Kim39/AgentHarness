/** A saved config takes effect only in a fresh host after the editor exits normally. */
export class ConfigurationRestart {
  private importing = false;
  private finishing = false;
  private requested = false;
  private completion?: Promise<void>;
  constructor(private save: (text: string) => Promise<void>, private closeEditor: () => Promise<void>, private changed: () => void = () => {}) {}
  get busy() { return this.importing || this.finishing; }
  get pending() { return this.requested; }
  async import(text: string) {
    if (this.busy || this.pending) throw new Error('설정 적용이 진행 중입니다. 편집기의 저장·닫기 확인을 완료하거나 재시작 대기를 취소하세요.');
    let complete!: () => void;
    this.completion = new Promise<void>(resolve => { complete = resolve; });
    this.importing = true; this.changed();
    try {
      await this.save(text); // Validation and encryption must finish before any close request.
      this.requested = true; this.changed();
      await this.closeEditor(); // Normal window close only; never terminate unsaved buffers.
    } finally { this.importing = false; complete(); this.changed(); }
  }
  cancel() {
    if (this.busy) return;
    this.requested = false; this.changed(); // Saved configuration is retained for the next launch.
  }
  async finish(cleanExit: boolean, closeServices: () => Promise<void>, relaunch: () => void) {
    if (this.finishing || (!this.pending && !this.importing)) return false;
    this.finishing = true; this.changed();
    try {
      await this.completion; // Also handle the user closing Zed while the vault write is finishing.
      if (!this.pending || !cleanExit) { this.requested = false; return false; }
      await closeServices(); // No replacement host if child/service shutdown is unconfirmed.
      this.requested = false;
      relaunch();
      return true;
    } finally { this.finishing = false; this.changed(); }
  }
}
