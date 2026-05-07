# 📚 Documentación de Endpoints - Accesimap Backend

**Versión:** 1.0  
**Última actualización:** 2026-05-02  
**Base URL:** `http://localhost:8080/api/v1`

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Reportes](#reportes)
3. [Gamificación](#gamificación)
4. [Exportación](#exportación)
5. [Enumeraciones](#enumeraciones)
6. [Códigos de Error](#códigos-de-error)
7. [Ejemplos cURL](#ejemplos-curl)

---

## 🔐 Autenticación

### Tipos de Autenticación

- **JWT (JSON Web Token)**: Se envía en el header `Authorization: Bearer <token>`
- **Roles**: `CIUDADANO`, `MUNICIPALIDAD`, `ADMINISTRADOR`

---

## 🔑 Autenticación - Endpoints

### 1. Login

**Descripción:** Autenticar usuario y obtener JWT token  
**URL:** `/auth/login`  
**Método:** `POST`  
**Autenticación:** ❌ No requerida  
**Permissions:** Cualquiera

#### Request Body

```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

#### Response (200 OK)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "CIUDADANO"
}
```

#### Posibles Errores

- `500` - Usuario no encontrado
- `500` - Contraseña incorrecta

---

### 2. Registro

**Descripción:** Crear una nueva cuenta de ciudadano  
**URL:** `/auth/registro`  
**Método:** `POST`  
**Autenticación:** ❌ No requerida

#### Request Body

```json
{
  "email": "nuevo@example.com",
  "password": "contraseña123"
}
```

#### Response (200 OK)

```json
"Usuario registrado exitosamente"
```

#### Posibles Errores

- `500` - Email ya registrado

---

## 📍 Reportes - Endpoints

### 1. Crear Reporte

**Descripción:** Crear un nuevo reporte de accesibilidad con foto validada por IA  
**URL:** `/reportes`  
**Método:** `POST`  
**Autenticación:** ✅ Requerida (JWT Token)  
**Permissions:** `CIUDADANO`

#### Request (form-data)

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `foto` | File | Sí | Archivo de imagen (JPEG, PNG) |
| `latitud` | Double | Sí | Coordenada latitud (-90 a 90) |
| `longitud` | Double | Sí | Coordenada longitud (-180 a 180) |
| `categoria` | String | Sí | `RAMPA`, `ASCENSOR`, `BAÑO` |
| `descripcion` | String | No | Descripción adicional del problema |

#### Headers Requeridos

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Response (201 CREATED)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "estado": "VALIDADO",
    "nivelConfianzaIa": 0.95,
    "puntosOtorgados": 10
  },
  "message": "Reporte creado y procesado exitosamente."
}
```

#### Posibles Errores

- `400` - Parámetros inválidos
- `401` - Token expirado o inválido
- `403` - Rol insuficiente (no es CIUDADANO)
- `500` - Error al procesar imagen o contactar IA

---

### 2. Obtener Reportes

**Descripción:** Listar reportes con filtros opcionales  
**URL:** `/reportes`  
**Método:** `GET`  
**Autenticación:** ❌ No requerida  
**Permissions:** Cualquiera

#### Query Parameters (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `comunaId` | Integer | Filtrar por ID de comuna |
| `estado` | String | Filtrar por estado: `PENDIENTE`, `VALIDADO`, `RECHAZADO` |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "descripcion": "Rampa rota en entrada",
      "latitud": -33.4489,
      "longitud": -70.6693,
      "categoria": "RAMPA",
      "estado": "VALIDADO",
      "nivelConfianzaIa": 0.92,
      "usuarioId": "550e8400-e29b-41d4-a716-446655440001",
      "fechaCreacion": "2026-05-02T16:00:00"
    }
  ],
  "count": 1
}
```

#### Ejemplos

```
# Obtener todos los reportes
GET /reportes

# Filtrar por comuna
GET /reportes?comunaId=13

# Filtrar por estado
GET /reportes?estado=VALIDADO

# Combinado
GET /reportes?comunaId=13&estado=PENDIENTE
```

---

### 3. Modificar Estado de Reporte

**Descripción:** Cambiar estado de un reporte (solo para autoridades)  
**URL:** `/reportes/{id}/estado`  
**Método:** `PATCH`  
**Autenticación:** ✅ Requerida  
**Permissions:** `MUNICIPALIDAD`, `ADMINISTRADOR`

#### URL Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID del reporte a modificar |

#### Request Body

```json
{
  "nuevoEstado": "RECHAZADO"
}
```

#### Response (200 OK)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "estado": "RECHAZADO",
    "nivelConfianzaIa": 0.92
  },
  "message": "Estado actualizado manualmente."
}
```

#### Posibles Errores

- `400` - Estado inválido
- `401` - Token no proporcionado
- `403` - Rol insuficiente
- `404` - Reporte no encontrado

---

## 🏆 Gamificación - Endpoints

### 1. Obtener Ranking

**Descripción:** Listar usuarios ordenados por puntos (ranking global)  
**URL:** `/ranking`  
**Método:** `GET`  
**Autenticación:** ❌ No requerida  
**Permissions:** Cualquiera

#### Response (200 OK)

```json
{
  "data": [
    {
      "posicion": 1,
      "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
      "alias": "usuario@example.com",
      "puntos": 150
    },
    {
      "posicion": 2,
      "usuarioId": "550e8400-e29b-41d4-a716-446655440001",
      "alias": "Anonimo_550e",
      "puntos": 120
    }
  ]
}
```

**Nota:** Los usuarios anónimos aparecen con `alias: "Anonimo_XXXX"` (primeros 4 caracteres del UUID)

---

### 2. Obtener Mis Puntos

**Descripción:** Ver puntos del usuario autenticado  
**URL:** `/usuarios/me/puntos`  
**Método:** `GET`  
**Autenticación:** ✅ Requerida (JWT Token)  
**Permissions:** `CIUDADANO`

#### Headers Requeridos

```
Authorization: Bearer <token>
```

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@example.com",
  "puntos": 85
}
```

#### Posibles Errores

- `401` - Token no válido
- `403` - Rol insuficiente

---

## 📤 Exportación - Endpoints

### 1. Exportar Shapefile

**Descripción:** Descargar datos de reportes en formato Shapefile (GeoJSON)  
**URL:** `/export/shapefile`  
**Método:** `GET`  
**Autenticación:** ✅ Requerida  
**Permissions:** `MUNICIPALIDAD`, `ADMINISTRADOR`

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `comunaId` | Integer | Sí | ID de la comuna a exportar |

#### Headers Requeridos

```
Authorization: Bearer <token>
```

#### Response (200 OK)

- **Content-Type:** `application/zip`
- **Body:** Archivo ZIP contiente Shapefile

#### Headers Response

```
Content-Disposition: attachment;filename=reporte_comuna_13.zip
Content-Length: 45678
```

#### Posibles Errores

- `401` - Token no válido
- `403` - Rol insuficiente
- `500` - Error al generar Shapefile

---

## 📋 Enumeraciones

### CategoriaInfraestructura

Valores válidos para el parámetro `categoria` en reportes:

```
RAMPA        - Rampas de acceso
ASCENSOR     - Ascensores
BAÑO         - Baños accesibles
```

### EstadoReporte

Estados posibles de un reporte:

```
PENDIENTE    - Reportado pero no validado
VALIDADO     - Aprobado por validación IA
RECHAZADO    - Rechazado por autoridades
```

### RolUsuario

Roles de usuario disponibles:

```
CIUDADANO        - Puede crear reportes
MUNICIPALIDAD    - Puede validar reportes
ADMINISTRADOR    - Acceso total
```

---

## ❌ Códigos de Error

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| `200` | OK - Solicitud exitosa | Cualquier GET exitoso |
| `201` | Created - Recurso creado | POST de reporte exitoso |
| `400` | Bad Request - Parámetros inválidos | Email sin @ en login |
| `401` | Unauthorized - Token no válido o expirado | Token JWT inválido |
| `403` | Forbidden - Permiso insuficiente | CIUDADANO intenta exportar |
| `404` | Not Found - Recurso no existe | Reporte con ID inexistente |
| `500` | Internal Server Error - Error del servidor | Error en procesamiento IA |

---

## 🔄 Flujo de Autenticación

```
1. Usuario hace POST a /auth/login o /auth/registro
2. Backend retorna token JWT
3. Frontend almacena token (localStorage o sessionStorage)
4. Para requests autenticados: Agregar header "Authorization: Bearer <token>"
5. Si token expira (401): Pedir nuevo login
```

---

## 📝 Ejemplos cURL

### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123"
  }'
```

### Registrarse

```bash
curl -X POST http://localhost:8080/api/v1/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "password": "password123"
  }'
```

### Crear Reporte

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:8080/api/v1/reportes \
  -H "Authorization: Bearer $TOKEN" \
  -F "foto=@/path/to/foto.jpg" \
  -F "latitud=-33.4489" \
  -F "longitud=-70.6693" \
  -F "categoria=RAMPA" \
  -F "descripcion=Rampa rota en la entrada"
```

### Obtener Reportes

```bash
# Todos
curl http://localhost:8080/api/v1/reportes

# Con filtros
curl "http://localhost:8080/api/v1/reportes?comunaId=13&estado=VALIDADO"
```

### Modificar Estado

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X PATCH http://localhost:8080/api/v1/reportes/550e8400-e29b-41d4-a716-446655440000/estado \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nuevoEstado": "VALIDADO"
  }'
```

### Obtener Ranking

```bash
curl http://localhost:8080/api/v1/ranking
```

### Mis Puntos

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:8080/api/v1/usuarios/me/puntos \
  -H "Authorization: Bearer $TOKEN"
```

### Exportar Shapefile

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "http://localhost:8080/api/v1/export/shapefile?comunaId=13" \
  -H "Authorization: Bearer $TOKEN" \
  -o reporte_comuna.zip
```

---

## 💡 Tips para Frontend

### 1. Almacenar Token
```javascript
// Después del login
localStorage.setItem('token', response.token);
```

### 2. Enviar Token en Requests
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### 3. Manejo de Errores
```javascript
if (response.status === 401) {
  // Token expirado, redirigir a login
  window.location.href = '/login';
}
```

### 4. Upload de Archivo
```javascript
const formData = new FormData();
formData.append('foto', file); // File input
formData.append('latitud', -33.4489);
formData.append('longitud', -70.6693);
formData.append('categoria', 'RAMPA');

fetch('/api/v1/reportes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## 📞 Contacto & Soporte

Para reportar bugs o solicitar cambios en los endpoints, contactar al equipo backend.

---

**Última revisión:** 2026-05-02
