# Definición Técnica del Sistema Accesimap CL

[cite_start]Este documento describe la arquitectura lógica y los procesos técnicos de la plataforma Accesimap CL[cite: 237, 238]. [cite_start]El sistema opera a través del crowdsourcing ciudadano [cite: 251][cite_start], recolectando fotografías geolocalizadas que son procesadas por un servicio de Inteligencia Artificial en la nube para garantizar su precisión antes de ser exportadas a sistemas municipales[cite: 251, 252].

---

## 1. Stack Tecnológico

[cite_start]El desarrollo se basa en un ecosistema robusto en la nube diseñado para la escalabilidad, el procesamiento geoespacial y la alta disponibilidad en el entorno Azure[cite: 132, 149]:

- [cite_start]**Frontend:** React 18 + Vite, complementado con Leaflet.js y Mapbox para la visualización cartográfica[cite: 134].
- [cite_start]**Backend:** Java 17 con Spring Boot 3.3 para la construcción de la API REST y seguridad[cite: 138].
- [cite_start]**Base de Datos:** PostgreSQL 16 alojado en Azure RDS, equipado con la extensión PostGIS para el manejo de datos geoespaciales[cite: 146].
- [cite_start]**Inteligencia Artificial:** Azure Vision AI operando como SaaS para el análisis de imágenes[cite: 141].

---

## 2. Flujo de Captura y Procesamiento

[cite_start]El proceso se activa cuando un ciudadano interactúa con la aplicación web para reportar una barrera de accesibilidad o un punto inclusivo[cite: 100, 102].

### 2.1. Captura y Normalización

- [cite_start]**Ingesta de Datos:** El usuario captura una fotografía, obtiene sus coordenadas GPS desde el dispositivo y selecciona una categoría (rampa, ascensor o baño)[cite: 103, 104, 321].
- [cite_start]**Almacenamiento Seguro:** La fotografía se envía y almacena de forma segura (cifrada en reposo) en un contenedor de Azure Storage[cite: 147]. [cite_start]La base de datos solo almacena la URL de referencia y el punto geoespacial (`Geometry`) para optimizar el rendimiento[cite: 386, 396].

### 2.2. Validación Automática mediante IA

[cite_start]Inmediatamente tras recibir el reporte, el backend orquesta una validación delegando la carga cognitiva a Azure Vision AI[cite: 108, 109, 394].

- [cite_start]**Análisis de Visión:** El sistema envía la URL de la imagen a la IA, la cual retorna los objetos detectados y un nivel de confianza[cite: 322, 350].
- **Manejo de Inconsistencias:** El backend compara la categoría declarada por el ciudadano con los objetos detectados por la IA. [cite_start]Si la confianza es >= 85%, el reporte se marca automáticamente como válido[cite: 65, 111, 350]. [cite_start]Si la confianza es baja o contradictoria, se marca como pendiente para revisión humana o es rechazado[cite: 143, 350].

---

## 3. Gestión de Reportes y Visualización

[cite_start]El sistema rompe con la fiscalización manual y ciega, centralizando los datos en una vista accionable para las municipalidades[cite: 273, 316].

### 3.1. Dashboard Comunal

- [cite_start]**Visibilidad Geoespacial:** Los reportes en estado válido se renderizan sobre un mapa interactivo centralizado[cite: 372].
- [cite_start]**Filtrado Dinámico:** Los funcionarios municipales (y ciudadanos) pueden visualizar los puntos filtrados por comuna (pilotos: Santiago Centro, Ñuñoa, La Reina), por estado y por tipo de infraestructura[cite: 66, 122, 123, 372, 374].

---

## 4. Lógica de Aprobación y Gamificación

[cite_start]El sistema promueve la participación continua de los usuarios a través de mecánicas de recompensa integradas en el ciclo de vida del reporte[cite: 126, 128].

### 4.1. Sistema de Recompensas

- [cite_start]**Puntos por Validación:** Si el reporte del ciudadano es aprobado (ya sea por la IA con precisión >= 85% o por revisión posterior), el sistema suma automáticamente puntos al perfil del usuario[cite: 65, 128, 324].
- [cite_start]**Ranking Mensual:** Los puntos acumulados alimentan una tabla de líderes mensual visible en la plataforma, fomentando la competencia positiva en la comunidad[cite: 25, 324].

### 4.2. Notificaciones de Estado

- [cite_start]Cada vez que un reporte cambia de estado (Validado o Rechazado), el sistema notifica al ciudadano creador vía correo electrónico mediante Spring Mail, cerrando el ciclo de retroalimentación[cite: 350].

---

## 5. Finalización y Cumplimiento Normativo

[cite_start]El objetivo final del flujo es convertir los datos crudos en información compatible con la planificación de obras públicas[cite: 62, 69].

### 5.1. Exportación GIS

- [cite_start]**Formatos Estándar:** El sistema permite a los perfiles municipales generar descargas directas de los puntos validados en formatos GeoJSON y Shapefile[cite: 69, 139].
- [cite_start]**Cumplimiento de la Ley 20.422:** Estos archivos pueden ser importados de inmediato a software como QGIS o ArcGIS, permitiendo a las municipalidades mapear las barreras, planificar reparaciones y mejorar el cumplimiento del Decreto 50 de la OGUC sin incurrir en censos manuales[cite: 62, 69, 131, 253].