# Identidad cross-source

Tipos en [`src/identity/types.ts`](../src/identity/types.ts).

## `CanonicalIdentity`

| Campo | Obligatorio | Notas |
|-------|-------------|--------|
| `id` | sí | `identity:team:…` / futuro `identity:player:…` |
| `kind` | sí | `team` \| `player` |
| `name` | sí | Nombre canónico de display |
| `aliases` | sí | Lista (puede ser vacía) |
| `sources` | sí | `SourceRef[]` de los proveedores enlazados |
| `confidence` | sí | `high` \| `medium` \| `low` |
| `status` | sí | `resolved` \| `pending` \| `rejected` |
| `competitionHint` | no | Competición usada al proponer el match |

Las entidades `Team` / `Match` del schema siguen existiendo por fuente; la
identidad es una capa de reconciliación encima, no reemplaza la provenance.

## Reglas v0

- Auto-`resolved` solo si confidence `high` y score ≥ 0.95
- El resto queda `pending` hasta `identities confirm` / `reject`
- Queries de equipos por fuente no colapsan pendientes

## Limitaciones conocidas

- **Homónimos:** dos “United” en ligas distintas pueden parecerse; el
  `competitionHint` reduce el riesgo pero no elimina falsos positivos.
- **Renombres de club:** un cambio de nombre entre temporadas no hereda
  automáticamente la identidad anterior.
- **Transliteraciones / acentos:** se normaliza NFD y se quitan marcas, pero
  grafías muy distintas (p. ej. abreviaturas raras) pueden quedar en `pending`.
- **Jugadoras:** fuera de alcance hasta Epic 03 (task opcional diferida).
- **Competiciones duplicadas:** StatsBomb y FBref crean dos `Competition`
  “Liga F” con ids distintos; la propuesta de identidades opera sobre equipos
  que comparten el nombre de competición en caché, no fusiona competiciones.
