import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  describeCredentials,
  maskSecret,
  requireApiKey,
  requireStatsBombPaidLogin,
  resolveCredentials,
} from "../src/credentials.js";
import {
  createFootballSource,
  KNOWN_SOURCE_IDS,
} from "../src/sources/create.js";
import { StatsBombSource } from "../src/sources/statsbomb.js";

describe("BYOK credentials (StatsBomb login)", () => {
  it("defaults to open-data with no login", async () => {
    const creds = await resolveCredentials({ env: {}, configFile: null });
    assert.equal(creds.statsbombPaidReady, false);
    assert.equal(creds.fbref.paidApiAvailable, false);
    assert.equal(describeCredentials(creds).statsbomb.mode, "open-data");
  });

  it("resolves SB_USERNAME / SB_PASSWORD from env", async () => {
    const creds = await resolveCredentials({
      env: {
        SB_USERNAME: "fan@club.com",
        SB_PASSWORD: "secret-pass",
      },
      configFile: null,
    });
    assert.equal(creds.statsbombPaidReady, true);
    assert.equal(creds.statsbomb.username, "fan@club.com");
    assert.equal(creds.statsbomb.password, "secret-pass");
    assert.equal(creds.statsbomb.usernameSource, "env");
  });

  it("prefers CLI override over env over config", async () => {
    const creds = await resolveCredentials({
      statsbomb: { username: "override@x.com", password: "override-pass" },
      env: { SB_USERNAME: "env@x.com", SB_PASSWORD: "env-pass" },
      configFile: {
        statsbomb: { username: "cfg@x.com", password: "cfg-pass" },
      },
    });
    assert.equal(creds.statsbomb.username, "override@x.com");
    assert.equal(creds.statsbomb.usernameSource, "override");
  });

  it("masks secrets in describeCredentials", async () => {
    assert.match(maskSecret("fan@club.com"), /•/);
    const described = describeCredentials(
      await resolveCredentials({
        env: {
          SB_USERNAME: "fan@club.com",
          SB_PASSWORD: "super-secret-password",
        },
        configFile: null,
      }),
    );
    assert.equal(described.statsbomb.mode, "paid");
    assert.equal(described.statsbomb.passwordConfigured, true);
    assert.ok(!String(described.statsbomb.username).includes("fan@club.com"));
    assert.match(String(described.statsbomb.username), /•/);
  });

  it("requireStatsBombPaidLogin explains free fallback", () => {
    assert.throws(
      () => requireStatsBombPaidLogin({}),
      /SB_USERNAME|Open Data/,
    );
  });

  it("deprecated requireApiKey points at StatsBomb login", () => {
    assert.throws(() => requireApiKey({}), /SB_USERNAME/);
  });
});

describe("StatsBomb free vs paid mode", () => {
  it("lists only statsbomb and fbref sources", () => {
    assert.deepEqual(KNOWN_SOURCE_IDS, ["statsbomb", "fbref"]);
  });

  it("uses open-data without credentials", () => {
    const source = createFootballSource("statsbomb") as StatsBombSource;
    assert.equal(source.accessMode, "open-data");
  });

  it("switches to paid when login is provided", () => {
    const source = createFootballSource("statsbomb", {
      credentials: { username: "u@x.com", password: "p" },
    }) as StatsBombSource;
    assert.equal(source.accessMode, "paid");
  });

  it("paid mode sends Basic auth to the StatsBomb API host", async () => {
    const calls: Array<{ url: string; authorization?: string | null }> = [];
    const source = new StatsBombSource({
      credentials: { username: "u@x.com", password: "p" },
      fetchJson: async <T>(url: string): Promise<T> => {
        calls.push({ url, authorization: null });
        if (url.includes("/competitions")) {
          return [] as T;
        }
        return [] as T;
      },
    });
    // Custom fetchJson bypasses auth headers — verify URL shape instead.
    await assert.rejects(() => source.syncCompetition("Liga F"), /not found/);
    assert.ok(
      calls[0]?.url.includes("data.statsbombservices.com/api/v4/competitions") ||
        calls[0]?.url.includes("/api/v4/competitions"),
    );
  });

  it("paid mode with real fetch injects Basic auth", async () => {
    const seen: string[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      seen.push(String(input));
      const auth = new Headers(init?.headers).get("authorization");
      assert.ok(auth?.startsWith("Basic "));
      return new Response(JSON.stringify([]), { status: 200 });
    }) as typeof fetch;
    try {
      const source = new StatsBombSource({
        credentials: { username: "u@x.com", password: "secret" },
      });
      await assert.rejects(() => source.syncCompetition("Liga F"), /not found/);
      assert.ok(seen[0]?.includes("/api/v4/competitions"));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("rejects legacy --source live with a clear migration hint", () => {
    assert.throws(
      () => createFootballSource("live"),
      /SB_USERNAME|statsbomb/,
    );
  });
});
