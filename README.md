# Cinewann — primera versión

Aplicación web adaptable con instalación PWA, buscador, filtros por categorías, reproductor HTML5 y formulario para agregar enlaces directos de videos autorizados. No incluye anuncios ni pagos.

## Requisitos
- Node.js 20.19+ (o una versión compatible vigente) y npm.
- Conexión a internet para reproducir videos remotos.
- No se necesita cuenta de streaming.

## Ejecutar localmente
Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Abre la dirección local que indique Vite (normalmente `http://localhost:5173`).

## Crear versión de producción
```bash
npm run build
npm run preview
```
Los archivos publicados quedan en `dist/`.

## Publicar gratis en Cloudflare Pages
1. Sube el contenido de esta carpeta a un repositorio de GitHub.
2. En Cloudflare, abre Workers & Pages → Create → Pages → Connect to Git.
3. Selecciona el repositorio.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Publica. Puedes conectar un dominio propio si tienes uno.

Alternativamente, sigue la guía oficial de despliegue de Vite: https://vite.dev/guide/static-deploy.html

## Instalar en Android
1. Publica primero el sitio mediante HTTPS.
2. Ábrelo en Chrome para Android.
3. Usa el menú ⋮ → Instalar aplicación / Añadir a pantalla de inicio.
4. Para un APK o publicación en Google Play, hay que empaquetar el sitio PWA con Bubblewrap/TWA, verificar el dominio con Digital Asset Links, firmar el paquete y cumplir las políticas vigentes de Google Play. No se genera un APK automáticamente con este proyecto.

## Contenido y derechos
Los tres videos de muestra apuntan a archivos MP4 públicos de demostración; verifica los términos/licencias del proveedor y consigue autorización para su uso antes de publicarlos de forma permanente. Los nombres “Anime gratuito”, “Documentales” y “Series libres” son espacios de catálogo, no contienen episodios con derechos ajenos. Usa solo archivos propios, de dominio público o con una licencia/permiso que permita la reproducción en tu servicio.

## Limitaciones de esta versión
- No aloja ni transcodifica video; reproduce URLs directas compatibles con el navegador.
- Los videos añadidos desde el formulario se guardan solo en el almacenamiento local del dispositivo/navegador.
- No hay cuentas, sincronización entre dispositivos, perfiles ni backend.
- El service worker guarda la interfaz para una carga más rápida; no descarga películas para verlas sin conexión.
- Sin anuncios y sin suscripción para el usuario final; el alojamiento y el tráfico pueden tener límites o costos según el proveedor.
