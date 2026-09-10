# Player stats sync — coste y almacenamiento

## Qué descarga `--with-players`

Por cada partido enriquecido (hasta `--player-stats-limit`, default **5**):

| Recurso StatsBomb | Tamaño típico | Notas |
|-------------------|---------------|--------|
| `lineups/{match_id}.json` | ~50–150 KB | Una vez por partido |
| `events/{match_id}.json` | ~1–4 MB | ~3–4k eventos; **no se guarda crudo** |

Solo se persisten filas agregadas `Player` + `PlayerMatchStats` (~decenas de
KB por partido enriquecido).

## Coste orientativo

- Sync Liga F **sin** players: 1 competitions + 1 matches file ≈ rápido, caché
  ~cientos de KB.
- Sync con `--with-players --player-stats-limit 5`: +5 lineups + 5 events
  (~10–20 MB descargados) → agregados pequeños en caché.
- Enriquecer **todos** los 240 partidos de Liga F: orden de **cientos de MB**
  descargados y sync largo; no es el default.

## Requisitos

- Node ≥ 20, red hacia `raw.githubusercontent.com` (StatsBomb open-data).
- Disco: la caché JSON sigue siendo viable con límites bajos; con stats de
  temporada completa conviene Epic 04 (SQLite).

## Recomendación

Usar `--with-players` solo en pilotos o con un `--player-stats-limit` explícito
hasta migrar persistencia (ver nota en Epic 04).
