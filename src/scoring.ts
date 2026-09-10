import type { CampusCache, PlayerMatchStats } from "./types.js";

/** Default fantasy scoring weights (outfield-oriented v1). */
export interface FantasyScoringRules {
  appearance: number;
  goal: number;
  assist: number;
  yellowCard: number;
  redCard: number;
  /** Bonus when minutes >= this threshold (0 disables). */
  fullMatchMinutes: number;
  fullMatchBonus: number;
}

export const DEFAULT_FANTASY_RULES: FantasyScoringRules = {
  appearance: 1,
  goal: 4,
  assist: 3,
  yellowCard: -1,
  redCard: -3,
  fullMatchMinutes: 60,
  fullMatchBonus: 1,
};

export interface FantasyPointRow {
  matchId: string;
  playerId: string;
  teamId: string;
  points: number;
  breakdown: {
    appearance: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    fullMatchBonus: number;
  };
}

/** Score one PlayerMatchStats row with the given rules. */
export function scorePlayerMatchStats(
  stats: PlayerMatchStats,
  rules: FantasyScoringRules = DEFAULT_FANTASY_RULES,
): FantasyPointRow {
  const minutes = stats.minutes ?? 0;
  const appearance = minutes > 0 || stats.goals > 0 || stats.assists > 0
    ? rules.appearance
    : 0;
  const goals = stats.goals * rules.goal;
  const assists = stats.assists * rules.assist;
  const yellowCards = stats.yellowCards * rules.yellowCard;
  const redCards = stats.redCards * rules.redCard;
  const fullMatchBonus =
    rules.fullMatchMinutes > 0 && minutes >= rules.fullMatchMinutes
      ? rules.fullMatchBonus
      : 0;
  return {
    matchId: stats.matchId,
    playerId: stats.playerId,
    teamId: stats.teamId,
    points: appearance + goals + assists + yellowCards + redCards + fullMatchBonus,
    breakdown: {
      appearance,
      goals,
      assists,
      yellowCards,
      redCards,
      fullMatchBonus,
    },
  };
}

/** Score every player-match row in a cache (optionally filtered). */
export function scoreFantasyPoints(
  cache: CampusCache,
  options: {
    competitionId?: string;
    matchId?: string;
    playerId?: string;
    teamId?: string;
    rules?: FantasyScoringRules;
  } = {},
): FantasyPointRow[] {
  const matchIds = new Set(
    cache.matches
      .filter((m) =>
        options.competitionId ? m.competitionId === options.competitionId : true,
      )
      .map((m) => m.id),
  );

  return cache.playerMatchStats
    .filter((s) => {
      if (!matchIds.has(s.matchId)) return false;
      if (options.matchId && s.matchId !== options.matchId) return false;
      if (options.playerId && s.playerId !== options.playerId) return false;
      if (options.teamId && s.teamId !== options.teamId) return false;
      return true;
    })
    .map((s) => scorePlayerMatchStats(s, options.rules));
}
