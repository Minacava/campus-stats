/**
 * Published women's fantasy data bundle (refreshed by GitHub Actions cron).
 * Served as assets on the rolling Release tag `data-latest`.
 */

export const DATA_BUNDLE_OWNER = "Minacava";
export const DATA_BUNDLE_REPO = "campus-stats";
export const DATA_BUNDLE_RELEASE_TAG = "data-latest";
export const DATA_BUNDLE_FILE = "cache.json";
export const DATA_BUNDLE_META_FILE = "meta.json";

/** Absolute URL of the periodically refreshed cache snapshot. */
export function dataBundleUrl(
  tag: string = DATA_BUNDLE_RELEASE_TAG,
): string {
  return (
    `https://github.com/${DATA_BUNDLE_OWNER}/${DATA_BUNDLE_REPO}` +
    `/releases/download/${tag}/${DATA_BUNDLE_FILE}`
  );
}

export function dataBundleMetaUrl(
  tag: string = DATA_BUNDLE_RELEASE_TAG,
): string {
  return (
    `https://github.com/${DATA_BUNDLE_OWNER}/${DATA_BUNDLE_REPO}` +
    `/releases/download/${tag}/${DATA_BUNDLE_META_FILE}`
  );
}
