import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyIdentityRules, isQueryableIdentity } from "../src/identity/rules.js";
import type { Team } from "../src/types.js";

function team(id: string, name: string, source: string): Team {
  return { id, name, sources: [{ source, id: id.split(":").pop()! }] };
}

describe("identity rules", () => {
  it("auto-resolves only high near-exact scores", () => {
    const out = applyIdentityRules(
      [
        {
          left: team("statsbomb:team:1", "Chelsea", "statsbomb"),
          right: team("fbref:team:a", "Chelsea", "fbref"),
          score: 1,
          confidence: "high",
        },
        {
          left: team("statsbomb:team:2", "Man United W", "statsbomb"),
          right: team("fbref:team:b", "Manchester United", "fbref"),
          score: 0.75,
          confidence: "medium",
        },
      ],
      "WSL",
    );
    assert.equal(out[0]?.status, "resolved");
    assert.equal(out[1]?.status, "pending");
    assert.equal(isQueryableIdentity(out[0]!), true);
    assert.equal(isQueryableIdentity(out[1]!), false);
  });
});
