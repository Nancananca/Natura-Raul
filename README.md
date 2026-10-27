# NATURA · NANCA × CUEVA

Entrega de presentación al cliente. Web estática completa, con modelo interactivo, diez renders, ficha, tiempos orientativos y dos PDF. Una sola vivienda, fachadas blancas y jardín.

## Publicar y obtener el enlace del cliente

1. Crea un repositorio en tu cuenta de GitHub. Con GitHub Free, utiliza un repositorio público para activar Pages.
2. Descomprime el ZIP y sube **su contenido** a la raíz del repositorio, en la rama `main`. En la raíz deben verse `index.html`, `.nojekyll`, `assets/`, `renders/`, `vendor/` y `documentos/`. No subas el ZIP como único archivo ni metas todo dentro de otra carpeta.
3. En el repositorio abre **Settings → Pages → Build and deployment**. Elige **Deploy from a branch**, rama **main**, carpeta **/(root)** y pulsa **Save**.
4. Cuando termine la publicación, abre **Visit site** en esa misma pantalla y copia esa dirección para el cliente. Será una dirección del tipo `https://TU-USUARIO.github.io/TU-REPOSITORIO/`; los nombres reales dependen del repositorio que crees.

GitHub Pages sirve una web pública. La dirección que se comparte es la de **Pages**, no la dirección `github.com/...` donde se ven los archivos. El paquete contiene los datos de geometría y emplazamiento necesarios para el modelo.

[Instrucciones oficiales de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Qué está listo

- Portada visual con ficha de la vivienda y tiempos desplegables.
- Mundo 3D único: exterior, parcela, cámaras interiores, sección y luz.
- Plantas a escuadra sin iluminación, sombras ni reflejos; PB/P1, estancias y centrado.
- Alzados frontal y posterior y perfiles izquierdo y derecho, en proyección ortográfica.
- Presentación de 18 páginas y planos A3 de 7 láminas, con los perfiles laterales.
- Fuentes y librerías locales: no necesita CDN, claves, instalación de paquetes, compilación, Node, Python ni servidor de aplicación en GitHub.
- Rutas relativas compatibles con cualquier nombre de repositorio y con la publicación en una subcarpeta.

Solo se ofrecen presentación y planos al cliente. El paquete no incorpora el archivo V1, presupuestos, IFC, Excel, despieces ni las herramientas internas de trabajo.

## Revisar en local (opcional)

En Windows, ejecuta `ARRANCAR.cmd`. Utiliza Python 3 instalado o el entorno de Codex si está disponible. También puedes ejecutar `python iniciar_local.py` en esta carpeta. Se abre un servidor solo en `127.0.0.1`; se detiene con Ctrl+C o cerrando la consola.

En GitHub Pages no se ejecutan estos dos archivos: la web funciona directamente en el navegador. No abras el HTML mediante `file://` para probar el mundo 3D, porque los módulos JavaScript necesitan HTTP o HTTPS.

## Documentos y mantenimiento

- `documentos/Natura_V2_Presentacion.pdf`: presentación, ficha de vivienda y lámina de tiempos.
- `documentos/Natura_V2_Planos.pdf`: emplazamiento, plantas, cubierta, fachadas, sección y perfiles.
- `assets/cliente.css` y `assets/cliente.js`: diseño y navegación.
- `assets/experiencia.js`: visor, geometría y controles; datos del modelo incrustados en `index.html`.
- `MANIFIESTO_SHA256.json`: comprobación de integridad de los archivos de entrega.

Los plazos son orientativos y las imágenes representan una intención arquitectónica. Las licencias de Three.js, Outfit y Manrope están incluidas junto a sus archivos. No se añade una licencia de software abierta al contenido arquitectónico del proyecto.
