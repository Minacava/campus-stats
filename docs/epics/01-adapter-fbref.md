# Epic 01 — Adapter FBref (segunda fuente)

## Objetivo

Añadir FBref como segundo origen público, normalizado al mismo esquema que StatsBomb, sin tocar la lógica del CLI ni de la caché más allá de registrar la nueva fuente.

## Contexto

FBref ofrece cobertura más amplia de ligas, pero suele ser HTML scrapeado (no API JSON limpia). Requiere rate-limiting, parsing robusto y documentación clara de términos de uso. El adapter debe vivir en `src/sources/` e implementar `FootballSource`.

## Criterios de hecho

- Existe un adapter FBref que devuelve `Competition` / `Season` / `Team` / `Match` canónicos
- `sync` puede apuntar a FBref (flag o detección por competición) sin romper StatsBomb
- Rate-limit y errores de red/parsing están controlados y documentados
- Al menos una competición femenina real se sincroniza de extremo a extremo

## Tasks

- [x] Elegir competiciones femeninas piloto en FBref (p. ej. WSL / Liga F) y documentar URLs/estructura HTML
- [ ] Diseñar cliente HTTP con rate-limit, retries y User-Agent responsable
- [ ] Implementar parser → entidades canónicas (sin filtrar nombres crudos de FBref al CLI)
- [ ] Registrar provenance `sources: [{ source: "fbref", id }]`
- [ ] Integrar el adapter en el registro de fuentes y en `sync` (sin romper el adapter StatsBomb)
- [ ] Tests con fixtures HTML/JSON offline (no depender de red en CI)
- [ ] Documentar en el adapter y en el README: límites, términos, cómo ejecutar sync FBref
- [ ] Verificar merge en caché: sync StatsBomb + sync FBref coexisten en el mismo `cache.json`
