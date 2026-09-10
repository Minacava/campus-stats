import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseFbrefSchedule } from "../src/sources/fbref-parse.js";
import { mapFbrefScheduleToSyncResult } from "../src/sources/fbref-map.js";

const fixture = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "fbref",
  "wsl-schedule-sample.html",
);

describe("parseFbrefSchedule", () => {
  it("extracts teams, scores, dates from sched_ table", () => {
    const html = readFileSync(fixture, "utf8");
    const rows = parseFbrefSchedule(html);
    assert.ok(rows.length >= 2);
    assert.equal(rows[0]?.homeTeamName, "Chelsea");
    assert.equal(rows[0]?.awayTeamName, "Manchester City");
    assert.equal(rows[0]?.homeScore, 1);
    assert.equal(rows[0]?.awayScore, 0);
    assert.equal(rows[0]?.homeTeamId, "a6a4e67d");
    assert.equal(rows[0]?.matchId, "abc12345");
  });

  it("maps rows to canonical entities without leaking raw HTML fields", () => {
    const rows = parseFbrefSchedule(readFileSync(fixture, "utf8"));
    const result = mapFbrefScheduleToSyncResult(
      {
        fbrefCompetitionId: "189",
        name: "FA Women's Super League",
        country: "England",
        seasonName: "2023/2024",
        seasonSlug: "2023-2024",
      },
      rows,
    );
    assert.equal(result.competitions[0]?.name, "FA Women's Super League");
    assert.equal(result.matches.length, rows.length);
    assert.ok(result.teams.every((t) => t.id.startsWith("fbref:team:")));
    const sample = result.matches[0];
    assert.ok(sample);
    assert.equal(
      Object.keys(sample).sort().join(","),
      "awayScore,awayTeamId,competitionId,date,homeScore,homeTeamId,id,seasonId,sources",
    );
  });
});
