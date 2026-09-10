# Campus / campo-stats — Epics

Capa de datos abierta para fútbol femenino: un paquete npm/CLI que normaliza estadísticas desde fuentes públicas dispersas e inconsistentes en un **esquema único consultable**.

## Por qué existe

La cobertura de datos en fútbol femenino va muy por detrás del masculino. Los datos existen, pero están repartidos en formatos inconsistentes y muchas herramientas del juego masculino no los cubren. `campo-stats` no inventa datos: los obtiene de proveedores que ya los publican y los unifica para poder consultar Liga F, WSL, NWSL, etc. del mismo modo.

El paquete npm se llama `campo-stats`.

## Estado actual (v0)

- Un esquema canónico: `Competition`, `Season`, `Team`, `Match`
- Un adapter: [StatsBomb Open Data](https://github.com/statsbomb/open-data)
- CLI: `sync`, `competitions`, `seasons`, `teams`, `matches`
- Caché local JSON (`.campo-stats/cache.json`), merge en cada sync
- Provenance por entidad (`sources: [{ source, id }]`)

## Orden de los epics

| # | Epic | Depende de |
|---|------|------------|
| 00 | [Fundación v0](./00-fundacion-v0.md) | — |
| 01 | [Adapter FBref](./01-adapter-fbref.md) | 00 |
| 02 | [Resolución de identidad](./02-resolucion-identidad.md) | 01 |
| 03 | [Stats a nivel jugadora](./03-stats-jugadora.md) | 00 (idealmente 02) |
| 04 | [Persistencia SQLite](./04-persistencia-sqlite.md) | 00 (necesario antes/durante 03 a escala) |
| 05 | [Publicación npm](./05-publicacion-npm.md) | API estable (tras 01–04 según alcance del release) |

Cada epic lista **Tasks** como checkboxes. Márcalas al completarlas; no inventes alcance fuera de la lista sin actualizar el epic.
