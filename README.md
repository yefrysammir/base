# PWA Base Template Salem

## Archivos

```
pwa-template/
├── index.html      ← Shell HTML con todos los meta tags
├── styles.css      ← Tokens, reset, componentes base
├── app.js          ← Lógica global (loader, gestos, SW, etc.)
├── manifest.json   ← Web App Manifest
├── sw.js           ← Service Worker (cache shell)
├── icons/          ← Generar con https://maskable.app o https://realfavicongenerator.net
│   ├── icon-72.png … icon-512.png
│   ├── icon-180.png   (apple-touch-icon)
│   └── favicon.ico
└── screenshots/    ← Opcionales para el manifest
```

## Checklist al crear un nuevo proyecto

1. **Renombrar** `App Name` en `index.html`, `manifest.json` y la variable `CACHE_NAME` en `sw.js`.
2. **Iconos**: genera el set completo con [RealFaviconGenerator](https://realfavicongenerator.net) y colócalos en `icons/`.
3. **Colores**: ajusta `--c-bg`, `--c-accent`, `theme-color` meta y `background_color`/`theme_color` en el manifest.
4. **HTTPS obligatorio** para que el Service Worker y el "Agregar a pantalla de inicio" funcionen.
5. **Splash iOS** (opcional): descomenta los `<link rel="apple-touch-startup-image">` en `index.html` y genera los PNGs con las dimensiones exactas de cada iPhone.

## Lo que ya viene resuelto

| Feature | Cómo |
|---|---|
| Sin selección de texto | `user-select: none` global; los `input`/`textarea` lo recuperan |
| Sin drag de imágenes | `-webkit-user-drag: none` en `img, svg` |
| Sin zoom | `maximum-scale=1, user-scalable=no` en viewport + bloqueo doble-tap JS |
| Sin pull-to-refresh | `overscroll-behavior-y: contain` en `main` y JS |
| Safe areas top/bottom | `env(safe-area-inset-*)` via `--sat`/`--sab` en CSS + JS fallback |
| Status bar transparente iOS | `apple-mobile-web-app-status-bar-style: black-translucent` |
| Tap highlight quitado | `-webkit-tap-highlight-color: transparent` |
| Ripple feedback | JS ligero en botones/nav |
| Loader animado | Letras que aparecen + barra de progreso; se oculta al cargar |
| Detección PWA vs Browser | Clase `.mode-pwa` o `.mode-browser` en `<html>` |
| Offline detection | Clase `.offline` en `<html>` |
| Haptics | `window.haptic('light'|'medium'|'heavy')` |
| Service Worker | Cache-first para shell, network-first para `/api/` |
| Viewport height fix | Variable `--vh` para reemplazar `100vh` en Safari |

## Variables CSS clave

```css
/* Usar estas en vez de valores fijos */
padding-top: var(--sat);      /* safe area top */
padding-bottom: var(--sab);   /* safe area bottom */
height: calc(var(--vh, 1vh) * 100); /* viewport height real */
```
