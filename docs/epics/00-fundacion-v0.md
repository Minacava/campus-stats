# Epic 00 — Fundación v0 (esquema, StatsBomb, CLI, caché JSON)

## Objetivo

Dejar el núcleo del producto listo, documentado y verificable: esquema canónico, adapter StatsBomb, CLI de sync/query y caché JSON local con provenance.

## Contexto

v0 ya está esbozado en el starter: `src/types.ts` define entidades provider-agnostic; cada fuente implementa `FootballSource` bajo `src/sources/`; el CLI y la caché nunca ven nombres crudos del proveedor. StatsBomb Open Data cubre Liga F, WSL, Frauen-Bundesliga, Serie A Women, NWSL, Women's World Cup y UEFA Women's Euro.

**Licencia:** código MIT; datos sujetos a términos de cada fuente (crédito StatsBomb obligatorio en análisis publicados).

## Criterios de hecho

- `npm install && npm run build` funciona
- `sync --competition "Liga F"` trae partidos reales de una temporada StatsBomb
- Queries CLI listan competitions / seasons / teams / matches desde la caché
- Un segundo `sync` de otra competición **mergea**, no borra
- README del paquete documenta quickstart, esquema, términos de datos y cómo añadir adapters

## Tasks

- [x] Inventariar el código existente (types, sources, CLI, cache) y alinear el README del repo con la visión Campus / campo-stats
- [x] Definir y documentar el esquema canónico `Competition`, `Season`, `Team`, `Match` (campos obligatorios vs opcionales)
- [x] Completar / endurecer el adapter StatsBomb (`FootballSource`) con mapeo estable y provenance `sources`
- [x] Implementar caché JSON en `.campo-stats/cache.json` con merge por sync (no replace)
- [ ] CLI: `sync --competition`, `competitions`, `seasons`, `teams`, `matches` con filtros documentados
- [ ] Tests de contrato: sync Liga F (o fixture offline) + query de un equipo en una temporada
- [ ] Documentar términos StatsBomb y obligación de crédito en README / cabecera del adapter
- [ ] Checklist de “contribución de adapters”: interfaz `FootballSource`, normalización, docs de límites/API keys
