import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  CampusClient,
  DEFAULT_CACHE_DIR,
  DEFAULT_CACHE_FILE,
  cachePath,
  dataBundleUrl,
} from "../src/index.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("campus-stats package identity", () => {
  it("publishes as campus-stats with campus CLI bins", async () => {
    const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as {
      name: string;
      version: string;
      bin: Record<string, string>;
    };
    assert.equal(pkg.name, "campus-stats");
    assert.ok(pkg.version.startsWith("0.4"));
    assert.equal(pkg.bin.campus, "./dist/cli.js");
    assert.equal(pkg.bin["campus-stats"], "./dist/cli.js");
    assert.equal(pkg.bin["campo-stats"], undefined);
  });

  it("uses .campus cache paths and CampusClient export", () => {
    assert.equal(DEFAULT_CACHE_DIR, ".campus");
    assert.equal(DEFAULT_CACHE_FILE, "cache.json");
    assert.match(cachePath("/tmp/app"), /\/\.campus\/cache\.json$/);
    assert.equal(typeof CampusClient.open, "function");
    assert.equal(typeof CampusClient.fromBundle, "function");
    assert.match(dataBundleUrl(), /\/campus-data\/latest\/cache\.json$/);
  });
});
