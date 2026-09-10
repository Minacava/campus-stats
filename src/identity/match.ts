import type { Team } from "../types.js";
import type { CanonicalIdentity, IdentityConfidence } from "./types.js";
import { entityId } from "../ids.js";

const NOISE = new Set([
  "w",
  "wfc",
  "fc",
  "cf",
  "afc",
  "women",
  "women's",
  "womens",
  "lady",
  "ladies",
  "club",
  "the",
]);

/** Normalize club names for comparison across providers. */
export function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !NOISE.has(t))
    .join(" ")
    .trim();
}

export interface TeamMatchCandidate {
  left: Team;
  right: Team;
  score: number;
  confidence: IdentityConfidence;
}

function tokenSet(name: string): Set<string> {
  return new Set(normalizeTeamName(name).split(" ").filter(Boolean));
}

/** Dice coefficient on normalized tokens. */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeTeamName(a);
  const nb = normalizeTeamName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return (2 * inter) / (ta.size + tb.size);
}

function confidenceFor(score: number): IdentityConfidence {
  if (score >= 0.9) return "high";
  if (score >= 0.7) return "medium";
  return "low";
}

/**
 * Propose team matches between two source cohorts.
 * `left` / `right` are typically teams that appear in the same competition
 * context but come from different providers.
 */
export function matchTeamsAcrossSources(
  left: Team[],
  right: Team[],
  options: { competitionHint?: string; minScore?: number } = {},
): TeamMatchCandidate[] {
  const minScore = options.minScore ?? 0.7;
  const usedRight = new Set<string>();
  const candidates: TeamMatchCandidate[] = [];

  for (const l of left) {
    let best: TeamMatchCandidate | undefined;
    for (const r of right) {
      if (usedRight.has(r.id)) continue;
      // Never link two refs from the same provider key as a "cross-source" hit.
      const lSources = new Set(l.sources.map((s) => s.source));
      if (r.sources.some((s) => lSources.has(s.source))) continue;

      const score = nameSimilarity(l.name, r.name);
      if (score < minScore) continue;
      const cand: TeamMatchCandidate = {
        left: l,
        right: r,
        score,
        confidence: confidenceFor(score),
      };
      if (!best || cand.score > best.score) best = cand;
    }
    if (best) {
      usedRight.add(best.right.id);
      candidates.push(best);
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

export function candidateToIdentity(
  candidate: TeamMatchCandidate,
  competitionHint?: string,
): CanonicalIdentity {
  const slug = normalizeTeamName(candidate.left.name).replace(/\s+/g, "-") || "team";
  return {
    id: entityId("identity", "team", slug),
    kind: "team",
    name: candidate.left.name,
    aliases: [...new Set([candidate.left.name, candidate.right.name])],
    sources: [...candidate.left.sources, ...candidate.right.sources],
    confidence: candidate.confidence,
    // Status filled by rule layer; default pending here.
    status: "pending",
    competitionHint,
  };
}
