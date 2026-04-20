# CLAUDE.md — Web Lidia Castro Fisioterapia

## Contexto del proyecto

Web de presentación/boceto para la clínica de fisioterapia de **Lidia Castro Rodríguez**. Actualmente es un **prototipo para pitching** — el objetivo es que Lidia vea el potencial y nos contrate. No es una web en producción.

**Estado actual:** Refinamiento del boceto inicial. Sin contenido real todavía (solo el logo).

---

## Cliente y marca

- **Cliente:** Lidia Castro Rodríguez — fisioterapeuta en Madrid
- **Nombre comercial:** Lidia Castro Rodríguez Fisioterapia
- **Logo:** Monocromático, serif elegante, estética editorial, femenino y premium
- **Posicionamiento:** Fisioterapia de autor, atención personalizada, bienestar premium

---

## Stack técnico

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 6
- **Estilos:** Tailwind CSS v4 (con `@tailwindcss/vite`)
- **Animaciones:** Motion (Framer Motion v11+)
- **Iconos:** Lucide React
- **Dev server:** `npm run dev` (puerto 3000)

---

## Decisiones de diseño tomadas (NO cambiar sin justificación)

### Paleta
- Fondo: `#F9F7F2` (crema cálido)
- Texto: `#1A1A1A` (negro suave)
- Acento: `#7A8870` (verde salvia apagado)
- Divisor: `rgba(26,26,26,0.1)`

### Tipografía
- Titulares: **Playfair Display** (serif, peso 700 y italic 400)
- Cuerpo/nav: **Inter** (sans-serif, pesos 300/400/600)
- Clases: `.serif-italic`, `.font-headline`, `.font-body`

### Componentes clave
- `.btn-editorial` — CTA negro con hover verde salvia
- `.vertical-label` — etiqueta rotada para secciones
- `.editorial-divider` — línea divisora sutil
- `.frame-corner` — esquina decorativa

---

## Reglas de trabajo

1. **No reescribir desde cero** sin motivo justificado — evolucionamos el diseño
2. **No añadir librerías nuevas** sin aprobación (ya hay Motion + Lucide)
3. **Todo el copy en español** — la clínica es local de Madrid
4. **Placeholder de alta calidad** — mientras no haya contenido real, usar copy creíble y premium
5. **Las imágenes son CDN de Google** — temporales, se reemplazarán por fotos reales cuando las haya

---

## Secciones de la web

1. Hero — tagline + CTA de reserva
2. Filosofía / propuesta de valor
3. Servicios (3: Fisioterapia General, Suelo Pélvico, Recuperación Funcional)
4. Metodología (3 pasos: Valoración, Tratamiento, Movimiento)
5. Sobre Lidia — perfil con fondo oscuro
6. Testimonios — 3 opiniones de pacientes
7. El Espacio / clínica
8. CTA final
9. Footer / contacto

---

## Hoja de ruta (resumen)

Ver `.claude/memory/PROJECT.md` para el detalle completo.

- Fase actual: **1 — Refinamiento visual**
- Siguiente: **2 — Revisión con cliente**
