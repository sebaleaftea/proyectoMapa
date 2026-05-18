# Documento: Alcance Funcional Detallado — Sistema Accesimap CL

## 1. Introducción al Alcance

El sistema Accesimap CL tiene como objetivo funcional transformar el proceso actual de fiscalización de accesibilidad —basado en censos manuales intermitentes y planillas Excel— en un flujo activo, ciudadano y verificado automáticamente para la generación de mapas de accesibilidad universal.

El alcance funcional abarca el ciclo de vida completo de un reporte de barrera arquitectónica, desde la captura ciudadana geolocalizada, pasando por la validación mediante Inteligencia Artificial, hasta su exportación en formatos GIS estándar para las municipalidades.

El sistema se organiza en **cinco módulos funcionales** con responsabilidades claramente delimitadas:

| Módulo | Naturaleza | Descripción resumida |
|---|---|---|
| **Reporte Ciudadano (Crowdsourcing)** | Manual (Ciudadano) | Captura de fotografías, geolocalización y categorización de puntos de accesibilidad. |
| **Validación con IA** | Automático (Sistema) | Procesamiento de imágenes con Azure Vision AI para detectar inconsistencias. |
| **Dashboard y Exportación GIS** | Manual (Municipalidad) | Visualización de mapas filtrados y exportación de datos (GeoJSON/Shapefile). |
| **Gamificación** | Automático (Background) | Asignación de puntos y generación de rankings para incentivar la participación. |
| **Requerimientos No Funcionales** | Transversal | Seguridad, rendimiento, arquitectura cloud y escalabilidad. |

---

## 2. Módulo de Reporte Ciudadano (Crowdsourcing)

Este módulo es el punto de entrada de la información. Permite a los ciudadanos (con o sin discapacidad) actuar como co-creadores del mapa mediante una aplicación web responsive.

### 2.1. Autenticación y Privacidad

- El sistema permite a los usuarios registrarse e iniciar sesión mediante JWT para acumular puntos.
- Se incluye una opción de anonimato para proteger la identidad del ciudadano reportador si este lo desea.

### 2.2. Formulario de Captura de Datos (RF-01)

El proceso de reporte consta de tres elementos obligatorios para garantizar la integridad del dato:
- **Fotografía:** Captura en tiempo real o subida desde la galería del dispositivo.
- **Geolocalización:** Obtención de coordenadas GPS (latitud y longitud) directamente del dispositivo del usuario.
- **Categorización:** Selección del tipo de infraestructura evaluada. En el alcance inicial, las categorías se limitan a rampas, ascensores y baños.

El formulario permite añadir una descripción de texto opcional para entregar contexto adicional a la municipalidad.

### 2.3. Gestión de Archivos (Azure Storage)

- Las fotografías subidas por los ciudadanos se envían al backend y se almacenan en un bucket de Azure Storage.
- Las imágenes se guardan cifradas en reposo para cumplir con los estándares de seguridad.
- La base de datos (PostgreSQL) solo almacena la URL de referencia al archivo, no el archivo binario per se.

---

## 3. Módulo de Validación con IA (Automático)

Este módulo opera de forma **completamente automatizada** en el backend (Spring Boot) inmediatamente después de recibir un reporte ciudadano. Su propósito es garantizar la calidad de los datos y evitar reportes falsos o erróneos.

### 3.1. Integración con Azure Vision AI (RF-02)

- El backend procesa cada imagen recibida enviándola a la API de Azure Vision AI.
- El modelo analiza la fotografía buscando objetos que coincidan con la categoría declarada por el ciudadano (ej. detectar una estructura inclinada si la categoría es "rampa").
- Azure Vision AI retorna un puntaje de confianza (confidence score) respecto a los objetos detectados.

### 3.2. Lógica de Validación Doble y Estados del Reporte

El sistema evalúa el resultado de la IA basándose en un umbral de precisión objetivo del 85%. El flujo de estados es el siguiente:

| Resultado de la IA | Acción del Sistema | Estado Resultante |
|---|---|---|
| Confianza $\ge 85\%$ y coincidencia con categoría | Se aprueba automáticamente. Se suman puntos al usuario y el punto aparece en el mapa. | `VALIDADO` |
| Inconsistencia clara (ej. foto de un árbol categorizada como ascensor) | Se rechaza automáticamente. No se suman puntos ni se publica. | `RECHAZADO` |
| Baja confianza (zona gris) | Se requiere intervención. Se enruta a un panel de revisión manual. | `PENDIENTE / REVISIÓN` |

### 3.3. Notificaciones (RF-07)

El sistema envía una notificación automática por correo electrónico (mediante Spring Mail) al ciudadano informando si su reporte fue validado o rechazado, cerrando así el ciclo de retroalimentación.

---

## 4. Módulo de Dashboard y Exportación GIS (Municipal)

Interfaz centralizada orientada al cliente principal (municipalidades), enfocada en la planificación y fiscalización urbana.

### 4.1. Dashboard Comunal

- **Visualización Cartográfica:** Mapa interactivo construido con Leaflet.js y Mapbox.
- **Puntos Validados:** Solo los reportes en estado `VALIDADO` se renderizan en el mapa oficial.
- **Filtros:** Capacidad de filtrar los puntos por comuna (Santiago Centro, Ñuñoa, La Reina), tipo de infraestructura (rampa, baño, ascensor) y estado.

### 4.2. Exportación GIS Municipal (RF-04)

Esta es la funcionalidad core para el cumplimiento normativo (Ley 20.422).
- El sistema permite generar descargas directas de la información geográfica de los puntos validados.
- Los formatos de exportación son **GeoJSON** y **Shapefile**, garantizando interoperabilidad inmediata con los sistemas de planificación municipal como QGIS o ArcGIS.
- La generación de estos archivos extrae los datos directamente desde las consultas espaciales en la base de datos PostGIS.

---

## 5. Módulo de Gamificación y Participación

Módulo orientado a fidelizar al usuario ciudadano y sostener el modelo de crowdsourcing a lo largo del tiempo.

### 5.1. Sistema de Puntos (RF-05)

- Cada vez que un reporte ciudadano transita al estado `VALIDADO` (ya sea por IA o por revisión humana), el sistema suma puntos automáticamente al perfil del usuario.
- Los reportes rechazados no otorgan puntos.

### 5.2. Ranking de Usuarios

- El sistema genera una tabla de líderes (ranking) de carácter mensual.
- Esta tabla es visible en una sección específica de la aplicación web, fomentando la sana competencia ciudadana por ser el mayor contribuyente a la accesibilidad de su comuna.

---

## 6. Requerimientos No Funcionales

Los siguientes requerimientos aplican de forma transversal a todos los módulos para asegurar la calidad de la plataforma:

| Requerimiento | Detalle |
|---|---|
| **Seguridad (RNF-01)** | Implementación de Spring Security con autenticación JWT. Cumplimiento de estándares OWASP Top 10 y cifrado HTTPS/TLS para datos en tránsito. |
| **Rendimiento (RNF-02)** | La validación de la IA debe retornar una respuesta en $\le 5$ segundos (ajustado en la arquitectura). |
| **Usabilidad y Accesibilidad (RNF-04)** | Interfaz obligatoriamente diseñada bajo estándar WCAG 2.1 AA, responsive y mobile-first, garantizando que personas con diversas discapacidades puedan usarla. |
| **Costo e Infraestructura (RNF-11)** | La totalidad del despliegue en la nube debe operar dentro de los límites del Azure Free Tier ($\$0$ USD). |

---

## 7. Decisiones Funcionales Pendientes

Las siguientes decisiones funcionales están identificadas pero requieren resolución técnica final por el equipo antes del cierre del Sprint de *Elaboration*:

| # | Decisión pendiente | Módulo afectado | Consideraciones |
|---|---|---|---|
| **DP-01** | Rol de aprobador para revisión humana | Validación con IA | ¿Quién revisa los reportes con baja confianza de IA? ¿Administradores del sistema, usuarios ciudadanos con alto ranking, o funcionarios municipales? |
| **DP-02** | Estructura exacta de asignación de puntos | Gamificación | Definir cuántos puntos otorga un reporte válido y si existen multiplicadores (ej. primer reporte en una calle sin datos). |
| **DP-03** | Expansión de categorías a futuro | Reporte Ciudadano | Definir cómo se estructurará la base de datos para soportar semáforos sonoros, cruces peatonales, etc., sin romper el esquema actual. |

---

## 8. Matriz de Funcionalidades por Rol

La siguiente matriz consolida todas las funcionalidades operativas del sistema según el actor que las ejecuta.

| Funcionalidad | Ciudadano | Municipalidad | Sistema (Backend / IA) |
|---|:---:|:---:|:---:|
| **Reporte y Captura** | | | |
| Iniciar sesión / Registrarse (o modo anónimo) | ✅ | ✅ | — |
| Subir fotografía geolocalizada con categoría | ✅ | ❌ | — |
| Recibir notificación por email sobre validación | ✅ | ❌ | — |
| **Validación y Datos** | | | |
| Analizar fotografía vs. categoría esperada | ❌ | ❌ | ✅ |
| Cambiar estado a Validado/Rechazado automáticamente | ❌ | ❌ | ✅ |
| Realizar revisión humana de reportes "zona gris" | ❌ | ⚠️ (Según DP-01) | — |
| **Consumo de Información** | | | |
| Visualizar mapa interactivo con puntos validados | ✅ | ✅ | — |
| Visualizar estadísticas por comuna | ❌ | ✅ | — |
| Exportar datos en GeoJSON / Shapefile | ❌ | ✅ | — |
| **Gamificación** | | | |
| Ver ranking mensual y puntos propios | ✅ | ❌ | — |
| Sumar puntos automáticamente a la cuenta | ❌ | ❌ | ✅ |