/**
 * Injury / availability feed.
 *
 * StatsBomb Open Data (and our FBref pilot) do not publish injury lists.
 * This module keeps a stable API so fantasy apps can call `listInjuries`
 * today and plug a future adapter without changing call sites.
 */

import type { CampoCache, InjuryRecord } from "./types.js";

export const INJURIES_AVAILABLE = false;

export const INJURIES_STATUS_MESSAGE =
  "Injury feeds are not available from current open sources (StatsBomb / FBref pilot). " +
  "campo-stats exposes InjuryRecord + listInjuries() for future adapters; " +
  "today the list is always empty.";

/** Always empty until an injury-capable adapter is added. */
export function listInjuries(cache: CampoCache): InjuryRecord[] {
  return cache.injuries ?? [];
}
