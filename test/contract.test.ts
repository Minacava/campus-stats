import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { emptyCache, mergeSyncResult } from "../src/cache.js";
import { StatsBombSource } from "../src/sources/statsbomb.js";

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

function source(): StatsBombSource {
  return new StatsBombSource({
    baseUrl: "fixture://statsbomb",
    fetchJson: fixtureFetchJson,
  });
}

describe("StatsBomb contract (offline fixtures)", () => {
  it("syncs Liga F into canonical entities with provenance", async () => {
    const result = await source().syncCompetition("Liga F");

    assert.equal(result.competitions.length, 1);
    assert.equal(result.competitions[0]?.name, "Liga F");
    assert.equal(result.competitions[0]?.gender, "female");
    assert.deepEqual(result.competitions[0]?.sources, [
      { source: "statsbomb", id: "182" },
    ]);

    assert.ok(result.seasons.some((s) => s.name === "2023/2024"));
    assert.ok(result.matches.length >= 3);
    assert.ok(result.teams.some((t) => t.name.includes("Barcelona")));

    for (const m of result.matches) {
      assert.equal(m.sources[0]?.source, "statsbomb");
      assert.ok(m.homeTeamId.startsWith("statsbomb:team:"));
      assert.ok(m.awayTeamId.startsWith("statsbomb:team:"));
    }
  });

  it("queries Barcelona matches for Liga F 2023/2024 from merged cache", async () => {
    const liga = await source().syncCompetition("Liga F");
    const wsl = await source().syncCompetition("FA Women's Super League");
    const cache = mergeSyncResult(mergeSyncResult(emptyCache(), liga), wsl);

    assert.equal(cache.competitions.length, 2);
    assert.ok(cache.matches.length > liga.matches.length);

    const competition = cache.competitions.find((c) => c.name === "Liga F");
    assert.ok(competition);
    const season = cache.seasons.find(
      (s) => s.competitionId === competition.id && s.name === "2023/2024",
    );
    assert.ok(season);

    const teamById = new Map(cache.teams.map((t) => [t.id, t]));
    const barcaMatches = cache.matches.filter((m) => {
      if (m.competitionId !== competition.id || m.seasonId !== season.id) {
        return false;
      }
      const home = teamById.get(m.homeTeamId)?.name ?? "";
      const away = teamById.get(m.awayTeamId)?.name ?? "";
      return (
        home.toLowerCase().includes("barcelona") ||
        away.toLowerCase().includes("barcelona")
      );
    });

    assert.ok(barcaMatches.length >= 1);
  });
});

describe("cache merge", () => {
  it("upserts by id without wiping siblings", () => {
    const cache = mergeSyncResult(emptyCache(), {
      competitions: [
        {
          id: "a",
          name: "A",
          gender: "female",
          sources: [{ source: "statsbomb", id: "1" }],
        },
      ],
      seasons: [],
      teams: [],
      matches: [],
    });
    const merged = mergeSyncResult(cache, {
      competitions: [
        {
          id: "b",
          name: "B",
          gender: "female",
          sources: [{ source: "statsbomb", id: "2" }],
        },
        {
          id: "a",
          name: "A*",
          gender: "female",
          sources: [{ source: "statsbomb", id: "1" }],
        },
      ],
      seasons: [],
      teams: [],
      matches: [],
    });
    assert.equal(merged.competitions.length, 2);
    assert.equal(merged.competitions.find((c) => c.id === "a")?.name, "A*");
  });
});
