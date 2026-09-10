/**
 * Published women's fantasy data bundle (refreshed by GitLab CI cron).
 * Generic Package Registry paths under project 86296665.
 */

export const GITLAB_PROJECT_ID = "86296665";

export const DATA_BUNDLE_PACKAGE = "campus-data";
export const DATA_BUNDLE_VERSION = "latest";
export const DATA_BUNDLE_FILE = "cache.json";

/** Absolute URL of the periodically refreshed cache snapshot. */
export function dataBundleUrl(
  projectId: string = GITLAB_PROJECT_ID,
  version: string = DATA_BUNDLE_VERSION,
): string {
  return (
    `https://gitlab.com/api/v4/projects/${projectId}/packages/generic/` +
    `${DATA_BUNDLE_PACKAGE}/${version}/${DATA_BUNDLE_FILE}`
  );
}

export function dataBundleMetaUrl(
  projectId: string = GITLAB_PROJECT_ID,
  version: string = DATA_BUNDLE_VERSION,
): string {
  return (
    `https://gitlab.com/api/v4/projects/${projectId}/packages/generic/` +
    `${DATA_BUNDLE_PACKAGE}/${version}/meta.json`
  );
}
