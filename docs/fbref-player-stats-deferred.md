# FBref player stats — diferido en v1

El adapter FBref de Epic 01 solo parsea **schedule** (`sched_*` tables).
Las stats por jugadora en FBref viven en páginas distintas (p. ej. match
summary / player match logs), con otro HTML y más riesgo de bloqueo.

## Decisión Epic 03

- **StatsBomb** es la fuente v1 de `Player` / `PlayerMatchStats`.
- **FBref → mismo schema** queda **diferido** hasta tener:
  1. Acceso estable (sin Cloudflare en el entorno de sync), y
  2. Fixtures HTML de una página de stats por partido.

No se inventan parsers sobre HTML no capturado. Cuando se retome, el mapeo
debe emitir las mismas métricas v1 (`goals`, `assists`, `minutes`,
`yellowCards`, `redCards`) con `sources: [{ source: "fbref", id }]`.
