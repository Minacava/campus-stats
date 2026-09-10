import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { emptyCache } from "../src/cache.js";
import { migrateJsonCacheToSqlite } from "../src/db/migrate.js";
import { SqliteStore } from "../src/db/sqlite-store.js";

describe("SqliteStore", () => {
  it("round-trips cache entities with upsert merge", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "campo-sqlite-"));
    const dbPath = path.join(dir, "test.sqlite");
    const store = new SqliteStore(dbPath);
    const cache = emptyCache();
    cache.competitions.push({
      id: "statsbomb:comp:182",
      name: "Liga F",
      gender: "female",
      sources: [{ source: "statsbomb", id: "182" }],
    });
    cache.teams.push({
      id: "statsbomb:team:1",
      name: "Barcelona WFC",
      sources: [{ source: "statsbomb", id: "1" }],
    });
    store.upsertCache(cache);
    store.upsertCache({
      ...emptyCache(),
      competitions: [
        {
          id: "fbref:comp:230",
          name: "Liga F",
          gender: "female",
          sources: [{ source: "fbref", id: "230" }],
        },
      ],
      teams: [
        {
          id: "statsbomb:team:1",
          name: "Barcelona WFC*",
          sources: [{ source: "statsbomb", id: "1" }],
        },
      ],
    });
    const loaded = store.loadCache();
    store.close();
    assert.equal(loaded.competitions.length, 2);
    assert.equal(loaded.teams[0]?.name, "Barcelona WFC*");
  });

  it("migrates JSON cache file into sqlite", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "campo-mig-"));
    const jsonDir = path.join(dir, ".campo-stats");
    await mkdir(jsonDir);
    const jsonPath = path.join(jsonDir, "cache.json");
    const dbPath = path.join(dir, "campo.sqlite");
    const cache = emptyCache();
    cache.players.push({
      id: "statsbomb:player:1",
      name: "Ada",
      sources: [{ source: "statsbomb", id: "1" }],
    });
    await writeFile(jsonPath, JSON.stringify(cache));
    const result = await migrateJsonCacheToSqlite(dbPath, jsonPath);
    assert.equal(result.migrated, true);
    const store = new SqliteStore(dbPath);
    const loaded = store.loadCache();
    store.close();
    assert.equal(loaded.players[0]?.name, "Ada");
  });
});
