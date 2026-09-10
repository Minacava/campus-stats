# FBref — competiciones piloto y estructura HTML

## Pilotos

| Competición | FBref comp id | Schedule URL (patrón) |
|-------------|---------------|------------------------|
| FA Women's Super League | `189` | `/en/comps/189/schedule/Womens-Super-League-Scores-and-Fixtures` |
| Liga F | `230` | `/en/comps/230/schedule/Liga-F-Scores-and-Fixtures` |

Temporada en path opcional: `/en/comps/189/2023-2024/schedule/2023-2024-Womens-Super-League-Scores-and-Fixtures`.

v1 del adapter usa **WSL (`189`)** como piloto por defecto al pedir
`sync --source fbref --competition "FA Women's Super League"` (y alias `WSL`).

## Estructura HTML esperada

FBref renderiza una tabla de fixtures con `data-stat` estables:

- Tabla: `table.stats_table` cuyo `id` empieza por `sched_`
- Filas de partido en `tbody > tr` (ignorar filas de spacer / thead)
- Celdas relevantes:
  - `data-stat="date"` — texto o link `YYYY-MM-DD`
  - `data-stat="home_team"` — link `/en/squads/<id>/...`
  - `data-stat="score"` — texto tipo `1–2` (en-dash) o vacío si no jugado
  - `data-stat="away_team"` — link `/en/squads/<id>/...`

El parser de `campo-stats` solo lee esos `data-stat`; no depende de clases CSS
volátiles.

## Acceso desde este entorno

Las peticiones HTTP a `fbref.com` desde el agente Cloud reciben **403 Cloudflare
(“Just a moment…”)**. Por eso:

- CI y tests usan **fixtures HTML** bajo `test/fixtures/fbref/`
- El cliente HTTP real queda listo (rate-limit + UA) para máquinas que no estén
  bloqueadas
- No se versionan dumps enormes; solo un schedule mínimo de WSL

## Términos

Datos y marca de [FBref / Sports Reference](https://www.fbref.com/). Respetar
`robots.txt`, rate limits y condiciones de uso del sitio. Este paquete no
redistribuye dumps masivos de FBref; solo normaliza lo que la usuaria sincroniza
localmente.
