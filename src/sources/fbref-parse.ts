/**
 * Minimal HTML schedule parser for FBref `sched_*` tables.
 * Only reads data-stat attributes documented in docs/fbref-pilot.md.
 */

export interface FbrefScheduleRow {
  date?: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeScore?: number | null;
  awayScore?: number | null;
  /** FBref match id when present in the score link. */
  matchId?: string;
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function cellHtml(rowHtml: string, stat: string): string | undefined {
  const re = new RegExp(
    `<t[hd]\\b[^>]*\\bdata-stat="${stat}"[^>]*>([\\s\\S]*?)</t[hd]>`,
    "i",
  );
  const m = rowHtml.match(re);
  return m?.[1];
}

function firstLink(cell: string | undefined): { href: string; text: string } | undefined {
  if (!cell) return undefined;
  const m = cell.match(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
  if (!m) {
    const text = decodeBasicEntities(cell.replace(/<[^>]+>/g, ""));
    return text ? { href: "", text } : undefined;
  }
  return {
    href: m[1] ?? "",
    text: decodeBasicEntities((m[2] ?? "").replace(/<[^>]+>/g, "")),
  };
}

function squadFromHref(href: string): string | undefined {
  const m = href.match(/\/squads\/([a-f0-9]+)\//i);
  return m?.[1];
}

function matchFromHref(href: string): string | undefined {
  const m = href.match(/\/matches\/([a-z0-9]+)\//i);
  return m?.[1];
}

function parseScore(raw: string): { home?: number | null; away?: number | null } {
  const text = decodeBasicEntities(raw.replace(/<[^>]+>/g, ""));
  if (!text) return { home: null, away: null };
  const m = text.match(/(\d+)\s*[–\-—]\s*(\d+)/);
  if (!m) return {};
  return { home: Number(m[1]), away: Number(m[2]) };
}

/** Extract match rows from a FBref competition schedule HTML page. */
export function parseFbrefSchedule(html: string): FbrefScheduleRow[] {
  const tableMatch = html.match(
    /<table\b[^>]*\bid="sched_[^"]+"[^>]*>([\s\S]*?)<\/table>/i,
  );
  const tableHtml = tableMatch?.[1] ?? html;
  const bodyMatch = tableHtml.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i);
  const body = bodyMatch?.[1] ?? tableHtml;

  const rows: FbrefScheduleRow[] = [];
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(body))) {
    const rowHtml = rowMatch[1] ?? "";
    if (/spacer|thead/i.test(rowMatch[0])) continue;

    const homeLink = firstLink(cellHtml(rowHtml, "home_team"));
    const awayLink = firstLink(cellHtml(rowHtml, "away_team"));
    if (!homeLink || !awayLink) continue;

    const homeTeamId = squadFromHref(homeLink.href);
    const awayTeamId = squadFromHref(awayLink.href);
    if (!homeTeamId || !awayTeamId) continue;

    const dateLink = firstLink(cellHtml(rowHtml, "date"));
    const scoreCell = cellHtml(rowHtml, "score") ?? "";
    const scoreLink = firstLink(scoreCell);
    const score = parseScore(scoreCell);

    rows.push({
      date: dateLink?.text || undefined,
      homeTeamId,
      homeTeamName: homeLink.text,
      awayTeamId,
      awayTeamName: awayLink.text,
      homeScore: score.home,
      awayScore: score.away,
      matchId: scoreLink ? matchFromHref(scoreLink.href) : undefined,
    });
  }
  return rows;
}
