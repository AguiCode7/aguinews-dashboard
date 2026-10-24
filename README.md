# 📰 AguiNews · sitio de noticias en Angular 22

El sitio de AguiNews: la edición de hoy con tu progreso de lectura, una página de lectura para cada noticia (tamaño de letra, guardar, anterior y siguiente), el archivo con buscador y temas, y las guardadas. En el móvil, una barra abajo al alcance del pulgar. Consume la [aguinews-api](https://github.com/AguiCode7/aguinews-api).

## 📺 Serie Proyecto AguiNews

Cada video tiene su versión del código marcada con un tag.

| Video | Qué se construye | Código |
| --- | --- | --- |
| 3 · [Angular 22: tu sitio de noticias con Signals y httpResource](https://youtu.be/zutLQhcb0bM) | Portada, buscador y lectura por edición | [`v003`](https://github.com/AguiCode7/aguinews-dashboard/tree/v003) |
| 4 · [Una IA lee 7 blogs en inglés y me deja las 5 mejores en español](https://youtu.be/HhHvUosNz4E) | El lector: una página por noticia, progreso, guardadas y móvil | [`v004`](https://github.com/AguiCode7/aguinews-dashboard/tree/v004) (rama `main`) |

▶️ Playlist completa: [Proyecto AguiNews](https://www.youtube.com/playlist?list=PLSpS3teXK-LM) · La API: [aguinews-api](https://github.com/AguiCode7/aguinews-api) (videos 2, 3 y 4)

## Cómo funciona

| Pieza | Qué hace |
| --- | --- |
| `features/news/data` | Contratos con la API (`summary.ts`, `article.ts`), temas y servicio con `httpResource` (`news-api.ts`) |
| `edition-page` | Portada: la edición de hoy, noticia principal y progreso de lectura |
| `reader-page` | Página de lectura: `httpResource` por id, barra de progreso, tamaño de letra, guardar y noticia anterior o siguiente |
| `archive-page` | Ediciones anteriores con buscador y filtro por tema |
| `saved-page` | Noticias guardadas para después |
| `core/reading` | `reading-state`: leídas, guardadas y tamaño de letra con signals, guardado en `localStorage` (sin cuentas ni contraseñas) |
| `shared/pipes` | `relativeTime` y `highlight` |

Angular 22 sin zone.js, OnPush por defecto, Tailwind 4 y pruebas con Vitest.

## Requisitos

- **Node 24.** Si tienes otra versión, usa un gestor de versiones: [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux), [nvm-windows](https://github.com/coreybutler/nvm-windows) o [fnm](https://github.com/Schniz/fnm). La versión está en `.nvmrc`.
- **pnpm**, activado con Corepack (viene con Node 24):

```bash
nvm install 24.15.0
nvm use 24.15.0
corepack enable pnpm
```

- La API AguiNews corriendo en `http://localhost:5080` ([aguinews-api](https://github.com/AguiCode7/aguinews-api), tag `v004`).

## Uso

```bash
pnpm install
pnpm start          # http://localhost:4200
pnpm test           # pruebas con Vitest
pnpm lint           # ESLint
pnpm build          # versión de producción en dist/
```

## Configuración

- La URL de la API está en `src/environments/` (`environment.development.ts` en local, `environment.ts` en producción). El sitio no lleva claves: la API deja leer (GET) sin clave y pide la clave solo para escribir.
- En la API, el origen del sitio se agrega a `AppConfig:AllowedOrigins` (CORS).

## Licencia

MIT · Hecho por [AguiCode](https://www.youtube.com/channel/UCOwIey0vGlYkZBgF29ASn3A).
