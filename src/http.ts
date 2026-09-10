/**
 * Polite HTTP helper for HTML sources (FBref, etc.).
 * Sequential requests share a minimum delay; failed GETs retry with backoff.
 */

export interface HttpClientOptions {
  userAgent?: string;
  /** Minimum ms between request starts (default 1500). */
  minIntervalMs?: number;
  /** Max attempts including the first (default 3). */
  maxAttempts?: number;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

const DEFAULT_UA =
  "campus/0.0.1 (women's football research; +https://gitlab.com/marina34/campus)";

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class HttpClient {
  private readonly userAgent: string;
  private readonly minIntervalMs: number;
  private readonly maxAttempts: number;
  private readonly fetchImpl: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private chain: Promise<void> = Promise.resolve();
  private lastStartedAt = 0;

  constructor(options: HttpClientOptions = {}) {
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.minIntervalMs = options.minIntervalMs ?? 1500;
    this.maxAttempts = options.maxAttempts ?? 3;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.sleep = options.sleep ?? defaultSleep;
  }

  async getText(url: string): Promise<string> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await this.scheduledGet(url);
      } catch (err) {
        lastError = err;
        if (attempt === this.maxAttempts) break;
        const backoff = this.minIntervalMs * attempt;
        await this.sleep(backoff);
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error(`HTTP GET failed for ${url}`);
  }

  private scheduledGet(url: string): Promise<string> {
    const run = this.chain.then(async () => {
      const wait = Math.max(0, this.minIntervalMs - (Date.now() - this.lastStartedAt));
      if (wait > 0) await this.sleep(wait);
      this.lastStartedAt = Date.now();
      const res = await this.fetchImpl(url, {
        headers: {
          "user-agent": this.userAgent,
          accept: "text/html,application/xhtml+xml",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return res.text();
    });
    // Keep the queue alive even if a request fails.
    this.chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}
