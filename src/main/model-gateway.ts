import { createServer, type Server } from "node:http";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import type { AgentConfig } from "../shared/contracts";
/** Exact-endpoint proxy: the engine receives a run token, never the model API key. */
export class ModelGateway {
  readonly token = randomBytes(32).toString("hex");
  baseUrl = "";
  private server?: Server;
  private requests = new Set<AbortController>();
  constructor(private config: AgentConfig) {}
  async start() {
    this.server = createServer(async (req, res) => {
      if (req.headers.authorization !== `Bearer ${this.token}`) {
        res.writeHead(401).end();
        return;
      }
      if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
        res.writeHead(403).end();
        return;
      }
      const abort = new AbortController();
      this.requests.add(abort);
      res.on("close", () => abort.abort());
      try {
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 4 * 1024 * 1024) throw new Error("request too large");
          chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString());
        if (body.model !== this.config.model.id) {
          res.writeHead(403).end();
          return;
        }
        const upstream = await fetch(
          this.config.model.baseUrl.replace(/\/$/, "") + "/chat/completions",
          {
            method: "POST",
            redirect: "error",
            signal: AbortSignal.any([
              abort.signal,
              AbortSignal.timeout(180000),
            ]),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.config.model.apiKey}`,
            },
            body: JSON.stringify(body),
          },
        );
        if (!upstream.ok) {
          res
            .writeHead(upstream.status, { "Content-Type": "application/json" })
            .end(
              JSON.stringify({
                error: { message: `사내 모델 HTTP ${upstream.status}` },
              }),
            );
          return;
        }
        res.writeHead(200, {
          "Content-Type":
            upstream.headers.get("content-type") ?? "application/json",
          "Cache-Control": "no-cache",
        });
        if (upstream.body) {
          const reader = upstream.body.getReader();
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (!res.write(Buffer.from(value)))
              await once(res, "drain", { signal: abort.signal });
          }
        }
        res.end();
      } catch {
        if (!res.headersSent)
          res
            .writeHead(502)
            .end('{"error":{"message":"사내 모델 연결 또는 응답 오류"}}');
        else res.destroy();
      } finally {
        this.requests.delete(abort);
      }
    });
    await new Promise<void>((resolve, reject) => {
      this.server!.once("error", reject);
      this.server!.listen(0, "127.0.0.1", resolve);
    });
    const address = this.server.address();
    if (!address || typeof address === "string")
      throw new Error("모델 중계 포트 할당 실패");
    this.baseUrl = `http://127.0.0.1:${address.port}/v1`;
  }
  async close() {
    for (const controller of this.requests) controller.abort();
    this.server?.closeAllConnections();
    await new Promise<void>((resolve) => {
      if (!this.server?.listening) resolve();
      else this.server.close(() => resolve());
    });
  }
}
