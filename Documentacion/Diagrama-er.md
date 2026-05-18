```mermaid
    erDiagram
        USUARIO {
            UUID id PK
            String email
            String password_hash
            String rol "CIUDADANO o MUNICIPALIDAD"
            Integer puntos_gamificacion
            Boolean es_anonimo
        }

        REPORTE {
            UUID id PK
            UUID usuario_id FK
            String categoria "rampa, ascensor, baño"
            String descripcion
            String foto_url
            Geometry ubicacion "PostGIS Point (lat, long)"
            String estado "pendiente, validado, rechazado"
            Float nivel_confianza_ia
            Timestamp fecha_creacion
        }

        COMUNA {
            Integer id PK
            String nombre "Pilotos: Santiago Centro, Ñuñoa, La Reina"
            Geometry poligono "PostGIS Polygon"
        }

        USUARIO ||--o{ REPORTE : "crea"
        COMUNA ||--o{ REPORTE : "contiene"
  ```