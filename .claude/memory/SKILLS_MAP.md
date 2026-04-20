# Mapa de skills — Web Lidia Castro Fisioterapia

Guía de cuándo usar cada skill disponible en Claude Code para este proyecto.
Objetivo: no tener que pensar cuál skill usar — simplemente consultar esta tabla.

---

## Skills de diseño UI/UX

| Situación | Skill | Comando | Cuándo invocar |
|-----------|-------|---------|----------------|
| El layout se siente mal, el espaciado irregular | arrange | `/arrange` | Cuando el ritmo visual no fluye o los grids están desbalanceados |
| La tipografía no termina de funcionar | typeset | `/typeset` | Al ajustar jerarquía, pesos, tamaños, line-height |
| Quiero añadir micro-animaciones | animate | `/animate` | Para hover effects, scroll reveals, transiciones de sección |
| Revisión final antes de mostrar al cliente | polish | `/polish` | Siempre antes de cada presentación a Lidia |
| Auditoría completa de calidad | audit | `/audit` | Al final de Fase 3 (contenido real integrado) |
| Algo se ve muy monocromático | colorize | `/colorize` | Si el verde salvia no es suficiente y falta vida visual |
| Crear una sección o componente nuevo | frontend-design | `/frontend-design` | Para nuevos bloques de UI con criterio premium |
| Revisar responsive mobile/tablet | adapt | `/adapt` | Al final de cada fase de desarrollo |
| El diseño se siente demasiado recargado | distill | `/distill` | Si se acumulan elementos innecesarios |
| El diseño se siente demasiado seguro/aburrido | bolder | `/bolder` | Si el cliente quiere más impacto |
| El diseño se siente muy agresivo/ruidoso | quieter | `/quieter` | Si algo rompe la calma del brand |
| Evaluar con ojo crítico una sección | critique | `/critique` | Antes de presentar al cliente, para validar decisiones |
| Mejorar el copy de botones/labels/errores | clarify | `/clarify` | Cuando el microcopy no comunica bien |
| Añadir momentos de deleite sutiles | delight | `/delight` | En Fase 5, cuando todo funcione y queramos diferenciarnos |

---

## Skills de código y proyecto

| Situación | Skill | Comando | Cuándo invocar |
|-----------|-------|---------|----------------|
| Después de un bloque de implementación grande | simplify | `/simplify` | Para limpiar el código añadido |
| Hay muchos prompts de permisos molestos | fewer-permission-prompts | `/fewer-permission-prompts` | Una vez por sesión si hay fricción |
| Cambiar settings.json o hooks | update-config | `/update-config` | Para configurar comportamientos automáticos |
| Revisar un PR antes de mergear | review | `/review` | Al final de cada fase cuando se trabaje con branches |
| Revisar seguridad antes de deploy | security-review | `/security-review` | Antes de Fase 6 (despliegue) |
| Optimizar performance | optimize | `/optimize` | En Fase 5 (SEO y optimización) |

---

## Flujo de trabajo recomendado por fase

### Al iniciar una sesión de trabajo
1. Leer `.claude/memory/PROJECT.md` para ver el estado actual
2. Identificar en qué fase estamos y qué queda por hacer

### Al implementar cambios visuales
1. Implementar los cambios
2. `/simplify` para limpiar
3. Si es un bloque visual importante: `/critique` para validar

### Antes de presentar al cliente
1. `/polish` — revisión de detalle
2. `/adapt` — revisar mobile
3. `npm run dev` — revisar en vivo

### Al final de Fase 3 (contenido real)
1. `/audit` — auditoría completa
2. `/typeset` — revisión tipográfica
3. `/optimize` — performance

---

## Skills que NO aplican a este proyecto (por ahora)

- `overdrive` — demasiado técnico/experimental para este cliente
- `onboard` — no hay flujo de onboarding de usuarios
- `harden` — sin formularios complejos ni edge cases de momento
- `normalize` — no hay design system formal todavía
- `extract` — no hay componentes suficientes para extraer patterns
- `teach-impeccable` — se podría usar en Fase 3 para establecer guías definitivas
