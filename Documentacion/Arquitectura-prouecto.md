el patron de diseño y las tecnologías que se usaran para accesimap.
# Arquitectura y Diseño Técnico - Accesimap CL

**Plataforma de crowdsourcing con IA para mapas de accesibilidad universal**

Este documento detalla la arquitectura de software, los patrones de diseño y los diagramas estructurales y de comportamiento para el desarrollo backend de Accesimap CL, basado en Java 17, Spring Boot 3.3 y servicios cloud de Azure.

---

## 1. Enfoque Arquitectónico: Monolito Modular en Capas

Dado el plazo de desarrollo (3 semanas) y el tamaño del equipo, el sistema se estructura bajo un patrón **MVC en Capas**, evolucionado hacia un **Monolito Modular**. Esto agiliza el desarrollo inicial mientras mantiene el código desacoplado para una futura migración a microservicios.

El código se organiza por dominios de negocio:
* **Módulo `reportes`:** Gestión de entidades de reporte, recepción de coordenadas y fotografías.
* **Módulo `validacion`:** Aislamiento de la lógica de evaluación y comunicación con la IA.
* **Módulo `gamificacion`:** Reglas de negocio para asignación de puntos y ranking de usuarios.
* **Módulo `gis`:** Consultas espaciales a PostGIS y exportación en formatos GeoJSON/Shapefile.

---

## 2. Patrones de Diseño Aplicados

Para resolver los requerimientos de manera limpia y mantenible, se implementan los siguientes patrones de diseño (GoF) en el backend:

* **Facade (Fachada):** Aplicado en la integración con **Azure Vision AI**. Centraliza y oculta la complejidad del SDK de Azure y la autenticación HTTP, exponiendo métodos simples como `analizarImagen(fotoUrl)` hacia los servicios de negocio.
* **Strategy (Estrategia):** Utilizado para el motor de validación. Permite intercambiar dinámicamente las reglas de validación (ej. aprobación automática si la IA retorna confianza >= 85%, o derivación a revisión humana si la confianza es baja) sin anidar múltiples `if/else`.
* **Data Transfer Object (DTO):** Aplicado en los controladores REST. Evita la exposición de las entidades `@Entity` (JPA) hacia el frontend, previniendo vulnerabilidades de *Over-Posting* y enviando solo la información estrictamente necesaria.
* **Repository (Repositorio):** Provisto por Spring Data JPA. Abstrae la persistencia y las consultas espaciales nativas de PostGIS, manteniendo la capa de servicios libre de SQL duro.
