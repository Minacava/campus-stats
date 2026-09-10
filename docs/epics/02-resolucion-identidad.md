# Epic 02 — Resolución de identidad cross-source

## Objetivo

Unificar equipos (y, cuando exista el modelo, jugadoras) que aparecen con IDs distintos en StatsBomb y FBref en una identidad canónica consultable.

## Contexto

Cada entidad ya lleva `sources[]` con provenance. Con dos fuentes, el mismo equipo puede figurar dos veces. La resolución se apoya en fuzzy name + aliases + contexto (competición/temporada), sin tirar la provenance.

**Dependencia:** Epic 01 (hace falta ≥2 fuentes para reconciliar de verdad).

## Criterios de hecho

- Hay un modelo de identidad canónica (ID interno + aliases / source IDs)
- Un flujo de matching produce enlaces o candidatos revisables
- Las queries CLI pueden resolver por nombre canónico sin duplicar equipos “obvios”
- Casos ambiguos no se fusionan a ciegas (confianza / revisión)

## Tasks

- [ ] Diseñar modelo: canonical ID, aliases, enlaces a `sources[]`, nivel de confianza
- [ ] Implementar matching de equipos (nombre normalizado + competición/temporada)
- [ ] Definir reglas: auto-merge vs candidato pendiente de revisión
- [ ] Persistir resoluciones en caché (o tabla dedicada si ya hay SQLite)
- [ ] Exponer en CLI: listar duplicados / identidades y, si aplica, confirmar/rechazar matches
- [ ] Fixtures con conflictos reales (mismo club, nombres distintos entre StatsBomb y FBref)
- [ ] Documentar limitaciones (homónimos, renombres de club, transliteraciones)
- [ ] (Opcional, si Epic 03 avanzó) Extender el mismo enfoque a jugadoras
