# Epic 05 — Publicación npm (`campo-stats`)

## Objetivo

Publicar el paquete/CLI en npm para poder usarlo con `npx campo-stats ...` sin paso de install local del repo.

## Contexto

El nombre provisional es `campo-stats`. Antes de publicar: exports/bin correctos, build TypeScript, README de consumo, versión semver y checklist legal (MIT + créditos de fuentes de datos).

## Criterios de hecho

- Paquete instalable desde npm (o dry-run de publish verificado)
- `npx campo-stats --help` / sync básico funciona tras install
- Versión y changelog claros; CI de release documentado o automatizado

## Tasks

- [ ] Cerrar nombre final del paquete (`campo-stats` u scoped) y `package.json` (name, bin, exports, files)
- [ ] Asegurar build reproducible (`npm run build`) y entrypoints CLI correctos
- [ ] README orientado a usuarias/os (quickstart npx, competiciones soportadas, créditos)
- [ ] Definir semver inicial (p. ej. `0.1.0`) y qué garantiza esa versión
- [ ] Checklist pre-publish: licencia, términos de datos, `.npmignore` / `files`, no filtrar caché ni fixtures enormes
- [ ] Probar pack local (`npm pack`) e install desde tarball
- [ ] (Opcional) Pipeline CI: test + publish on tag
- [ ] Publicar y verificar `npx campo-stats` en un directorio limpio
