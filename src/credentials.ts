/**
 * Optional credentials so Campus can use free open feeds by default, or a
 * customer's own StatsBomb login for the paid API.
 *
 * Resolution order (highest wins):
 * 1. Explicit overrides (CLI flags / library options)
 * 2. Environment variables
 * 3. Local config file `.campus/config.json` (gitignored under `.campus/`)
 *
 * StatsBomb paid API uses HTTP Basic Auth (same as statsbombpy):
 *   SB_USERNAME / SB_PASSWORD
 *
 * FBref / Sports Reference does **not** sell a public API key — free mode is
 * polite HTML only. See docs/byok.md.
 *
 * Never log raw secrets; use `maskSecret` / `describeCredentials`.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_CACHE_DIR } from "./cache.js";

/** StatsBomb customer login (paid API). Matches statsbombpy env names. */
export const SB_USERNAME_ENV = "SB_USERNAME";
export const SB_PASSWORD_ENV = "SB_PASSWORD";
export const CAMPUS_STATSBOMB_USERNAME_ENV = "CAMPUS_STATSBOMB_USERNAME";
export const CAMPUS_STATSBOMB_PASSWORD_ENV = "CAMPUS_STATSBOMB_PASSWORD";

/** Optional override for the paid StatsBomb API host. */
export const CAMPUS_STATSBOMB_API_BASE_URL_ENV =
  "CAMPUS_STATSBOMB_API_BASE_URL";

export const DEFAULT_STATSBOMB_API_BASE =
  "https://data.statsbombservices.com";

export type CredentialSource = "override" | "env" | "config" | "none";

export interface StatsBombCredentials {
  username?: string;
  password?: string;
  /** Paid API host (default data.statsbombservices.com). */
  apiBaseUrl?: string;
}

export interface CampusConfigFile {
  statsbomb?: {
    username?: string;
    password?: string;
    apiBaseUrl?: string;
  };
  /** @deprecated Prefer statsbomb.username / statsbomb.password. */
  apiKey?: string;
  apiBaseUrl?: string;
}

export interface ResolvedCredentials {
  statsbomb: StatsBombCredentials & {
    usernameSource: CredentialSource;
    passwordSource: CredentialSource;
    apiBaseUrlSource: CredentialSource;
  };
  /** True when both username and password are present. */
  statsbombPaidReady: boolean;
  fbref: {
    /** Always false — FBref has no official API-key product. */
    paidApiAvailable: false;
    note: string;
  };
}

export interface ResolveCredentialsOptions {
  statsbomb?: StatsBombCredentials;
  configPath?: string;
  configFile?: CampusConfigFile | null;
  env?: NodeJS.ProcessEnv;
}

function firstEnv(
  env: NodeJS.ProcessEnv,
  names: readonly string[],
): string | undefined {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

function pickField(
  override: string | undefined,
  envValue: string | undefined,
  configValue: string | undefined,
): { value?: string; source: CredentialSource } {
  if (override?.trim()) return { value: override.trim(), source: "override" };
  if (envValue) return { value: envValue, source: "env" };
  if (configValue?.trim()) {
    return { value: configValue.trim(), source: "config" };
  }
  return { value: undefined, source: "none" };
}

export function defaultConfigPath(cwd: string = process.cwd()): string {
  return path.join(cwd, DEFAULT_CACHE_DIR, "config.json");
}

export async function loadConfigFile(
  filePath: string = defaultConfigPath(),
): Promise<CampusConfigFile | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as CampusConfigFile;
    if (parsed == null || typeof parsed !== "object") return null;
    return parsed;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Resolve optional paid credentials. Missing StatsBomb login is fine — free
 * open-data / FBref HTML still work.
 */
export async function resolveCredentials(
  options: ResolveCredentialsOptions = {},
): Promise<ResolvedCredentials> {
  const env = options.env ?? process.env;
  const config =
    options.configFile !== undefined
      ? options.configFile
      : await loadConfigFile(options.configPath ?? defaultConfigPath());

  const sb = config?.statsbomb;
  const username = pickField(
    options.statsbomb?.username,
    firstEnv(env, [SB_USERNAME_ENV, CAMPUS_STATSBOMB_USERNAME_ENV]),
    sb?.username,
  );
  const password = pickField(
    options.statsbomb?.password,
    firstEnv(env, [SB_PASSWORD_ENV, CAMPUS_STATSBOMB_PASSWORD_ENV]),
    sb?.password,
  );
  const apiBaseUrl = pickField(
    options.statsbomb?.apiBaseUrl,
    firstEnv(env, [CAMPUS_STATSBOMB_API_BASE_URL_ENV]),
    sb?.apiBaseUrl ?? config?.apiBaseUrl,
  );

  const statsbomb: ResolvedCredentials["statsbomb"] = {
    username: username.value,
    password: password.value,
    apiBaseUrl: apiBaseUrl.value ?? DEFAULT_STATSBOMB_API_BASE,
    usernameSource: username.source,
    passwordSource: password.source,
    apiBaseUrlSource:
      apiBaseUrl.source === "none" && apiBaseUrl.value === undefined
        ? "none"
        : apiBaseUrl.value
          ? apiBaseUrl.source === "none"
            ? "none"
            : apiBaseUrl.source
          : "none",
  };

  // Default host counts as configured only when user overrode it.
  if (!apiBaseUrl.value) {
    statsbomb.apiBaseUrl = DEFAULT_STATSBOMB_API_BASE;
    statsbomb.apiBaseUrlSource = "none";
  }

  return {
    statsbomb,
    statsbombPaidReady: Boolean(username.value && password.value),
    fbref: {
      paidApiAvailable: false,
      note:
        "FBref/Sports Reference does not sell a public API key. Campus uses free HTML (rate-limited). For bulk licensing contact Sports Reference directly.",
    },
  };
}

export function requireStatsBombPaidLogin(
  creds: StatsBombCredentials,
): { username: string; password: string } {
  const username = creds.username?.trim();
  const password = creds.password?.trim();
  if (username && password) return { username, password };
  throw new Error(
    "StatsBomb paid API needs SB_USERNAME and SB_PASSWORD " +
      "(or CAMPUS_STATSBOMB_USERNAME / CAMPUS_STATSBOMB_PASSWORD, " +
      "or .campus/config.json statsbomb.username/password). " +
      "Without them Campus uses free Open Data.",
  );
}

/** Mask a secret for CLI / logs. */
export function maskSecret(secret: string, visibleTail = 4): string {
  const trimmed = secret.trim();
  if (trimmed.length <= visibleTail) return "•".repeat(trimmed.length);
  const head = trimmed.slice(0, Math.min(8, trimmed.length - visibleTail));
  const tail = trimmed.slice(-visibleTail);
  return `${head}${"•".repeat(Math.max(4, trimmed.length - head.length - visibleTail))}${tail}`;
}

export function describeCredentials(creds: ResolvedCredentials): {
  statsbomb: {
    mode: "paid" | "open-data";
    username: string | null;
    usernameSource: CredentialSource;
    passwordConfigured: boolean;
    passwordSource: CredentialSource;
    apiBaseUrl: string;
    apiBaseUrlSource: CredentialSource;
  };
  fbref: ResolvedCredentials["fbref"];
} {
  return {
    statsbomb: {
      mode: creds.statsbombPaidReady ? "paid" : "open-data",
      username: creds.statsbomb.username
        ? maskSecret(creds.statsbomb.username)
        : null,
      usernameSource: creds.statsbomb.usernameSource,
      passwordConfigured: Boolean(creds.statsbomb.password),
      passwordSource: creds.statsbomb.passwordSource,
      apiBaseUrl: creds.statsbomb.apiBaseUrl ?? DEFAULT_STATSBOMB_API_BASE,
      apiBaseUrlSource: creds.statsbomb.apiBaseUrlSource,
    },
    fbref: creds.fbref,
  };
}

/** @deprecated Use requireStatsBombPaidLogin / free open-data instead. */
export function requireApiKey(
  _creds: { apiKey?: string },
  _purpose = "paid sources",
): string {
  throw new Error(
    "Generic API keys were replaced by StatsBomb login (SB_USERNAME / SB_PASSWORD). " +
      "See docs/byok.md.",
  );
}
