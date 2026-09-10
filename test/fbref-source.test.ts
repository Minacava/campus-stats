import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { emptyCache, mergeSyncResult } from "../src/cache.js";
import { FbrefSource } from "../src/sources/fbref.js";
import { StatsBombSource } from "../src/sources/statsbomb.js";

const root = path.dirname(fileURLToPath(import.meta.url));

async function loadFixtureHtml(): Promise<string> {
  return readFile(
    path.join(root, "fixtures", "fbref", "wsl-schedule-sample.html"),
    "utf8",
  );
}

async function statsbombFetchJson<T>(url: string): Promise<T> {
  const prefix = "fixture://statsbomb";
  assert.ok(url.startsWith(prefix), `unexpected url: ${url}`);
  const rel = url.slice(prefix.length).replace(/^\//, "");
  const raw = await readFile(path.join(root, "fixtures", "statsbomb", rel), "utf8");
  return JSON.parse(raw) as T;
}

describe("FbrefSource offline", () => {
  it("syncs WSL pilot from HTML fixture", async () => {
    const html = await loadFixtureHtml();
    const source = new FbrefSource({
      loadHtml: async () => html,
    });
    const result = await source.syncCompetition("WSL");
    assert.equal(result.competitions[0]?.name, "FA Women's Super League");
    assert.ok(result.matches.length >= 2);
    assert.equal(result.matches[0]?.sources[0]?.source, "fbref");
  });
});

describe("StatsBomb + FBref cache merge", () => {
  it("keeps both sources in one cache", async () => {
    const sb = new StatsBombSource({
      baseUrl: "fixture://statsbomb",
      fetchJson: statsbombFetchJson,
    });
    const fb = new FbrefSource({
      loadHtml: async () => loadFixtureHtml(),
    });

    const liga = await sb.syncCompetition("Liga F");
    const wsl = await fb.syncCompetition("FA Women's Super League");
    const cache = mergeSyncResult(mergeSyncResult(emptyCache(), liga), wsl);

    assert.ok(cache.competitions.some((c) => c.sources[0]?.source === "statsbomb"));
    assert.ok(cache.competitions.some((c) => c.sources[0]?.source === "fbref"));
    assert.ok(cache.matches.some((m) => m.id.startsWith("statsbomb:")));
    assert.ok(cache.matches.some((m) => m.id.startsWith("fbref:")));
  });
});
