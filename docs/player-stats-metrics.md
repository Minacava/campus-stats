# Player match metrics — v1 subset

v1 **no** almacena eventos crudos de StatsBomb. Agrega un subconjunto
estable por jugadora y partido:

| Métrica | Campo | Cómo se obtiene (StatsBomb) |
|---------|-------|------------------------------|
| Minutos | `minutes` | Suma de intervalos `positions[].from`→`to` en lineups (aprox. a minutos enteros) |
| Goles | `goals` | Eventos `Shot` con `shot.outcome.name === "Goal"` (excl. Own Goal si aparece aparte) |
| Asistencias | `assists` | Pases con `pass.goal_assist === true` (o shot.`key_pass_id` resuelto al pase) |
| Amarillas | `yellowCards` | `lineup[].cards` tipo Yellow Card / eventos equivalentes |
| Rojas | `redCards` | `lineup[].cards` tipo Red Card / Second Yellow |

## Fuera de v1

- xG, pases, carries, pressures, heatmaps
- Eventos crudos (`events/*.json` completos) en caché
- Stats de FBref player tables (task aparte; HTML distinto)

## Por qué este corte

Cubre el caso “¿quién marcó / asistió / jugó X minutos?” sin obligar a
persistir ~4k eventos por partido. Cuando el volumen de lineups+stats
empuje el JSON, pasar a SQLite (Epic 04).
