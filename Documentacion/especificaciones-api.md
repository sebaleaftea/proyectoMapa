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

El JWT contiene los siguientes claims relevantes para el sistema:ClaimDescripciónsubCorreo electrónico o identificador del usuario autenticado.userIdUUID del usuario en la base de datos PostgreSQL.roleRol del usuario en el sistema (CIUDADANO, MUNICIPALIDAD, ADMINISTRADOR). Utilizado por la capa de seguridad (@PreAuthorize) para validar permisos RBAC.expTimestamp de expiración del token (24 horas).Proceso de validación en Spring Security:Un filtro JwtAuthenticationFilter intercepta cada petición.Extrae el token del header Authorization.Verifica la firma digital del JWT usando la clave secreta inyectada por variable de entorno.Verifica que el token no haya expirado (exp).Extrae el role del payload y establece el contexto de seguridad (SecurityContext).Si cualquier validación falla, retorna 401 Unauthorized antes de llegar al controlador.Respuesta ante token inválido o ausente:

{
  "error": "AUTH_REQUIRED",
  "message": "El token de autenticación es inválido, ha expirado o no fue enviado."
}

3. Validación de Esquemas (Jakarta Validation)
Accesimap CL utiliza Jakarta Validation (Hibernate Validator), el estándar nativo de Spring Boot, para validar todos los payloads de entrada mediante anotaciones (@Valid, @NotNull, @Size, etc.).

3.1. Patrón de Uso en Controladores
Cada DTO (Data Transfer Object) define sus reglas de validación. El controlador las evalúa automáticamente antes de ejecutar el servicio:

public class CambioEstadoDTO {
    @NotNull(message = "El estado no puede ser nulo")
    @Pattern(regexp = "^(VALIDADO|RECHAZADO|PENDIENTE)$")
    private String nuevoEstado;
}

// En el Controlador:
@PatchMapping("/{id}/estado")
public ResponseEntity<?> cambiarEstado(@PathVariable UUID id, @Valid @RequestBody CambioEstadoDTO dto) {
    // Si la validación falla, un ControllerAdvice captura la excepción y retorna un 400 estructurado.
}

4. Estructura de Respuestas
4.1. Respuesta Exitosa
Todas las respuestas exitosas siguen la siguiente estructura base:
{
  "data": { ... },
  "message": "Descripción opcional del resultado."
}
Para listados (arrays), se incluye la paginación o el conteo:

{
  "data": [ ... ],
  "count": 150
}
4.2. Respuesta de Error
Todas las respuestas de error (gestionadas mediante @RestControllerAdvice) siguen esta estructura:

{
  "error": "CODIGO_ERROR",
  "message": "Descripción legible del error.",
  "details": {
    "campo": "Motivo específico del fallo de validación"
  }
}

```
---

### Parte 2: Endpoints de Reportes, IA y Exportación GIS

```markdown
# Especificación de API REST - Accesimap CL (Parte 2)

## 5. Endpoints de Reportes y Validación IA (Crowdsourcing)
 
### `POST /api/v1/reportes`
 
Recibe un nuevo reporte ciudadano desde la aplicación móvil. Ejecuta la validación síncrona contra Azure Vision AI.
 
**Autenticación:** JWT requerido. Roles: `CIUDADANO` (Autenticado o Anónimo).
**Content-Type:** `multipart/form-data`
 
#### Payload (Form-Data)
 
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `foto` | `File` | Sí | Archivo de imagen (JPEG/PNG). Tamaño máximo: 5MB. |
| `latitud` | `Double` | Sí | Coordenada GPS capturada por el dispositivo (Ej: `-33.4569`). |
| `longitud` | `Double` | Sí | Coordenada GPS capturada por el dispositivo (Ej: `-70.6482`). |
| `categoria` | `String` | Sí | Infraestructura evaluada. Valores: `RAMPA`, `ASCENSOR`, `BAÑO`. |
| `descripcion` | `String` | No | Texto libre con detalles adicionales. |
 
#### Lógica de Procesamiento (Backend)
 
1. Subida del archivo a **Azure Storage**. Se obtiene la URL temporal.
2. Llamada a **Azure Vision AI** pasando la URL de la foto.
3. El motor en Java compara las etiquetas retornadas por la IA con la `categoria` declarada.
4. Si `confianza_IA >= 0.85`: Estado = `VALIDADO`. Se suman puntos al usuario.
5. Si no hay coincidencia: Estado = `RECHAZADO` o `PENDIENTE`.
6. Se crea la entidad en **PostGIS** transformando la latitud/longitud en un dato `Geometry(Point)`.
 
#### Respuesta Exitosa — `201 Created`
 
```json
{
  "data": {
    "id": "uuid-del-reporte",
    "estado": "VALIDADO",
    "nivelConfianzaIa": 0.92,
    "puntosOtorgados": 10
  },
  "message": "Reporte creado y validado exitosamente por la IA."
}
```

GET /api/v1/reportesRetorna los reportes geoespaciales para ser renderizados en el mapa de Leaflet.Autenticación: JWT requerido. Roles: Todos.Parámetros de Consulta (Query Params)ParámetroTipoRequeridoDescripcióncomunaIdIntegerNoFiltra por polígono de la comuna.estadoStringNoVALIDADO, PENDIENTE, RECHAZADO. (Ciudadanos solo pueden pedir VALIDADO).categoriaStringNoFiltra por tipo de infraestructura.

{
  "data": [
    {
      "id": "uuid-reporte",
      "categoria": "RAMPA",
      "latitud": -33.4569,
      "longitud": -70.6482,
      "fotoUrl": "[https://storage.azure.com/.../foto.jpg](https://storage.azure.com/.../foto.jpg)",
      "estado": "VALIDADO",
      "fechaCreacion": "2026-04-10T15:30:00Z"
    }
  ],
  "count": 1
}

PATCH /api/v1/reportes/{id}/estado
Permite a un funcionario municipal revisar manualmente reportes que la IA dejó como PENDIENTE.

Autenticación: JWT requerido. Roles permitidos: MUNICIPALIDAD, ADMINISTRADOR.

Cuerpo de la Petición
{
  "nuevoEstado": "VALIDADO",
  "comentarioRevision": "Rampa visible pero con desgaste. Se aprueba."
}

6. Endpoints de Exportación GIS (Cumplimiento Ley 20.422)
GET /api/v1/export/geojson
Extrae los puntos desde PostGIS y los formatea como un archivo estándar GeoJSON.

Autenticación: JWT requerido. Roles: MUNICIPALIDAD, ADMINISTRADOR.

Parámetros: ?comunaId=1
Respuesta Exitosa — 200 OK (Content-Type: application/geo+json)

{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-70.6482, -33.4569]
      },
      "properties": {
        "id": "uuid-reporte",
        "categoria": "RAMPA",
        "estado": "VALIDADO"
      }
    }
  ]
}

GET /api/v1/export/shapefile
Genera un Shapefile comprimido en .zip con la geometría y datos tabulares para uso en QGIS/ArcGIS.

Autenticación: JWT requerido. Roles: MUNICIPALIDAD, ADMINISTRADOR.
Respuesta: Archivo binario (Content-Type: application/zip).

---

### Parte 3: Gamificación, Usuarios y Códigos de Error

```markdown
# Especificación de API REST - Accesimap CL (Parte 3)

## 7. Endpoints de Gamificación y Usuarios
 
### `GET /api/v1/ranking`
 
Retorna la tabla de líderes del mes actual, ordenados de mayor a menor puntaje.
 
**Autenticación:** JWT requerido. Roles permitidos: Todos.
 
#### Respuesta Exitosa — `200 OK`
 
```json
{
  "data": [
    {
      "posicion": 1,
      "usuarioId": "uuid-usuario-1",
      "alias": "JuanP_Accesible",
      "puntosMensuales": 450
    },
    {
      "posicion": 2,
      "usuarioId": "uuid-usuario-2",
      "alias": "Anonimo_847",
      "puntosMensuales": 320
    }
  ]
}

GET /api/v1/usuarios/me/puntosRetorna el resumen histórico de puntos del usuario autenticado.Autenticación: JWT requerido. Roles: CIUDADANO.8. Tabla de Códigos de Error GlobalesCódigo HTTPCódigo InternoDescripciónPosible Causa400 Bad RequestVALIDATION_ERRORLos datos no cumplen con las reglas de @Valid.Faltan coordenadas, tipo de archivo incorrecto, etc.401 UnauthorizedAUTH_REQUIREDEl token JWT es inválido o expiró.Sesión caducada.403 ForbiddenPERMISSION_DENIEDEl rol no autoriza esta acción.Un ciudadano intentando exportar un Shapefile municipal.404 Not FoundRESOURCE_NOT_FOUNDLa entidad solicitada no existe.ID de reporte o comuna inexistente.422 UnprocessableIA_ANALYSIS_FAILEDAzure Vision AI no pudo procesar la imagen.Imagen corrupta, muy oscura o no reconocible por el modelo cognitivo.500 Internal ErrorGEO_PROCESSING_ERRORFallo al procesar la entidad espacial en PostGIS.Error en el cálculo geométrico (ST_Intersects) o generación del archivo GIS.502 Bad GatewayAZURE_VISION_TIMEOUTAzure Vision AI tardó más de 5 segundos.Problemas de red o saturación de API en Azure (Violación RNF-02).9. Resumen de EndpointsMétodoEndpointDescripciónRolesPOST/api/v1/auth/loginAutenticación y obtención de JWTPúblicoPOST/api/v1/auth/registroRegistro de nuevo ciudadanoPúblicoPOST/api/v1/reportesSubir foto, GPS y validar con IACiudadanoGET/api/v1/reportesListar puntos validados para el mapaTodosGET/api/v1/reportes/{id}Detalle de reporte e imagenTodosPATCH/api/v1/reportes/{id}/estadoRevisión manual de reporte pendienteMunicipalidad, AdminGET/api/v1/export/geojsonDescargar datos GIS en GeoJSONMunicipalidad, AdminGET/api/v1/export/shapefileDescargar paquete GIS en formato SHPMunicipalidad, AdminGET/api/v1/rankingTabla de posiciones de gamificaciónTodosGET/api/v1/usuarios/me/puntosVer estado de cuenta de puntos propiosCiudadano