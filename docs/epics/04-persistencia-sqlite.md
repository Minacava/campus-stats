# Epic 04 — Persistencia SQLite (reemplazo de caché JSON)

## Objetivo

Sustituir `.campo-stats/cache.json` por SQLite cuando el volumen (sobre todo eventos / stats de jugadora) haga inviable cargar todo en memoria, sin romper el flujo sync/query.

## Contexto

La caché JSON es una elección deliberada de v0 (sin deps nativas, diffable, multi-OS). Candidatos: `better-sqlite3` o `node:sqlite`. El schema SQL debe reflejar el modelo de dominio y preservar provenance y merges.

### Trigger desde Epic 03

`--with-players` agrega `players` + `playerMatchStats` a la caché. Con el
default `player-stats-limit=5` el JSON sigue siendo razonable. Cuando se
enriquezca una temporada completa (cientos de partidos), **cargar todo el
JSON en memoria deja de ser viable** — ese es el disparador para este epic.
Ver `docs/player-stats-sync-cost.md`. El schema SQL debe incluir tablas
`players` y `player_match_stats` además de competitions/seasons/teams/matches/identities.

## Criterios de hecho

- Sync escribe en SQLite; queries leen desde SQLite
- Migración desde `cache.json` existente (o import one-shot) documentada
- Rendimiento aceptable en una competición con stats de jugadora (si ya existen)
- Comportamiento de merge entre syncs se mantiene

## Tasks

- [x] Elegir motor (`node:sqlite` vs `better-sqlite3`) y documentar requisito de Node/OS
- [x] Diseñar schema SQL alineado a Competition / Season / Team / Match (+ Player si aplica)
- [ ] Implementar capa repositorio (CLI y adapters no hablan SQL crudo)
- [ ] Migración / import desde `.campo-stats/cache.json`
- [ ] Mantener merge semántico en sync (upsert por identidad / provenance)
- [ ] Flags CLI para path de DB y, si hace falta, modo legacy JSON
- [ ] Tests de migración y de queries representativas
- [ ] Actualizar README: ubicación de la DB, backup, límites
