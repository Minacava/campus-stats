# Free data + optional StatsBomb login (BYOK)

Campus is a **thin pipe** into your web/app: same schema whether you use free
feeds or a paid StatsBomb contract. You bring the login; Campus never hosts a
subscription for you.

## The model

| Source | Free (default) | If you pay the vendor |
|--------|----------------|------------------------|
| **StatsBomb** | [Open Data](https://github.com/statsbomb/open-data) on GitHub — updates when StatsBomb publishes seasons there | Your **SB_USERNAME / SB_PASSWORD** → paid API at `data.statsbombservices.com` (same auth as [statsbombpy](https://github.com/statsbomb/statsbombpy)). Fresher coverage follows **your contract**. |
| **FBref** | Polite HTML schedules (pilot leagues) | **No public API key.** Sports Reference does not sell FBref API keys ([their FAQ](https://www.sports-reference.com/bot-traffic.html)). Bulk licensing is a custom deal with them — not a key you paste into Campus. |

So:

- Without login → everyone gets the free platforms’ free data.
- With StatsBomb customer login → sync hits the **paid API** and refreshes what your licence includes.
- FBref stays free HTML only; there is nothing to “unlock” with a key in Campus.

## StatsBomb paid login

```bash
# Same env names as statsbombpy
export SB_USERNAME="you@company.com"
export SB_PASSWORD="your-statsbomb-password"

npx campus credentials   # shows mode: "paid" (password masked)
npx campus sync --competition "Liga F"
npx campus sync --fantasy
```

Or local config (`.campus/` is gitignored):

```json
{
  "statsbomb": {
    "username": "you@company.com",
    "password": "your-statsbomb-password"
  }
}
```

Or one-off flags:

```bash
npx campus sync --competition "Liga F" \
  --sb-user "you@company.com" \
  --sb-password "your-statsbomb-password"
```

Aliases: `CAMPUS_STATSBOMB_USERNAME` / `CAMPUS_STATSBOMB_PASSWORD`.

### Does the data update?

- **Open Data:** yes, whenever StatsBomb adds/updates files on GitHub — not a live match feed.
- **Paid API:** yes, according to what Hudl StatsBomb licensed you (often current seasons). Campus uses the same host/paths pattern as statsbombpy (`/api/v…/competitions`, matches, lineups, events).

## FBref

```bash
npx campus sync --source fbref --competition "WSL"
```

No `--api-key` path. Rate limits and Cloudflare apply; see `docs/fbref-pilot.md`.

## Library (drop into a web API)

```ts
import {
  CampusClient,
  resolveCredentials,
  syncFantasyBundle,
} from "campus-stats";

const creds = await resolveCredentials(); // reads SB_* from env
await syncFantasyBundle({
  credentials: creds.statsbombPaidReady
    ? {
        username: creds.statsbomb.username,
        password: creds.statsbomb.password,
      }
    : undefined,
});

const client = await CampusClient.open();
return Response.json(client.matches({ competition: "Liga F" }));
```

## Terms

- Open Data: free for research / genuine analytics; credit StatsBomb.
- Paid API: your StatsBomb contract.
- FBref: Sports Reference terms, robots.txt, rate limits.
- Never commit passwords; `.campus/config.json` stays local.

## Endpoint map

Full free vs paid endpoint list: `npx campus endpoints` (also summarized in the README).
