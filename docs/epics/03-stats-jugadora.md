# Epic 03 — Stats a nivel jugadora por partido

## Objetivo

Extender el esquema más allá de competición/temporada/equipo/partido hacia estadísticas individuales por partido, normalizadas entre fuentes.

## Contexto

StatsBomb publica event files ricos pero grandes; v0 los omite a propósito. Incorporarlos implica nuevas entidades, más volumen y, en la práctica, presión para abandonar “cargar todo el JSON en memoria” (ver Epic 04).

## Criterios de hecho

- Esquema documentado para `Player` y stats por partido (campos mínimos acordados)
- Al menos StatsBomb expone un subconjunto usable de stats de jugadora
- CLI puede listar/consultar stats por partido / jugadora / equipo
- El volumen no rompe el flujo sync en una competición piloto

## Tasks

- [x] Diseñar entidades `Player` y `PlayerMatchStats` (o equivalente) alineadas al resto del schema
- [x] Decidir subconjunto v1 de métricas (goles, asistencias, minutos, tarjetas, etc.) vs eventos crudos
- [x] Extender adapter StatsBomb para event files / stats de jugadora con provenance
- [ ] (Si Epic 01 listo) Mapear el equivalente disponible en FBref al mismo schema
- [ ] Ampliar CLI: queries de jugadoras y stats por partido/temporada
- [ ] Tests con fixture reducido de eventos (no subir dumps enormes al repo)
- [ ] Documentar coste de sync y requisitos de almacenamiento
- [ ] Coordinar con Epic 04 si el JSON en memoria deja de ser viable
