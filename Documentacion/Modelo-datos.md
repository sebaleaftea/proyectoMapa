# Modelo de Datos - Sistema Accesimap CL

## 1. Arquitectura de Datos e Integración Geoespacial
 
El sistema Accesimap CL utiliza una **arquitectura de persistencia relacional y espacial** gestionada a través de Spring Data JPA e Hibernate Spatial. Esta configuración se apoya en un motor de base de datos robusto con capacidades geográficas nativas:
 
| Motor | Proveedor | Extensión | Responsabilidad |
|---|---|---|---|
| **PostgreSQL 16** | Azure Database (Flexible Server) | **PostGIS** | Base de datos central del sistema. Almacena usuarios, comunas, y reportes ciudadanos incluyendo datos vectoriales complejos (Puntos y Polígonos). |
 
### 1.1. Principio de Separación de Archivos Binarios
 
Para no degradar el rendimiento del motor transaccional y las consultas espaciales de PostGIS, **ninguna fotografía se almacena en la base de datos**. Las imágenes capturadas por los ciudadanos se envían a un contenedor privado de **Azure Storage**. La base de datos PostgreSQL almacena exclusivamente la URL de referencia (`foto_url`) que apunta a dicho archivo.
 
---
 
## 2. Convenciones del Modelo (Spring Data JPA)
 
Las siguientes convenciones aplican a la definición de entidades en el backend (Java 17) y su mapeo a PostgreSQL:
 
| Convención | Detalle |
|---|---|
| **Nomenclatura de tablas** | `snake_case` en plural para la base de datos (ej. `usuarios`, `reportes`). En Java, se usan clases en `PascalCase` (`Usuario`, `Reporte`). |
| **Nomenclatura de campos** | `camelCase` en Java (`fotoUrl`), mapeado automáticamente a `snake_case` en PostgreSQL (`foto_url`) mediante la estrategia de nomenclatura de Spring Boot. |
| **Identificadores (IDs)** | Uso de `UUID` versión 4 generados automáticamente para entidades transaccionales (`Usuario`, `Reporte`) para evitar enumeración y mejorar la seguridad. `Integer` para catálogos estáticos como `Comuna`. |
| **Datos Espaciales** | Uso de la librería `org.locationtech.jts.geom` de Java para mapear campos espaciales a los tipos `geometry(Point, 4326)` y `geometry(Polygon, 4326)` de PostGIS, usando SRID 4326 (WGS 84). |
| **Timestamps** | Anotaciones `@CreationTimestamp` y `@UpdateTimestamp` de Hibernate para gestión automática del ciclo de vida. |
 
---
 
## 3. Entidades en PostgreSQL + PostGIS
 
### 3.1. Entidad: `Usuario` — Ciudadanos y Municipalidades
 
Gestiona la identidad, roles y el puntaje de gamificación de quienes interactúan con el sistema.
 
| Campo (Java) | Tipo SQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Identificador único universal del usuario. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Correo de registro (o correo temporal interno si es anónimo). |
| `passwordHash` | `VARCHAR(255)` | `NOT NULL` | Contraseña cifrada con BCrypt. |
| `rol` | `VARCHAR(50)` | `NOT NULL` | Rol del sistema (enum: `CIUDADANO`, `MUNICIPALIDAD`, `ADMINISTRADOR`). |
| `puntosGamificacion`| `INT` | `DEFAULT 0` | Puntaje acumulado por reportes validados exitosamente. |
| `esAnonimo` | `BOOLEAN` | `DEFAULT false` | Indica si el perfil del ciudadano debe ocultarse en los rankings públicos. |
| `fechaCreacion` | `TIMESTAMP` | `DEFAULT NOW()` | Fecha de registro en la plataforma. |
 
**Relaciones:**
- Un `Usuario` puede crear muchos `Reporte`. (Uno a Muchos).
 
---
 
### 3.2. Entidad: `Comuna` — Entidad Geográfica Base
 
Almacena los polígonos que delimitan las comunas piloto. Es vital para las consultas espaciales (saber a qué municipio pertenece un reporte).
 
| Campo (Java) | Tipo SQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY` | Identificador oficial (ej. código INE de la comuna). |
| `nombre` | `VARCHAR(100)` | `NOT NULL` | Nombre (Santiago Centro, Ñuñoa, La Reina). |
| `poligono` | `GEOMETRY(Polygon, 4326)` | `NOT NULL` | Límite geográfico exacto de la comuna mapeado en coordenadas WGS 84. |
 
**Relaciones:**
- Una `Comuna` contiene espacialmente muchos `Reporte` (se resuelve mediante la función `ST_Contains` de PostGIS, no mediante una Clave Foránea estricta).
 
---
 
### 3.3. Entidad: `Reporte` — Entidad Transaccional Central
 
Representa una barrera arquitectónica o punto accesible reportado por un ciudadano.
 
| Campo (Java) | Tipo SQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Identificador único del reporte. |
| `usuario_id` | `UUID` | `FK -> usuarios(id)` | Referencia al ciudadano creador. |
| `categoria` | `VARCHAR(50)` | `NOT NULL` | Tipo de infraestructura (enum: `RAMPA`, `ASCENSOR`, `BAÑO`). |
| `descripcion` | `TEXT` | `NULL` | Contexto adicional aportado por el ciudadano. |
| `fotoUrl` | `VARCHAR(500)` | `NOT NULL` | URL de la imagen almacenada en Azure Storage. Requisito obligatorio para la IA. |
| `ubicacion` | `GEOMETRY(Point, 4326)` | `NOT NULL` | Coordenada exacta del reporte (Latitud/Longitud). |
| `estado` | `VARCHAR(50)` | `DEFAULT 'PENDIENTE'`| Estado del reporte (enum: `PENDIENTE`, `VALIDADO`, `RECHAZADO`). |
| `nivelConfianzaIa`| `FLOAT` | `NULL` | Puntaje de precisión retornado por Azure Vision AI (0.0 a 1.0). |
| `fechaCreacion` | `TIMESTAMP` | `DEFAULT NOW()` | Fecha y hora en la que se envió el reporte. |
| `fechaActualizacion`| `TIMESTAMP` | `DEFAULT NOW()` | Última modificación del estado del reporte. |
 
---
 
## 4. Enums y Tipos de Datos Globales
 
### `RolUsuario`
| Valor | Descripción |
|---|---|
| `CIUDADANO` | Puede emitir reportes, ganar puntos y ver el mapa público. |
| `MUNICIPALIDAD` | Puede visualizar el dashboard comunal, exportar archivos GIS y revisar manualmente reportes `PENDIENTES`. |
| `ADMINISTRADOR` | Control total del sistema y parametrización. |
 
### `EstadoReporte`
| Valor | Descripción |
|---|---|
| `PENDIENTE` | Estado inicial. Evaluado por la IA con baja confianza (zona gris) y en espera de revisión humana municipal. No es visible en el mapa público. |
| `VALIDADO` | Aprobado (confianza IA $\ge 85\%$ o por revisión humana). Visible en el mapa y en las exportaciones GIS. |
| `RECHAZADO` | Inconsistencia clara detectada por la IA o rechazado manualmente. No suma puntos. |
 
### `CategoriaInfraestructura`
| Valor | Descripción |
|---|---|
| `RAMPA` | Rampas peatonales o de acceso a edificios. |
| `ASCENSOR` | Ascensores públicos o en estaciones de transporte. |
| `BAÑO` | Baños con accesibilidad universal. |
 
---
 
## 5. Diagrama de Relaciones (ERD Textual)
 
El siguiente diagrama muestra las relaciones lógicas y espaciales del sistema:
 
```text
┌─────────────────────────┐
│        USUARIO          │
│─────────────────────────│
│ id (PK)         UUID    │
│ email           String  │
│ password_hash   String  │
│ rol             Enum    │
│ puntos          Int     │
│ es_anonimo      Boolean │
└───────────┬─────────────┘
            │
            │ 1
            │
            │ 0..*
            ▼
┌─────────────────────────┐          ┌─────────────────────────┐
│        REPORTE          │          │         COMUNA          │
│─────────────────────────│          │─────────────────────────│
│ id (PK)         UUID    │          │ id (PK)         Int     │
│ usuario_id (FK) UUID    │◄ - - - - │ nombre          String  │
│ categoria       Enum    │  ST_     │ poligono        Polygon │
│ foto_url        String  │ Contains └─────────────────────────┘
│ ubicacion       Point   │          (Relación espacial nativa
│ estado          Enum    │           evaluada por PostGIS)
│ nivel_confianza Float   │
│ fecha_creacion  Time    │
└─────────────────────────┘

```
6. Mapeo ORM (Spring Data JPA / Hibernate Spatial)
A continuación se presenta el código de mapeo de las entidades principales en Java, destacando la integración con org.locationtech.jts.geom para el soporte PostGIS.

Mapeo de Entidad Reporte

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Point;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reportes")
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaInfraestructura categoria;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "foto_url", nullable = false, length = 500)
    private String fotoUrl;

    // Columna espacial para PostGIS
    @Column(nullable = false, columnDefinition = "geometry(Point, 4326)")
    private Point ubicacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoReporte estado = EstadoReporte.PENDIENTE;

    @Column(name = "nivel_confianza_ia")
    private Float nivelConfianzaIa;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    // Getters y Setters...
}

7. Índices y Consideraciones de RendimientoPara garantizar búsquedas eficientes en mapas y exportaciones rápidas de datos GIS, se deben aplicar los siguientes índices en PostgreSQL:TablaCampo(s)Tipo de ÍndiceJustificaciónreportesubicacionGISTCrucial. Optimiza las consultas espaciales (Bounding Box) solicitadas por Leaflet.js al moverse por el mapa.comunaspoligonoGISTPermite usar funciones espaciales como ST_Contains y ST_Intersects de manera altamente eficiente para el filtrado municipal.reportesestadoB-TreeEl mapa solo consulta reportes en estado VALIDADO. Este índice evita escanear reportes rechazados.reportesusuario_idB-TreeOptimiza la consulta del historial de puntos y gamificación por ciudadano.usuariospuntos_gamificacionB-TreeOptimiza la generación del ranking de líderes mensual sin requerir ordenamiento completo en memoria.


8. Reglas de Integridad y Restricciones de NegocioEstas reglas controlan el flujo de datos entre los servicios Spring Boot y la base de datos:#Regla de NegocioCapa de ImplementaciónRI-01Un reporte debe contener un Point válido con un SRID 4326. Si el objeto Point está vacío, el controlador debe rechazar el payload antes de llegar a la base de datos.ReporteService.java + PostGISRI-02Si Azure Vision AI retorna un puntaje $\ge 0.85$ y coincide la etiqueta detectada con la categoría, el estado del Reporte se guarda automáticamente como VALIDADO y se suma la recompensa al Usuario.ValidacionIAService.javaRI-03Los puntos de gamificación de la tabla usuarios solo se incrementan si una transición de estado en la tabla reportes pasa a VALIDADO (ya sea automático por IA o manual por municipio).GamificacionService.javaRI-04Al exportar a GeoJSON/Shapefile, solo se deben extraer mediante SQL los registros cuyo estado sea estrictamente igual a VALIDADO.ReporteRepository.java (Query Method)RI-05Las URL de Azure Storage insertadas en foto_url deben validarse para asegurar que cumplen con formato HTTPS antes de la persistencia.Jakarta Validation (@Pattern)