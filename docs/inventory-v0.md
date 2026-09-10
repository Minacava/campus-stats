# Inventario v0 — estado del repositorio

Fecha: 2026-09-10  
Proyecto: Campus / `campo-stats` (`marina34/campus`)

## Qué hay hoy

| Área | Estado |
|------|--------|
| `src/types.ts` | No existe — pendiente Epic 00 task esquema |
| `src/sources/` | No existe — pendiente adapter StatsBomb |
| CLI | No existe |
| Caché JSON | No existe |
| `package.json` / build | No existe |
| Epics | `docs/epics/` (00–05) |
| README | Visión Campus + enlace a epics |

## Conclusión

El repo es **greenfield** respecto al código del paquete. El diseño de referencia está en los epics y en la visión del README (esquema canónico, adapters `FootballSource`, caché JSON merge, CLI sync/query, StatsBomb como primera fuente).

Las siguientes tasks del Epic 00 crean esa base en orden: tipos → adapter → caché → CLI → tests → docs de términos → checklist de contribución.
