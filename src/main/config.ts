import {
  readFile,
  rename,
  mkdir,
  writeFile,
  unlink,
  access,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { configSchema, type AgentConfig } from "../shared/contracts";
export async function atomicJSON(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const temp = `${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temp, JSON.stringify(value, null, 2), {
      mode: 0o600,
      flag: "wx",
    });
    await rename(temp, file);
  } finally {
    await unlink(temp).catch(() => {});
  }
}
export interface Cipher {
  isEncryptionAvailable(): boolean;
  encryptString(value: string): Buffer;
  decryptString(value: Buffer): string;
}
export class ConfigVault {
  readonly file: string;
  readonly staging: string;
  constructor(
    root: string,
    private cipher: Cipher,
  ) {
    this.file = path.join(root, "settings.enc.json");
    this.staging = path.join(root, "config-import.json");
  }
  async exists() {
    return access(this.file).then(
      () => true,
      (e: NodeJS.ErrnoException) => {
        if (e.code === "ENOENT") return false;
        throw e;
      },
    );
  }
  async load(): Promise<AgentConfig | undefined> {
    if (!this.cipher.isEncryptionAvailable())
      throw new Error(
        "사용자 보호 암호화를 사용할 수 없습니다. 평문 저장은 지원하지 않습니다.",
      );
    if (!(await this.exists())) {
      const staged = await readFile(this.staging, "utf8").catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code === "ENOENT") return undefined;
          throw error;
        },
      );
      if (staged === undefined) return undefined;
      return this.importText(staged, false);
    }
    try {
      const envelope = JSON.parse(await readFile(this.file, "utf8"));
      if (
        envelope.schemaVersion !== 1 ||
        typeof envelope.encrypted !== "string"
      )
        throw new Error();
      const config = configSchema.parse(
        JSON.parse(
          this.cipher.decryptString(Buffer.from(envelope.encrypted, "base64")),
        ),
      );
      await unlink(this.staging).catch((e: NodeJS.ErrnoException) => {
        if (e.code !== "ENOENT") throw e;
      });
      return config;
    } catch {
      throw new Error(
        "저장 설정을 읽거나 복호화할 수 없습니다. 기존 파일을 보존했습니다. 설정 화면에서 명시적으로 교체하세요.",
      );
    }
  }
  async importText(text: string, replace: boolean): Promise<AgentConfig> {
    if (!this.cipher.isEncryptionAvailable())
      throw new Error("사용자 보호 암호화를 사용할 수 없습니다.");
    if ((await this.exists()) && !replace)
      throw new Error("저장된 설정이 있습니다. 설정 교체를 선택하세요.");
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("JSON 문법이 올바르지 않습니다.");
    }
    const parsed = configSchema.safeParse(data);
    if (!parsed.success)
      throw new Error(
        "설정 필드 또는 URL이 올바르지 않습니다: " +
          parsed.error.issues.map((i) => i.path.join(".")).join(", "),
      );
    const encrypted = this.cipher
      .encryptString(JSON.stringify(parsed.data))
      .toString("base64");
    await atomicJSON(this.file, { schemaVersion: 1, encrypted });
    await unlink(this.staging).catch((e: NodeJS.ErrnoException) => {
      if (e.code !== "ENOENT") throw e;
    });
    return parsed.data;
  }
}
export class Redactor {
  private secrets: string[] = [];
  add(secret: string) {
    if (secret && !this.secrets.includes(secret)) this.secrets.push(secret);
  }
  text(value: string): string {
    for (const secret of this.secrets.sort((a, b) => b.length - a.length))
      value = value.split(secret).join("[REDACTED]");
    return value.replace(/Bearer\s+[A-Za-z0-9_.~+/=-]+/gi, "Bearer [REDACTED]");
  }
  object<T>(value: T): T {
    return JSON.parse(
      JSON.stringify(value, (key, v) =>
        /^(apiKey|authorization|password|token)$/i.test(key)
          ? "[REDACTED]"
          : typeof v === "string"
            ? this.text(v)
            : v,
      ),
    );
  }
}
