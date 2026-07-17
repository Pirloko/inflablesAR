# Arriendoinflables — Catálogo de inflables con AR

Web app para arriendo de juegos inflables en Rancagua. Diferenciador: el cliente ve
cada inflable **a escala real en su patio** vía WebAR (model-viewer), sin instalar apps.

## Comandos

- `npm run dev` — dev server (Turbopack). Para probar AR desde el celular, usar la IP
  de la red local (ej. `http://192.168.x.x:3000`); Scene Viewer/Quick Look requieren
  HTTPS o localhost, así que la prueba real de AR conviene hacerla en el deploy de Vercel.
- `npm run build` — build de producción.
- `npm run generate-models` — regenera los GLB (caja a escala real + zona de seguridad)
  para TODOS los inflables, los sube al bucket `models` y actualiza `model_url` y `photos`.
  Correr después de agregar/editar un inflable o subir fotos nuevas.
- `npm run lint`.

## Stack

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind 4 + Supabase (solo Postgres
y Storage, sin auth) + `@google/model-viewer`. Deploy pensado para Vercel.

## Supabase

- Proyecto: `arriendoinflables` (`ohdwvcsxahvtqjaefpae`, región sa-east-1).
- Tabla única `inflatables` con RLS: lectura pública (`anon`) solo de filas `active`.
  La escritura es solo por dashboard o service role — no hay panel de administración.
- Buckets públicos: `photos` (fotos por carpeta `photos/{slug}/...`) y `models` (GLB).
- Las migraciones aplicadas viven en `supabase/migrations/` (aplicadas vía MCP, no CLI
  link). Ojo: desde 2026 las tablas nuevas requieren `GRANT` explícito a `anon` para
  quedar expuestas en la Data API.

## Flujo para agregar un inflable

1. Insertar la fila en `inflatables` (dashboard de Supabase), con `slug` kebab-case.
2. Subir fotos JPG/PNG a `photos/{slug}/` en Storage (la primera alfabéticamente se usa
   como textura del modelo 3D y foto principal).
3. `npm run generate-models` — sincroniza `photos` y genera/sube el GLB.

## Convenciones

- Textos en español chileno, tono cercano (clientes: papás organizando cumpleaños).
- Mobile-first: el 90% del tráfico llega de Instagram/WhatsApp en celular.
- `lib/fits.ts` es la única fuente de verdad de "¿cabe?": footprint + margen por lado,
  probando también la orientación girada 90°.
- Los GLB usan metros reales (1 unidad glTF = 1 m) y `ar-scale="fixed"` en model-viewer
  para que el usuario no pueda reescalar.
- Env vars en `.env.example`. `SUPABASE_SECRET_KEY` es solo para scripts locales;
  jamás exponerla con prefijo `NEXT_PUBLIC_`.

## Lo que la v1 NO hace (a propósito)

Reservas/calendario, pagos online, panel de administración, auth de usuarios.
