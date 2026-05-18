# Contexto de Negocio - Sistema Accesimap CL

## 1. Visión General de la Accesibilidad Urbana en Chile

A más de 16 años de la promulgación de la Ley 20.422 (Igualdad de Oportunidades e Inclusión Social de Personas con Discapacidad) y a una década del Decreto 50 de la Ordenanza General de Urbanismo y Construcciones (OGUC), la accesibilidad universal sigue siendo una deuda pendiente en la infraestructura pública chilena. 

La movilidad urbana es crítica para la calidad de vida e inclusión de miles de ciudadanos. Sin embargo, la gran mayoría de las veredas, cruces y edificios públicos en el Gran Santiago continúan presentando barreras arquitectónicas (ausencia de rampas, ascensores averiados, baños no adaptados) que excluyen sistemáticamente a las personas con discapacidad motriz.

---

## 2. Diagnóstico del Estado Actual (Proceso "As-Is")

Actualmente, la planificación, fiscalización y reporte de la accesibilidad urbana opera de manera fragmentada, manual y reactiva. No existe un ecosistema unificado que conecte la necesidad ciudadana con la capacidad de acción municipal.

### 2.1. Flujo de Trabajo Vigente

- **Para el Ciudadano:** Cuando una persona detecta una barrera urbana, no cuenta con un canal formal, unificado y oficial para reportarlo. Depende de plataformas extranjeras genéricas (como Wheelmap, sin validación ni conexión gubernamental) o herramientas de nicho parciales.
- **Para la Municipalidad:** Los departamentos de obras y urbanismo dependen de levantamientos manuales (censos de accesibilidad) que son costosos, lentos y se realizan, en el mejor de los casos, 1 o 2 veces al año.
- **Gestión de la Información:** Los datos recolectados por las municipalidades suelen terminar en planillas Excel estáticas, sin integración automatizada con sus sistemas de información geográfica (GIS).

---

## 3. Análisis de la Problemática y Puntos de Dolor

La gestión análoga y desarticulada de la infraestructura urbana ha generado una crisis de accesibilidad que se divide en los siguientes pilares críticos:

### 3.1. Inexistencia de un Mapa Oficial y Actualizado

No existe una fuente de verdad única y en tiempo real sobre el estado de las rampas, ascensores y baños accesibles. Esta desactualización impide que las personas con discapacidad puedan planificar rutas seguras por la ciudad.

### 3.2. Altos Costos y Baja Frecuencia de Fiscalización

Las municipalidades no tienen el presupuesto ni el personal para recorrer cada calle de la comuna constantemente. Esto provoca que las barreras arquitectónicas permanezcan sin reparación durante meses o años, debido a que la autoridad simplemente desconoce su existencia o estado actual.

### 3.3. Desconfianza en el Crowdsourcing Tradicional

Si bien el reporte ciudadano masivo (crowdsourcing) es la forma más rápida de mapear una ciudad, las municipalidades desconfían de estos datos abiertos porque tradicionalmente carecen de filtros de calidad, lo que resulta en bases de datos llenas de reportes falsos, duplicados o mal categorizados (ej. una foto de un peldaño categorizada como "rampa").

### 3.4. Brecha Tecnológica en la Exportación de Datos

Las iniciativas ciudadanas actuales no hablan el mismo "idioma técnico" que los planificadores urbanos. Si los datos no pueden ser consumidos fácilmente en herramientas estándar como QGIS o ArcGIS, su utilidad para priorizar obras públicas es prácticamente nula.

---

## 4. Propuesta de Valor de Accesimap CL

Accesimap CL surge como la primera plataforma chilena que cubre integralmente la brecha entre la detección ciudadana y la ejecución municipal, transformando un problema social en datos geoespaciales accionables.

### 4.1. Crowdsourcing Validado por Inteligencia Artificial

El sistema democratiza el mapeo permitiendo a cualquier ciudadano reportar barreras geolocalizadas. La innovación disruptiva radica en la integración de **Azure Vision AI**, que analiza cada fotografía en milisegundos para detectar inconsistencias, garantizando a la municipalidad que los datos publicados en el mapa tienen una precisión $\ge 85\%$, sin requerir esfuerzo humano de revisión.

### 4.2. Integración GIS Municipal Nativa

A diferencia de otras apps comerciales, Accesimap CL está diseñada con el cliente municipal en mente. Todo reporte validado se almacena en una base de datos espacial (PostGIS) y puede ser exportado con un clic a formatos **GeoJSON y Shapefile**, listos para integrarse en la planificación urbana de la comuna.

### 4.3. Fidelización mediante Gamificación

Para sostener el modelo de crowdsourcing a largo plazo, el sistema incorpora mecánicas de gamificación (puntos y rankings) que incentivan y recompensan a los ciudadanos por ser co-creadores activos de un entorno urbano más inclusivo.

---

## 5. Objetivos Estratégicos del Negocio

- **Cumplimiento Normativo:** Proveer a las municipalidades de la herramienta tecnológica necesaria para medir, fiscalizar y mejorar el cumplimiento de la Ley 20.422 y la OGUC.
- **Eficiencia en el Gasto Público:** Permitir que los gobiernos locales prioricen sus presupuestos de obras públicas basándose en mapas de calor y datos reales validados, eliminando el gasto en censos manuales.
- **Impacto Social Directo:** Otorgar a las personas con discapacidad motriz una herramienta confiable para recuperar su derecho a la movilidad urbana independiente.
- **Escalabilidad Nacional:** Validar el modelo en 3 comunas piloto (Santiago Centro, Ñuñoa, La Reina) mediante una arquitectura cloud de bajo costo, para su posterior adopción a nivel nacional.

---

## 6. Matriz de Stakeholders (Interesados)

| Interesado              | Impacto del Proyecto                                                                 |
|------------------------|--------------------------------------------------------------------------------------|
| Municipalidades (Obras/Urbanismo) | Reducción radical de costos de fiscalización, obtención de datos GIS listos para usar y priorización informada de presupuestos. |
| Ciudadanos con Discapacidad | Recuperación de la movilidad independiente mediante información en tiempo real, verificada y confiable sobre accesibilidad. |
| Ciudadanos Reportadores (Voluntarios) | Sentido de pertenencia, participación cívica y reconocimiento a través del sistema de gamificación y rankings. |
| Reguladores (SENADIS / MINVU) | Visibilidad a nivel comunal sobre el grado de cumplimiento real del Decreto 50 de la OGUC. |