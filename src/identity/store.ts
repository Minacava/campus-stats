import type { CampusCache } from "../types.js";
import type { CanonicalIdentity } from "./types.js";

export function mergeIdentities(
  existing: CanonicalIdentity[],
  incoming: CanonicalIdentity[],
): CanonicalIdentity[] {
  const map = new Map<string, CanonicalIdentity>();
  for (const item of existing) map.set(item.id, item);
  for (const item of incoming) map.set(item.id, item);
  return [...map.values()];
}

export function upsertIdentities(
  cache: CampusCache,
  identities: CanonicalIdentity[],
): CampusCache {
  return {
    ...cache,
    identities: mergeIdentities(cache.identities, identities),
  };
}

export function setIdentityStatus(
  cache: CampusCache,
  identityId: string,
  status: CanonicalIdentity["status"],
): CampusCache {
  return {
    ...cache,
    identities: cache.identities.map((identity) =>
      identity.id === identityId ? { ...identity, status } : identity,
    ),
  };
}
