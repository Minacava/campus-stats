import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  listWomenCompetitions,
  syncFantasyBundle,
  updateCachedCompetitions,
} from "../src/fantasy.js";
import { emptyCache, mergeSyncResult } from "../src/cache.js";
import { dataBundleUrl } from "../src/data-bundle.js";

const fixturesRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "statsbomb",
);

async function fixtureFetchJson<T>(url: string): Promise<T> {
  const prefix = "fixture://statsbomb";
  assert.ok(url.startsWith(prefix), `unexpected url: ${url}`);
  const rel = url.slice(prefix.length);
  const filePath = path.join(fixturesRoot, rel.replace(/^\//, ""));
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

const opts = {
  baseUrl: "fixture://statsbomb",
  fetchJson: fixtureFetchJson,
};

describe("fantasy product helpers", () => {
  it("lists women's competitions from the open-data catalogue", async () => {
    const list = await listWomenCompetitions(opts);
    assert.ok(list.length >= 2);
    assert.ok(list.some((c) => c.name === "Liga F" && c.international === false));
    assert.ok(
      list.some((c) => c.name === "FA Women's Super League" && !c.international),
    );
  });

  it("syncFantasyBundle pulls every catalogue competition", async () => {
    const result = await syncFantasyBundle({
      ...opts,
      onProgress: () => undefined,
    });
    assert.equal(result.competitions.length, 2);
    assert.ok(result.matches.length > 0);
    assert.ok(result.teams.every((t) => t.kind === "club"));
  });

  it("updateCachedCompetitions refreshes names already in cache", async () => {
    const first = await syncFantasyBundle(opts);
    const cache = mergeSyncResult(emptyCache(), first);
    const updated = await updateCachedCompetitions(cache, opts);
    assert.equal(updated.competitions.length, cache.competitions.length);
    assert.ok(updated.matches.length >= first.matches.length);
  });

  it("dataBundleUrl points at the cron-published generic package", () => {
    assert.match(
      dataBundleUrl(),
      /packages\/generic\/campus-data\/latest\/cache\.json$/,
    );
  });
});
