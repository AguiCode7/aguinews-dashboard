# 📰 AguiNews · sitio de noticias en Angular 22

El sitio de AguiNews: la edición de hoy en grande, las anteriores con buscador y una página de lectura para cada edición. Consume la API del video anterior ([aguinews-api](https://github.com/AguiCode7/aguinews-api)).

▶️ **Video:** [Angular 22: tu sitio de noticias con Signals y httpResource](https://youtu.be/zutLQhcb0bM)

## Cómo funciona

| Pieza | Qué hace |
| --- | --- |
| `features/summaries/data` | Contrato con la API (`summary.ts`), lector de noticias (`news-item.ts`) y servicio con `httpResource` (`summary-api.ts`) |
| `edition-list` | Portada: signals, `linkedSignal`, `computed` y buscador en el navegador |
| `edition-card` | Tarjeta grande o compacta, pipes `relativeTime` y `highlight` |
| `edition-detail` | Página de lectura, 404, ediciones vecinas y título de la pestaña |

Angular 22 sin zone.js, OnPush por defecto, Tailwind 4 y pruebas con Vitest.

## Requisitos

- **Node 24.** Si tienes otra versión, usa un gestor de versiones: [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux), [nvm-windows](https://github.com/coreybutler/nvm-windows) o [fnm](https://github.com/Schniz/fnm). La versión está en `.nvmrc`.
- **pnpm**, activado con Corepack (viene con Node 24):

```bash
nvm install 24.15.0
nvm use 24.15.0
corepack enable pnpm
```

- La API AguiNews corriendo en `http://localhost:5080` (ver el repositorio del video 2).

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
