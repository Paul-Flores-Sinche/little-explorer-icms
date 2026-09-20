
## Mapa de imagenes en design/
- 00-Cover.png: portada. 00b-Mobile-Flow-Diagram.png y 00c-Staff-Web-Flow-Diagram.png: diagramas de flujo entre pantallas (usarlos como guia de navegacion).
- M1..M7 (Login, Home, Enquiry-Waitlist, MyChild, Billing, Notifications, Profile-Settings): Family Portal en vista MOVIL.
- FW1..FW7 (mismas 7 pantallas): Family Portal en vista WEB/escritorio.
- W1..W7 (Login, Dashboard, Enrolments-Bookings, Attendance, CCS-Payments, Staff-Management, Compliance-Reporting): Staff Portal, solo escritorio.

## Responsive en /family
Una sola ruta por pantalla (ej. /family/billing) que se adapta: ancho de movil usa el layout M* (bottom nav), ancho de escritorio usa el layout FW*. No crear rutas separadas para movil y web.

# Little Explorer ICMS - Interactive Demo

Demo navegable (NO un sistema real) del Integrated Childcare Management System de "Little Explorer Early Learning Centre". Es para el curso PRT631 (CDU), Group 13, entrega del prototipo Week 7-8. Se despliega en Vercel para compartir un link.

## Alcance (importante)
- Solo frontend con datos mock. Sin backend, sin base de datos, sin autenticacion real.
- "Sign In" solo navega a la pantalla siguiente. Los formularios no guardan nada (pueden mostrar un mensaje de exito falso).
- No agregar funcionalidades fuera de las pantallas listadas abajo.

## Stack
Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui. Datos en `src/data/mock-data.ts`. Deploy en Vercel.

## Marca
- Primario: sage/teal #2F6F5E. Acento: coral #E8875A.
- Titulos: Baloo 2. Cuerpo: Manrope (via next/font/google).
- Tono calido, amigable, apto para familias y educadores.

## Dos areas en un solo sitio
- `/family` - Family Portal. Responsive (ver mas abajo), con bottom nav en movil. Persona: Sarah Thompson (madre), hija Ava Thompson.
  Pantallas: Login, Home, Enquiry (tabs: My Enquiries / New Enquiry), My Child (tabs: Attendance / Learning Portfolio), Billing (tabs: Invoices / Payment History), Notifications, Profile (con Log Out que vuelve a Login).
  Flujos cruzados: Notifications -> Billing / My Child; acceso rapido de Home -> New Enquiry.
- `/staff` - ICMS Staff. Solo escritorio/tablet, con sidebar. Persona: Maria Reyes (Admin Officer).
  Pantallas: Login, Dashboard, Enrolments & Bookings, Attendance, CCS & Payments, Staff Management, Compliance & Reporting.
  Acciones rapidas del Dashboard -> Enrolments / Attendance.
- La raiz `/` es una landing simple con dos botones: "Family Portal" y "Staff Portal".

## Datos mock de referencia
Saldo de Sarah: $184.50. Ninos matriculados: 112. Reusar la ocupacion por sala y demas cifras que aparecen en las imagenes de `design/`.

## Referencia visual
Las imagenes en `design/` son los wireframes de alta fidelidad aprobados. Replicar su layout, jerarquia y contenido lo mas fielmente posible.

## Reglas de trabajo
- Componentes reutilizables (Button, Card, Tabs, BottomNav, Sidebar, StatTile).
- Todo el texto de la UI en ingles.
- Correr `npm run build` antes de cada commit para asegurar que Vercel no falle.
- Commits pequenos y descriptivos.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
