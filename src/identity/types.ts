/**
 * Cross-source identity model for campo-stats.
 *
 * A CanonicalIdentity groups one or more provider-native SourceRefs that
 * refer to the same real-world club (later: player). Confidence and status
 * decide whether the link is safe to auto-apply in queries.
 */

import type { SourceRef } from "../refs.js";

export type IdentityKind = "team" | "player";

/** How sure we are that the linked source refs are the same entity. */
export type IdentityConfidence = "high" | "medium" | "low";

/**
 * `resolved` — safe to treat as one entity in queries.
 * `pending` — candidate needs human review; do not auto-merge.
 * `rejected` — reviewed and kept separate.
 */
export type IdentityStatus = "resolved" | "pending" | "rejected";

export interface CanonicalIdentity {
  /** Stable campo-stats identity id, e.g. `identity:team:…`. */
  id: string;
  kind: IdentityKind;
  /** Preferred display name. */
  name: string;
  /** Extra names that should match this identity. */
  aliases: string[];
  /** Provider refs that belong to this identity. */
  sources: SourceRef[];
  confidence: IdentityConfidence;
  status: IdentityStatus;
  /** Optional competition context used when the match was proposed. */
  competitionHint?: string;
}
