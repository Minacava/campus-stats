# Persistencia SQLite — elección de motor

## Decisión

Usar **`node:sqlite`** (módulo built-in de Node.js).

| Criterio | `node:sqlite` | `better-sqlite3` |
|----------|---------------|------------------|
| Dependencia nativa extra | No | Sí (compile / prebuilds) |
| Node requerido | **≥ 22.5** (stable-ish; flag experimental historico) / documentamos **≥ 22** | ≥ 18 típico |
| Sync API | Sí (`DatabaseSync`) | Sí |
| Empaquetado npm | Más simple para CLI | Más fricción en install |

## Requisitos

- **Node.js ≥ 22** (alineado con el runtime del agente; `package.json` engines se actualiza).
- Sin binarios nativos adicionales → mejor DX en `npx campo-stats`.

## Nota

Si en algún entorno `node:sqlite` no estuviera disponible, el fallback documentado
es mantener la caché JSON (legacy) hasta que el runtime cumpla el mínimo.
