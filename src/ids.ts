/** Build stable campus ids from a provider key + native parts. */
export function entityId(source: string, ...parts: Array<string | number>): string {
  return [source, ...parts.map(String)].join(":");
}
