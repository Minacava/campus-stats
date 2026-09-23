import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  listStatsBombEndpoints,
  paidExtrasSummary,
  statsBombPaidUrls,
} from "../src/sources/statsbomb-endpoints.js";
import { StatsBombSource } from "../src/sources/statsbomb.js";

describe("StatsBomb endpoint catalogue", () => {
  it("marks core endpoints as wired and lists paid-only extras", () => {
    const catalog = listStatsBombEndpoints();
    const byId = Object.fromEntries(catalog.map((e) => [e.id, e]));
    assert.equal(byId.competitions?.wiredInCampus, true);
    assert.equal(byId.matches?.wiredInCampus, true);
    assert.equal(byId.lineups?.wiredInCampus, true);
    assert.equal(byId.events?.wiredInCampus, true);
    assert.equal(byId.playerSeasonStats?.availability, "optional-paid");
    assert.equal(byId.playerSeasonStats?.wiredInCampus, false);
    assert.equal(byId.injuries, undefined);
    assert.ok(catalog.every((e) => e.id !== "injuries"));
  });

  it("builds paid API URLs with statsbombpy version defaults", () => {
    const urls = statsBombPaidUrls("https://data.statsbombservices.com");
    assert.equal(
      urls.competitions(),
      "https://data.statsbombservices.com/api/v4/competitions",
    );
    assert.equal(
      urls.playerSeasonStats(11, 90),
      "https://data.statsbombservices.com/api/v7/competitions/11/seasons/90/player-stats",
    );
    assert.equal(
      urls.frames360(123),
      "https://data.statsbombservices.com/api/v2/360-frames/123",
    );
  });

  it("probePaidExtras requires paid mode and reports unmapped probes", async () => {
    assert.deepEqual(paidExtrasSummary({ playerSeasonStats: true }), [
      "playerSeasonStats",
    ]);
    const open = new StatsBombSource({
      paidExtras: { playerSeasonStats: true },
    });
    await assert.rejects(
      () => open.probePaidExtras({ competitionId: 1, seasonId: 2 }),
      /SB_USERNAME/,
    );

    const calls: string[] = [];
    const paid = new StatsBombSource({
      credentials: { username: "u", password: "p" },
      paidExtras: { playerSeasonStats: true, playerMatchStats: true },
      fetchJson: async <T>(url: string): Promise<T> => {
        calls.push(url);
        return [{ id: 1 }, { id: 2 }] as T;
      },
    });
    const probes = await paid.probePaidExtras({
      competitionId: 11,
      seasonId: 90,
      matchId: 999,
    });
    assert.equal(probes.length, 2);
    assert.ok(probes.every((p) => p.ok && p.mappedToCampusSchema === false));
    assert.ok(calls.some((u) => u.includes("/player-stats")));
  });
});
