# Campus (`campo-stats`)

Capa de datos abierta para fútbol femenino: paquete npm/CLI que normaliza estadísticas desde fuentes públicas dispersas en un esquema único consultable.

La cobertura de datos en fútbol femenino va muy por detrás del masculino. Los datos existen; están repartidos e inconsistentes. `campo-stats` los obtiene de proveedores públicos (empezando por StatsBomb Open Data) y los unifica para consultar Liga F, WSL, NWSL, etc. del mismo modo.

> **Nombre:** `campus` ya estaba tomado en npm; el paquete se publica como `campo-stats`.

## Plan de trabajo

El desglose en epics y tasks (checklists) está en [`docs/epics/`](./docs/epics/README.md).

| Epic | Descripción |
|------|-------------|
| [00 — Fundación v0](./docs/epics/00-fundacion-v0.md) | Esquema, StatsBomb, CLI, caché JSON |
| [01 — Adapter FBref](./docs/epics/01-adapter-fbref.md) | Segunda fuente pública |
| [02 — Identidad](./docs/epics/02-resolucion-identidad.md) | Resolución cross-source |
| [03 — Stats jugadora](./docs/epics/03-stats-jugadora.md) | Stats a nivel jugadora por partido |
| [04 — SQLite](./docs/epics/04-persistencia-sqlite.md) | Persistencia más allá del JSON |
| [05 — npm](./docs/epics/05-publicacion-npm.md) | Publicación del paquete |

## Licencia

Código: MIT. Datos: sujetos a los términos de cada fuente (p. ej. crédito a StatsBomb en análisis publicados).
