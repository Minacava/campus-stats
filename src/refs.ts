/** Provenance link back to an upstream provider record. */
export interface SourceRef {
  /** Provider key, e.g. "statsbomb", "fbref". */
  source: string;
  /** Provider-native identifier (stringified if numeric upstream). */
  id: string;
}
