/**
 * FBref HTML adapter (women's competitions).
 *
 * Upstream: https://www.fbref.com/
 * Respect Sports Reference terms, robots.txt, and rate limits. Prefer the
 * polite HttpClient defaults. This environment often receives Cloudflare
 * 403s; use fixtures / --fixture for offline sync.
 *
 * Sports Reference does not offer a public FBref API key — Campus has no
 * paid-key path for this source (see docs/byok.md).
 *
 * See docs/fbref-pilot.md for competition ids and HTML shape.
 */

import { HttpClient } from "../http.js";
import type { FootballSource, SyncResult } from "./types.js";
import { parseFbrefSchedule } from "./fbref-parse.js";
import {
  mapFbrefScheduleToSyncResult,
  type FbrefCompetitionMeta,
} from "./fbref-map.js";

const SOURCE = "fbref";
const BASE = "https://fbref.com";

interface PilotCompetition extends FbrefCompetitionMeta {
  aliases: string[];
  schedulePath: string;
}

const PILOTS: PilotCompetition[] = [
  {
    fbrefCompetitionId: "189",
    name: "FA Women's Super League",
    country: "England",
    seasonName: "2023/2024",
    seasonSlug: "2023-2024",
    aliases: ["wsl", "fa women's super league", "women's super league"],
    schedulePath:
      "/en/comps/189/2023-2024/schedule/2023-2024-Womens-Super-League-Scores-and-Fixtures",
  },
  {
    fbrefCompetitionId: "230",
    name: "Liga F",
    country: "Spain",
    seasonName: "2023/2024",
    seasonSlug: "2023-2024",
    aliases: ["liga f"],
    schedulePath:
      "/en/comps/230/2023-2024/schedule/2023-2024-Liga-F-Scores-and-Fixtures",
  },
];

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

export interface FbrefSourceOptions {
  http?: HttpClient;
  /** Override HTML loader (fixtures / tests). */
  loadHtml?: (url: string) => Promise<string>;
  baseUrl?: string;
}

export class FbrefSource implements FootballSource {
  readonly id = SOURCE;
  private readonly http: HttpClient;
  private readonly loadHtml: (url: string) => Promise<string>;
  private readonly baseUrl: string;

  constructor(options: FbrefSourceOptions = {}) {
    this.http = options.http ?? new HttpClient();
    this.baseUrl = options.baseUrl ?? BASE;
    this.loadHtml =
      options.loadHtml ?? ((url) => this.http.getText(url));
  }

  async syncCompetition(competitionName: string): Promise<SyncResult> {
    const pilot = PILOTS.find(
      (p) =>
        normalize(p.name) === normalize(competitionName) ||
        p.aliases.includes(normalize(competitionName)),
    );
    if (!pilot) {
      throw new Error(
        `Competition not supported by FBref adapter yet: "${competitionName}". ` +
          `Pilots: ${PILOTS.map((p) => p.name).join(", ")}`,
      );
    }

    const url = `${this.baseUrl}${pilot.schedulePath}`;
    const html = await this.loadHtml(url);
    if (/Just a moment/i.test(html) || /cf-browser-verification/i.test(html)) {
      throw new Error(
        `FBref returned a Cloudflare challenge for ${url}. ` +
          `Retry from a non-blocked network or sync with an HTML fixture.`,
      );
    }

    const rows = parseFbrefSchedule(html);
    if (rows.length === 0) {
      throw new Error(`No schedule rows parsed from FBref page: ${url}`);
    }

    return mapFbrefScheduleToSyncResult(pilot, rows);
  }
}

export function listFbrefPilotNames(): string[] {
  return PILOTS.map((p) => p.name);
}
