# Diseño Visual y de Interfaz - Sistema Accesimap CL

## 1. Identidad de Marca y Paleta de Colores
 
[cite_start]El diseño de la interfaz de Accesimap CL se basa en principios de alto contraste y legibilidad universal, garantizando el cumplimiento del estándar de accesibilidad WCAG 2.1 AA[cite: 135]. La paleta busca transmitir confianza institucional para las municipalidades y amigabilidad para los ciudadanos.
 
### 1.1. Colores Base de la Marca
 
| Token de Diseño | Hex | RGB | Uso Principal |
|---|---|---|---|
| `--color-primary` | `#0056B3` | `rgb(0, 86, 179)` | Color dominante. Header municipal, botones de acción principal (ej. "Enviar Reporte"), links activos. Garantiza contraste óptimo sobre blanco. |
| `--color-primary-hover` | `#003D82` | `rgb(0, 61, 130)` | Versión más oscura del primario. Estado `hover` de botones interactivos. |
| `--color-accent` | `#FF6B00` | `rgb(255, 107, 0)` | Naranja de acento. [cite_start]Utilizado para destacar elementos de gamificación (puntos, ranking) [cite: 128] y llamadas a la acción ciudadana. |
| `--color-bg-map` | `#E9E5DC` | `rgb(233, 229, 220)` | [cite_start]Color de fondo base cuando los tiles del mapa (Mapbox) [cite: 134] aún no han cargado. |
 
### 1.2. Colores de Interfaz (Sistema)
 
[cite_start]Colores neutros funcionales construidos sobre Material UI y Tailwind CSS[cite: 135]:
 
| Token de Diseño | Hex | Uso Principal |
|---|---|---|
| `--color-bg-app` | `#FAFAFA` | Fondo general de la aplicación móvil y paneles. |
| `--color-bg-surface`| `#FFFFFF` | Fondo de tarjetas de reportes, modales y popups del mapa interactivo. |
| `--color-text-primary`| `#121212` | Texto principal. [cite_start]Alto contraste para legibilidad (WCAG 2.1 AA)[cite: 135]. |
| `--color-text-secondary`| `#5F6368` | Metadatos, fechas, descripciones secundarias y coordenadas GPS. |
| `--color-border` | `#E0E0E0` | Bordes de formularios, divisores y separadores de listas de ranking. |
 
### 1.3. Colores Semánticos de Estado (Validación IA)
 
[cite_start]Cada reporte tiene un color semántico asignado según el resultado de la validación por Azure Vision AI o revisión humana, reflejando su estado (validado, pendiente o rechazado):
 
| Estado del Reporte | Color de Fondo | Color de Marcador (Mapa) | Hex Marcador | Uso |
|---|---|---|---|---|
| `VALIDADO` | Verde claro | Verde oscuro | `#1B5E20` | [cite_start]Marcadores visibles en el mapa[cite: 372], badges de éxito. [cite_start]Indica confianza de IA $\ge 85\%$[cite: 111]. |
| `PENDIENTE` | Amarillo claro | Amarillo/Naranja | `#F57F17` | [cite_start]Reportes en zona gris que requieren validación custom/humana[cite: 143]. No visibles en el mapa público. |
| `RECHAZADO` | Rojo claro | Rojo oscuro | `#B71C1C` | [cite_start]Reportes con inconsistencias fotográficas claras detectadas por IA[cite: 110]. |
 
---
 
## 2. Tipografía
 
### 2.1. Familia Tipográfica
 
[cite_start]Accesimap CL utiliza **Roboto** como fuente principal, alineándose con los estándares de Material UI[cite: 135].
 
**Justificación de la elección:**
- [cite_start]Excelente legibilidad en dispositivos móviles, lo cual es crítico dado el enfoque *mobile-first* para el crowdsourcing ciudadano[cite: 135].
- [cite_start]Amplio soporte para caracteres y claridad en números (vital para leer coordenadas lat/long [cite: 146] [cite_start]y puntajes de gamificación [cite: 128]).
 
### 2.2. Escala Tipográfica
 
| Nombre | Tamaño | Peso | Uso |
|---|---|---|---|
| `display` | `24px` | `700` (Bold) | [cite_start]Títulos principales (ej: "Dashboard Comunal", "Ranking Mensual")[cite: 121, 128]. |
| `heading-1` | `20px` | `600` (SemiBold) | Títulos de sección o modales de reporte. |
| `body-large`| `16px` | `400` (Regular) | [cite_start]Texto principal de formularios de reporte[cite: 373]. Tamaño mínimo para evitar zoom automático en iOS. |
| `body` | `14px` | `400` (Regular) | [cite_start]Descripciones opcionales de reportes[cite: 373], metadatos en paneles. |
| `caption` | `12px` | `500` (Medium) | Etiquetas de estado (`VALIDADO`), coordenadas y timestamps. |
 
---
 
## 3. Estructura General del Layout
 
[cite_start]El sistema exige un enfoque dual radical: una experiencia **mobile-first** para el ciudadano [cite: 135] [cite_start]y un **dashboard de escritorio** para el funcionario municipal[cite: 121].
 
### 3.1. Vista Ciudadana (Mobile-First)
 
[cite_start]Optimizada para uso en la calle mientras se detectan barreras arquitectónicas[cite: 74, 75].
 
- **Bottom Navigation Bar (Navegación Inferior):**
  - [cite_start]🗺️ **Mapa:** Vista principal con Leaflet.js[cite: 134].
  - [cite_start]📸 **Reportar:** Botón flotante centralizado y destacado para abrir la cámara/formulario (RF-01)[cite: 104, 350].
  - [cite_start]🏆 **Ranking:** Acceso al sistema de gamificación y puntos (RF-05)[cite: 128, 350].
- [cite_start]**Header Top:** Mínimo, mostrando el avatar del usuario, sus puntos acumulados y un botón de opciones (perfil/anonimato)[cite: 366].
 
### 3.2. Vista Municipal (Desktop Dashboard)
 
[cite_start]Diseñada para monitoreo y descarga masiva de datos en pantallas amplias[cite: 374].
 
- **Sidebar de Navegación (Izquierda):** Ancho fijo de `260px`.
  - [cite_start]Contiene: Mapa Comunal, Estadísticas, Revisión de Reportes Pendientes, y Exportación GIS[cite: 123, 124, 350].
- **Área de Contenido Principal (Derecha):** Ocupa el resto de la pantalla. Renderiza mapas expandidos o tablas de datos.
 
---
 
## 4. Vista de Reporte Ciudadano (Crowdsourcing)
 
Pantalla crítica accesible desde el botón central de la app móvil. [cite_start]Permite subir la foto geolocalizada y la categoría[cite: 103, 104].
 
### 4.1. Formulario de Captura (RF-01)

┌─────────────────────────────────────────┐
│ ←  Nuevo Reporte de Accesibilidad       │
├─────────────────────────────────────────┤
│                                         │
│  [  📸 Tocar para abrir cámara o   ]    │
│  [     subir foto desde galería    ]    │  ← Obligatorio para validación IA 
│                                         │
│ 📍 Ubicación actual:                    │
│    Lat: -33.456, Lng: -70.648           │  ← Geolocalización automática 
│                                         │
│ 🏷️ Categoría de la barrera/acceso:      │
│   ( ) Rampa                             │
│   ( ) Ascensor                          │
│   ( ) Baño                              │  ← Categorías específicas 
│                                         │
│ 📝 Descripción (Opcional)               │
│   [ Área de texto libre... ]            │  ← 
│                                         │
│            [ Enviar Reporte ]           │  ← Botón primario
└─────────────────────────────────────────┘

## 5. Dashboard Municipal y Exportación
 
Pantalla de uso exclusivo para el rol municipal , enfocada en visualización cartográfica y descarga normativa (Ley 20.422)[cite: 62].
 
### 5.1. Mapa Principal Interactivo
 
- Ocupa el 70% de la pantalla principal. Renderizado con **Leaflet.js + Mapbox GL JS**[cite: 134].
- Muestra únicamente los reportes con estado `VALIDADO` por la IA[cite: 350, 372].
- **Popups de marcador:** Al hacer clic en un punto verde del mapa, se abre un *popup* que muestra:
  - Miniatura de la fotografía (cargada desde Azure Storage)[cite: 147].
  - Tipo de categoría (rampa, ascensor, baño).
  - Nivel de confianza otorgado por Azure Vision AI (ej. `Confianza: 92%`)[cite: 109, 111].
 
### 5.2. Panel de Filtros y Estadísticas
 
Ubicado a la izquierda o derecha del mapa:
- **Selector de Comunas Piloto:** Dropdown para filtrar entre Santiago Centro, Ñuñoa y La Reina[cite: 66, 308].
- **KPIs Comunales:** Tarjetas que muestran total de rampas validadas, total de ascensores operativos, etc.[cite: 123].
 
### 5.3. Botones de Exportación GIS (RF-04)
 
Ubicados en la cabecera del dashboard.
- Botón **"⬇ Exportar GeoJSON"**: Descarga el archivo de texto estructurado[cite: 139, 350].
- Botón **"⬇ Exportar Shapefile"**: Descarga el paquete de archivos `.shp` listos para QGIS/ArcGIS[cite: 69, 139].
 
---
 
## 6. Gamificación (RF-05)
 
Módulo diseñado para incentivar el reporte ciudadano continuo[cite: 25, 128].
 
### 6.1. Ranking y Puntos
 
- **Vista de Ranking:** Una lista ordenada con los ciudadanos más activos del mes[cite: 128, 350].
- **Diseño de la Fila de Ranking:**
  - Posición (1º, 2º, 3º destacados con íconos de medallas).
  - Avatar / Nombre (o seudónimo si el usuario optó por el anonimato)[cite: 353, 366].
  - Puntaje total resaltado en color `--color-accent` (Naranja)[cite: 128].
 
---
 
## 7. Sistema de Componentes UI (React + Tailwind + MUI)
 
Accesimap CL utiliza una combinación de **Tailwind CSS** para utilidades de diseño rápido y **Material UI (MUI)** para componentes accesibles y consistentes[cite: 135].
 
| Componente | Uso en Accesimap CL |
|---|---|
| `Button` (MUI) | Botones "Enviar Reporte", "Exportar GIS". Variantes `contained` (primario) y `outlined`. |
| `MapContainer` (React-Leaflet) | Contenedor principal de la vista cartográfica[cite: 134]. |
| `TextField` (MUI) | Campos de descripción opcional y autenticación JWT[cite: 136, 350]. |
| `Alert` / `Snackbar` (MUI) | Notificaciones de feedback tras validar o rechazar un reporte con IA[cite: 110, 350]. |
| `Card` (MUI) | Contenedores para métricas municipales y filas de ranking de gamificación[cite: 123, 128]. |
 
---
 
## 8. Estados Visuales y Feedback al Usuario
 
Debido a la latencia inherente del procesamiento de imágenes con Inteligencia Artificial, el manejo de estados de carga es crítico para la experiencia ciudadana.
 
### 8.1. Estados de Carga (Validación IA)
 
- Al presionar "Enviar Reporte", el botón muestra un *spinner* y se deshabilita.
- El sistema tiene una restricción de rendimiento RNF-02 para que la respuesta de validación tome $\le 5$ segundos[cite: 144]. Durante este tiempo, se muestra un overlay semitransparente con el mensaje *"Analizando imagen con Inteligencia Artificial..."*.
 
### 8.2. Notificaciones (Toasts)
 
- **Éxito Automático:** `"¡Reporte validado! Has ganado +10 puntos."` (Verde). Aparece si Azure Vision AI da $\ge 85\%$ de precisión[cite: 111, 128].
- **Derivación Manual:** `"Reporte recibido. En revisión por baja calidad de imagen."` (Naranja). Si la IA no puede determinar la consistencia.
- **Error:** `"No se detectó una rampa/ascensor/baño válido."` (Rojo).
- Estas notificaciones también se respaldan con el envío de un correo electrónico (RF-07).
 
---
 
## 9. Responsividad y Soporte de Dispositivos
 
| Plataforma | Comportamiento |
|---|---|
| **Smartphones (< 768px)** | Interfaz **Mobile-First**[cite: 135]. Navegación inferior (Bottom Tabs). Orientada 100% al rol Ciudadano para capturar fotografías con la cámara del teléfono y leer el GPS[cite: 136, 363]. |
| **Escritorio (≥ 1024px)** | Orientada al rol Municipalidad. Oculta herramientas de cámara y habilita los paneles anchos de mapas, tablas de datos y exportación GeoJSON/Shapefile[cite: 139, 316]. |
 
---
 
## 10. Accesibilidad (WCAG 2.1 AA)
 
Por la naturaleza del proyecto (apoyo al cumplimiento de la Ley 20.422 sobre inclusión de personas con discapacidad [cite: 62, 253]), el frontend debe cumplir estrictamente con el nivel **WCAG 2.1 AA** (RNF-04)[cite: 135, 353]:
 
- **Lighthouse Score:** Se exige un puntaje $\ge 90$ en auditorías de accesibilidad[cite: 175, 440].
- **Soporte de Lectores de Pantalla:** Todos los botones y componentes del mapa Leaflet deben tener atributos `aria-label` descriptivos.
- **Tamaño de Toque:** Los botones principales (como "Reportar") deben tener un área mínima de `44x44px` para personas con motricidad fina reducida.
- **Contraste:** Todo el texto sobre fondos de color debe superar la ratio de contraste de 4.5:1.
 
---
 
## 11. Mapa de Rutas del Frontend
 
Rutas implementadas en React Router para la Single Page Application (SPA):
 
| Ruta | Acceso / Rol | Descripción |
|---|---|---|
| `/` | Público | Pantalla de inicio (Landing) e información de la Ley 20.422. |
| `/login` | Público | Autenticación basada en JWT para Ciudadanos y Municipalidad[cite: 136, 353]. Opción de reporte anónimo. |
| `/mapa` | Ciudadano / Muni | Visualización del mapa interactivo con reportes validados[cite: 372]. |
| `/reportar` | Ciudadano | Formulario de carga de fotos, captura GPS y categoría[cite: 350, 373]. |
| `/ranking` | Ciudadano | Tabla de posiciones mensual y puntos acumulados (Gamificación)[cite: 375]. |
| `/municipal/dashboard`| Municipalidad | Panel central de estadísticas comunales y filtros[cite: 374]. |
| `/municipal/exportar` | Municipalidad | Módulo de descarga directa de puntos en GeoJSON y Shapefile[cite: 350, 393]. |