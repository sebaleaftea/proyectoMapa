# Guía de Instalación, Configuración y Despliegue — Accesimap CL

## 1. Requisitos Previos
 
Antes de comenzar con la instalación y configuración de Accesimap CL, asegúrese de contar con todos los elementos listados a continuación. La ausencia de cualquiera de estos impedirá el correcto funcionamiento del entorno de desarrollo local.
 
### 1.1. Software Local
 
| Herramienta | Versión mínima | Verificación | Notas |
|---|---|---|---|
| **Java Development Kit (JDK)** | `17` LTS | `java -version` | Requerido por Spring Boot 3.3. |
| **Apache Maven** | `3.8.x` | `mvn -version` | Gestor de dependencias y empaquetado del backend. |
| **Node.js** | `18.x` o superior | `node -v` | Requerido para el entorno frontend (React + Vite). |
| **Docker Desktop** | `24.x` | `docker --version` | Altamente recomendado para levantar la base de datos PostgreSQL + PostGIS en local sin configuraciones complejas. |
| **Git** | `2.x` | `git --version` | Requerido para clonar el repositorio y gestionar ramas. |
 
### 1.2. Cuentas y Accesos Requeridos
 
El proyecto se basa enteramente en el ecosistema Microsoft, por lo que se requiere:
 
| Plataforma | Propósito en Accesimap CL |
|---|---|
| **Microsoft Azure** | Proveedor cloud único. Alojará la BD (RDS), el backend (App Service), el frontend (Static Web Apps), las imágenes (Storage) y el modelo cognitivo (Vision AI). |
| **GitHub** | Alojamiento del repositorio del proyecto e integración nativa con Azure mediante GitHub Actions para CI/CD. |
 
---
 
## 2. Configuración del Entorno Local
 
La arquitectura se divide en dos aplicaciones (frontend y backend) que deben levantarse de manera paralela.
 
### 2.1. Clonación del Repositorio
 
```bash
# Clonar el repositorio desde GitHub
git clone [https://github.com/organizacion/accesimap-cl.git](https://github.com/organizacion/accesimap-cl.git)
 
# Acceder al directorio raíz
cd accesimap-cl

Cambiar a la rama de integración continua para comenzar el desarrollo:

Bash
git checkout develop
2.2. Configuración de Base de Datos Local (Docker)
Dado que el proyecto depende de la extensión geoespacial PostGIS, la forma más limpia de operar en local es mediante un contenedor Docker.

En la raíz del proyecto backend, ejecutar:

Bash
# Levantar el contenedor de PostgreSQL con PostGIS
docker run --name accesimap-postgis -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=accesimap_db -p 5432:5432 -d postgis/postgis:16-3.4
2.3. Entorno Backend (Spring Boot)
Acceder a la carpeta del backend y configurar las variables de entorno.

Bash
cd backend
Crear un archivo application-dev.properties en src/main/resources/ (excluido en .gitignore):

Properties
# ─── Base de Datos (PostgreSQL + PostGIS Local) ─────────────────────────
spring.datasource.url=jdbc:postgresql://localhost:5432/accesimap_db
spring.datasource.username=postgres
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=update

# ─── Seguridad (Spring Security / JWT) ──────────────────────────────────
jwt.secret.key=clave_secreta_local_generada_con_alta_entropia_para_jwt
jwt.expiration.time=86400000

# ─── Azure Storage (Imágenes) ───────────────────────────────────────────
azure.storage.connection-string=DefaultEndpointsProtocol=https;AccountName=TU_CUENTA;AccountKey=TU_KEY;EndpointSuffix=core.windows.net
azure.storage.container-name=accesimap-fotos-dev

# ─── Azure Vision AI (Validación) ───────────────────────────────────────
azure.vision.endpoint=https://TU_[REGION.api.cognitive.microsoft.com/](https://REGION.api.cognitive.microsoft.com/)
azure.vision.subscription-key=TU_API_KEY
Instalación y Ejecución:

Bash
# Instalar dependencias Maven y compilar
mvn clean install -DskipTests
 
# Iniciar el servidor local
mvn spring-boot:run -Dspring-boot.run.profiles=dev
El backend estará disponible en http://localhost:8080.

2.4. Entorno Frontend (React + Vite)
Abrir una nueva terminal y acceder a la carpeta del frontend:

Bash
cd frontend
Crear un archivo .env.local:

Bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_MAPBOX_TOKEN=tu_token_publico_de_mapbox_aqui
Instalación y Ejecución:

Bash
# Instalar dependencias
npm install
 
# Iniciar servidor de desarrollo Vite
npm run dev
El frontend estará disponible en http://localhost:5173.

3. Configuración de Servicios Cloud (Azure Free Tier)
Todas las configuraciones se realizan en el Portal de Azure.

3.1. Azure Database for PostgreSQL (Flexible Server)
Buscar Azure Database for PostgreSQL servers y crear uno nuevo (Flexible Server).

Seleccionar la capa B1ms (Elegible para Free Tier primeros 12 meses).

En Server parameters, buscar azure.extensions y habilitar POSTGIS.

Una vez creado, ir a Networking y permitir acceso a los servicios de Azure (Allow public access from any Azure service).

3.2. Azure Storage Account (Imágenes)
Crear un recurso Storage account.

Rendimiento: Standard. Redundancia: LRS (Locally-redundant storage) para mantener costo cero.

Tras la creación, ir a Containers y crear uno llamado accesimap-fotos. Establecer su nivel de acceso en "Private".

Ir a Access keys para obtener el Connection string requerido por el backend.

3.3. Azure AI Vision
Buscar Computer Vision y crear el recurso.

Seleccionar la capa de precios F0 (Free) (Permite 20 llamadas por minuto y 5k al mes, ideal para el MVP).

Ir a Keys and Endpoint para obtener la clave secreta y la URL del endpoint.


---

### Parte 2: Despliegue, Flujo de Trabajo y Mantenimiento

```markdown
# Guía de Instalación, Configuración y Despliegue — Accesimap CL (Parte 2)

## 4. Configuración de Despliegue en Azure
 
Accesimap CL separa el despliegue del frontend y del backend para aprovechar los servicios gestionados.
 
### 4.1. Despliegue del Backend (Azure App Service)
 
1. En el Portal de Azure, crear un recurso **Web App**.
2. Publicación: **Code**. Runtime stack: **Java 17**. Java web server stack: **Java SE (Embedded Web Server)**.
3. Sistema operativo: Linux.
4. Plan de precios: **Free F1** (Cumpliendo el requerimiento RNF-11).
5. En la pestaña **Configuration** -> **Application settings**, cargar las variables de entorno (`SPRING_DATASOURCE_URL`, `JWT_SECRET_KEY`, credenciales de Storage y Vision AI) definidas en el punto 2.3.
 
### 4.2. Despliegue del Frontend (Azure Static Web Apps)
 
1. Crear recurso **Static Web Apps**.
2. Seleccionar plan de alojamiento **Free**.
3. En detalles de implementación, conectar la cuenta de GitHub y seleccionar el repositorio `accesimap-cl`.
4. Detalles de compilación: 
   - Framework preestablecido: **React** (o Vite).
   - Ubicación de la aplicación: `/frontend`
   - Ubicación de compilación: `dist`
5. Azure generará automáticamente un flujo de GitHub Actions que compilará y desplegará la app en cada *push*.
 
---
 
## 5. Flujo de Trabajo y CI/CD (GitHub Actions)
 
El proyecto utiliza un flujo de GitFlow simplificado integrado con GitHub Actions.
 
### 5.1. Entornos de Despliegue por Rama
 
| Rama Git | Propósito | Despliegue |
|---|---|---|
| `main` | Producción | Despliegue automático a App Service y Static Web Apps vía GitHub Actions. |
| `develop` | Integración Continua | Verificación de tests (JUnit) por Actions, pero sin despliegue automático a Azure en el MVP. |
| `feature/*` | Desarrollo de tareas | Solo verificación local. |
 
### 5.2. Configuración de Pipeline Backend
 
Para automatizar el despliegue del backend, se crea un archivo en `.github/workflows/backend-deploy.yml`:
 
```yaml
name: Build and Deploy Spring Boot to Azure
on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Build with Maven
        run: mvn clean package -DskipTests
        working-directory: ./backend
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'accesimap-api'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: './backend/target/*.jar'

(Requiere guardar el perfil de publicación de Azure Web App en los Secrets de GitHub).6. Verificación del SistemaTras la configuración, ejecute estas pruebas para confirmar la salud del sistema:6.1. Verificación del Backend (Local)Bashcd backend
# Ejecutar todas las pruebas unitarias y de integración
mvn test
# Esperado: BUILD SUCCESS y métrica de cobertura (Jacoco) ≥ 70% (RNF-10).
6.2. Verificación de PostGISMediante pgAdmin o DBeaver, conectarse a la instancia local/Azure de PostgreSQL y ejecutar:SQLSELECT PostGIS_Version();
Esperado: Retorna la versión instalada (ej. 3.4 USE_GEOS=1...), confirmando que el motor geoespacial está activo.6.3. Verificación de Azure Vision AIEnviar una petición POST desde Postman al endpoint de prueba de Azure o levantar la API local y subir una foto de prueba categorizada como RAMPA. Verificar los logs de Spring Boot para confirmar que la IA retorna el puntaje en milisegundos.7. Mantenimiento y Logs7.1. Azure Application Insights (Monitoreo)El proyecto se enlaza con Application Insights para capturar la telemetría del backend Java.Acceder a Azure Portal -> Application Insights.Revisar Transaction Search para monitorear posibles excepciones HTTP 500.Revisar Performance para garantizar que los tiempos de respuesta del análisis de IA se mantengan $\le 5$ segundos (Requerimiento RNF-02).7.2. Tareas Programadas (Opcional)Si se implementa limpieza de reportes no validados huérfanos, Spring Boot utiliza @Scheduled. Asegúrese de revisar los logs de Spring para verificar la ejecución de estas tareas de limpieza nocturnas.8. Solución de Problemas Frecuentes8.1. Error: type "geometry" does not existCausa: Hibernate está intentando crear entidades espaciales pero la extensión PostGIS no está instalada o habilitada en la base de datos de PostgreSQL.Solución: Conectarse a la BD mediante un cliente SQL y ejecutar como administrador: CREATE EXTENSION postgis;.8.2. El análisis de IA (Azure Vision) lanza Timeout (HTTP 504/502)Causa: La región seleccionada para la API Cognitiva tiene alta latencia o el archivo enviado supera el límite de tamaño de 4MB de Azure Vision en capa Free.Solución: 1. Validar en el frontend que el tamaño de la imagen sea comprimido antes del envío (max 4MB).2. Verificar que la región de la Storage Account y de Vision AI sea la misma (ej. East US) para evitar cuellos de botella de red internos.8.3. Error de firma JWT (HTTP 401 Unauthorized)Causa: Las variables jwt.secret.key difieren entre reinicios o no están bien pasadas en Azure Application Settings.Solución: Asegurar que la clave secreta sea persistente y exacta en el portal de configuración del App Service en Azure. Debe ser de al menos 256 bits (32 caracteres).8.4. Despliegue en GitHub Actions falla en fase MavenCausa: Faltan dependencias o un test está fallando y rompiendo el build.Solución: Revisar los logs detallados del job en GitHub Actions. Si es crítico pasar a producción por un hotfix de emergencia, se puede usar temporalmente -DskipTests, pero debe subsanarse el test roto inmediatamente en la rama develop.