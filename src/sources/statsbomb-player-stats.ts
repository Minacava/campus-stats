import { entityId } from "../ids.js";
import type { LineupEntry, Player, PlayerMatchStats } from "../types.js";

const SOURCE = "statsbomb";

interface SbCard {
  time?: string;
  card_type?: string;
  reason?: string;
  period?: number;
}

interface SbPosition {
  from?: string | null;
  to?: string | null;
}

interface SbLineupPlayer {
  player_id: number;
  player_name: string;
  player_nickname?: string | null;
  jersey_number?: number | null;
  country?: { name?: string };
  cards?: SbCard[];
  positions?: SbPosition[];
}

interface SbLineupTeam {
  team_id: number;
  team_name: string;
  lineup: SbLineupPlayer[];
}

interface SbEvent {
  type?: { name?: string };
  player?: { id?: number; name?: string };
  team?: { id?: number; name?: string };
  shot?: { outcome?: { name?: string }; key_pass_id?: string };
  pass?: { goal_assist?: boolean };
  id?: string;
}

function parseClockToMinutes(clock: string | null | undefined): number | null {
  if (!clock) return null;
  const m = clock.match(/^(\d+):(\d+)/);
  if (!m) return null;
  return Number(m[1]) + Number(m[2]) / 60;
}

/** Approximate minutes played from StatsBomb lineup position intervals. */
export function minutesFromPositions(positions: SbPosition[] | undefined): number | null {
  if (!positions || positions.length === 0) return null;
  let total = 0;
  let any = false;
  for (const pos of positions) {
    const from = parseClockToMinutes(pos.from);
    const to = parseClockToMinutes(pos.to ?? "90:00");
    if (from == null || to == null) continue;
    any = true;
    total += Math.max(0, to - from);
  }
  return any ? Math.round(total) : null;
}

function countCards(cards: SbCard[] | undefined): { yellow: number; red: number } {
  let yellow = 0;
  let red = 0;
  for (const card of cards ?? []) {
    const t = (card.card_type ?? "").toLowerCase();
    if (t.includes("second yellow") || t.includes("red")) red += 1;
    else if (t.includes("yellow")) yellow += 1;
  }
  return { yellow, red };
}

export interface AggregatedPlayerMatch {
  players: Player[];
  playerMatchStats: PlayerMatchStats[];
  lineups: LineupEntry[];
}

/**
 * Build Player + PlayerMatchStats + LineupEntry for one match
 * from StatsBomb lineups + events.
 */
export function aggregateStatsBombPlayerMatch(
  matchIdCampo: string,
  lineups: SbLineupTeam[],
  events: SbEvent[],
): AggregatedPlayerMatch {
  const goals = new Map<number, number>();
  const assists = new Map<number, number>();

  for (const event of events) {
    const playerId = event.player?.id;
    if (playerId == null) continue;
    if (event.type?.name === "Shot" && event.shot?.outcome?.name === "Goal") {
      goals.set(playerId, (goals.get(playerId) ?? 0) + 1);
    }
    if (event.type?.name === "Pass" && event.pass?.goal_assist) {
      assists.set(playerId, (assists.get(playerId) ?? 0) + 1);
    }
  }

  const players = new Map<string, Player>();
  const stats: PlayerMatchStats[] = [];
  const lineupEntries: LineupEntry[] = [];
  const matchNative = matchIdCampo.split(":").pop()!;

  for (const team of lineups) {
    const teamId = entityId(SOURCE, "team", team.team_id);
    for (const p of team.lineup) {
      const playerId = entityId(SOURCE, "player", p.player_id);
      players.set(playerId, {
        id: playerId,
        name: p.player_name,
        nickname: p.player_nickname ?? undefined,
        country: p.country?.name,
        sources: [{ source: SOURCE, id: String(p.player_id) }],
      });
      const cards = countCards(p.cards);
      const started = (p.positions?.length ?? 0) > 0;
      stats.push({
        id: entityId(SOURCE, "pstats", matchNative, p.player_id),
        matchId: matchIdCampo,
        playerId,
        teamId,
        minutes: minutesFromPositions(p.positions),
        goals: goals.get(p.player_id) ?? 0,
        assists: assists.get(p.player_id) ?? 0,
        yellowCards: cards.yellow,
        redCards: cards.red,
        sources: [
          {
            source: SOURCE,
            id: `${matchNative}:${p.player_id}`,
          },
        ],
      });
      lineupEntries.push({
        id: entityId(SOURCE, "lineup", matchNative, p.player_id),
        matchId: matchIdCampo,
        teamId,
        playerId,
        started,
        jerseyNumber: p.jersey_number ?? null,
        sources: [{ source: SOURCE, id: `${matchNative}:${p.player_id}` }],
      });
    }
  }

  return {
    players: [...players.values()],
    playerMatchStats: stats,
    lineups: lineupEntries,
  };
}
