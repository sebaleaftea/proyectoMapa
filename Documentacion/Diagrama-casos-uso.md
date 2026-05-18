```mermaid
    flowchart LR
        %% Definición de Actores
        C((Ciudadano))
        M((Municipalidad))
        IA((Azure Vision AI))

        %% Límite del Sistema
        subgraph Accesimap CL
            CU1(Autenticación JWT / Registro)
            CU2(Reportar Barrera / Subir Foto)
            CU3(Visualizar Mapa y Puntos)
            CU4(Validar Inconsistencias Fotográficas)
            CU5(Exportar Datos GIS\nGeoJSON/Shapefile)
            CU6(Consultar Ranking de Gamificación)
        end

        %% Relaciones de Ciudadano
        C --> CU1
        C --> CU2
        C --> CU3
        C --> CU6

        %% Relaciones de Municipalidad
        M --> CU1
        M --> CU3
        M --> CU5

        %% Relaciones del Sistema/Backend
        CU2 -.->|Trigger automático| CU4
        IA -->|Analiza imagen| CU4
        
        %% Estilos básicos
        classDef actor fill:#f9f9f9,stroke:#333,stroke-width:2px;
        class C,M,IA actor;
    ```