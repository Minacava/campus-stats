import type { CanonicalIdentity } from "./types.js";
import {
  candidateToIdentity,
  type TeamMatchCandidate,
} from "./match.js";

/**
 * Auto-resolve only high-confidence exact-ish matches.
 * Medium/low stay `pending` for review — never silent merge.
 */
export function applyIdentityRules(
  candidates: TeamMatchCandidate[],
  competitionHint?: string,
): CanonicalIdentity[] {
  return candidates.map((c) => {
    const identity = candidateToIdentity(c, competitionHint);
    if (c.confidence === "high" && c.score >= 0.95) {
      return { ...identity, status: "resolved" as const };
    }
    return { ...identity, status: "pending" as const, confidence: c.confidence };
  });
}

export function isQueryableIdentity(identity: CanonicalIdentity): boolean {
  return identity.status === "resolved";
}
