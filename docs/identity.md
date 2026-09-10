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
