/**
 * Factory for CLI / library source selection.
 */

import type { StatsBombCredentials } from "../credentials.js";
import { FbrefSource, type FbrefSourceOptions } from "./fbref.js";
import {
  StatsBombSource,
  type StatsBombSourceOptions,
} from "./statsbomb.js";
import type { FootballSource } from "./types.js";

export type SourceId = "statsbomb" | "fbref";

export const KNOWN_SOURCE_IDS: SourceId[] = ["statsbomb", "fbref"];

export interface CreateSourceOptions {
  statsbomb?: StatsBombSourceOptions;
  fbref?: FbrefSourceOptions;
  /** Convenience: StatsBomb customer login for paid API mode. */
  credentials?: StatsBombCredentials;
}

export function createFootballSource(
  id: string,
  options: CreateSourceOptions = {},
): FootballSource {
  const normalized = id.trim().toLowerCase();
  if (normalized === "statsbomb") {
    return new StatsBombSource({
      ...options.statsbomb,
      credentials: options.credentials ?? options.statsbomb?.credentials,
    });
  }
  if (normalized === "fbref") {
    return new FbrefSource(options.fbref);
  }
  if (normalized === "live") {
    throw new Error(
      'Source "live" was removed. Use --source statsbomb with SB_USERNAME / ' +
        "SB_PASSWORD for the StatsBomb paid API (see docs/byok.md).",
    );
  }
  throw new Error(
    `Unknown source: "${id}". Use ${KNOWN_SOURCE_IDS.join(", ")}.`,
  );
}
