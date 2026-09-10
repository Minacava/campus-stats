import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpClient } from "../src/http.js";

describe("HttpClient", () => {
  it("sends User-Agent and retries then succeeds", async () => {
    let calls = 0;
    const seenUa: string[] = [];
    const client = new HttpClient({
      minIntervalMs: 0,
      maxAttempts: 3,
      sleep: async () => undefined,
      fetchImpl: async (_url, init) => {
        calls += 1;
        const headers = new Headers(init?.headers);
        seenUa.push(headers.get("user-agent") ?? "");
        if (calls < 2) {
          return new Response("nope", { status: 503 });
        }
        return new Response("<html>ok</html>", { status: 200 });
      },
    });

    const text = await client.getText("https://example.test/page");
    assert.equal(text, "<html>ok</html>");
    assert.equal(calls, 2);
    assert.match(seenUa[0] ?? "", /campus/);
  });

  it("spaces sequential requests by minIntervalMs", async () => {
    const starts: number[] = [];
    const client = new HttpClient({
      minIntervalMs: 40,
      maxAttempts: 1,
      sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
      fetchImpl: async () => {
        starts.push(Date.now());
        return new Response("x", { status: 200 });
      },
    });

    await Promise.all([
      client.getText("https://example.test/a"),
      client.getText("https://example.test/b"),
    ]);
    assert.equal(starts.length, 2);
    assert.ok((starts[1] ?? 0) - (starts[0] ?? 0) >= 35);
  });
});
