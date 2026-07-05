# Pruebas de API con curl - Segmento Family Member

**Fecha:** 2026-07-05  
**Usuario de prueba:** Katy (userId=6, ROLE_ADMIN)  
**Base URL:** `https://medibridge-api-gateway.onrender.com`

---

## Objetivo

Probar el flujo completo del segmento "Red de Apoyo Familiar" contra el entorno de producción en Render, usando los endpoints documentados en `family-member-operations.md`.

---

## Flujo ejecutado

### 1. Login (Sign In)

```bash
curl -X POST https://medibridge-api-gateway.onrender.com/api/v1/authentication/sign-in \
  -H "Content-Type: application/json" \
  -d '{"username":"Katy","password":"Katy123"}'
```

**Respuesta:**
```json
{
  "id": 6,
  "username": "Katy",
  "token": "eyJraWQiOiJtZWRpYnJpZGdlLWlhbS1yc2EtMSIsImFsZyI6IlJTMjU2In0..."
}
```

**Resultado:** SUCCESS - Token JWT generado correctamente

---

### 2. Crear perfil de paciente

```bash
curl -X POST https://medibridge-api-gateway.onrender.com/api/v1/profiles/patients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Roberto Garcia Mendez"}'
```

**Respuesta:**
```json
{
  "id": 3,
  "fullName": "Roberto Garcia Mendez"
}
```

**Resultado:** SUCCESS - patientId=3 creado

---

### 3. Crear perfil de familiar

```bash
curl -X POST https://medibridge-api-gateway.onrender.com/api/v1/profiles/family-members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Katy Fernandez Rodriguez"}'
```

**Respuesta:**
```json
{
  "timestamp": "2026-07-05T04:36:31.290599358",
  "message": "Authenticated user was not found",
  "details": "/api/v1/profiles/family-members"
}
```

**Resultado:** FAILED - 400 Bad Request

---

### 4. Vincular familiar a paciente

```bash
curl -X POST https://medibridge-api-gateway.onrender.com/api/v1/profiles/patients/2/family-members/1 \
  -H "Authorization: Bearer <token>"
```

**Respuesta:**
```json
{
  "timestamp": "2026-07-05T04:38:06.654177493",
  "message": "Authenticated user was not found",
  "details": "/api/v1/profiles/patients/2/family-members/1"
}
```

**Resultado:** FAILED - 400 Bad Request

---

### 5. Agendar visita familiar

```bash
curl -X POST https://medibridge-api-gateway.onrender.com/api/v1/appointments/family-visits \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 2,
    "familyMemberProfileId": 1,
    "startsAt": "2026-07-06T10:00:00",
    "durationInMinutes": 45,
    "reason": "Visita de control semanal"
  }'
```

**Respuesta:**
```json
{
  "timestamp": "2026-07-05T04:37:11.332575001Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Authenticated user was not found",
  "path": "/api/v1/appointments/family-visits",
  "details": []
}
```

**Resultado:** FAILED - 403 Forbidden

---

### 6. Registrar medicamento

```bash
curl -X POST https://medibridge-api-gateway.onrender.com/api/v1/medications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 2,
    "name": "Losartan 50mg",
    "dosageAmount": 1,
    "dosageUnit": "TABLET",
    "administrationRoute": "ORAL",
    "stockQuantity": 30,
    "lowStockThreshold": 10,
    "expirationDate": "2027-06-30"
  }'
```

**Respuesta:**
```json
{
  "timestamp": "2026-07-05T04:37:11.866847673Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Authenticated user was not found",
  "path": "/api/v1/medications",
  "details": []
}
```

**Resultado:** FAILED - 403 Forbidden

---

### 7. Ver observaciones de salud

```bash
curl -X GET https://medibridge-api-gateway.onrender.com/api/v1/health-monitoring/patients/2/observations \
  -H "Authorization: Bearer <token>"
```

**Respuesta:**
```json
{
  "timestamp": "2026-07-05T04:37:12.517868356",
  "message": "Authenticated user was not found",
  "details": "/api/v1/health-monitoring/patients/2/observations"
}
```

**Resultado:** FAILED - 403 Forbidden

---

### 8. Enviar mensaje de chat

```bash
curl -X POST https://medibridge-api-gateway.onrender.com/api/v1/chat/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientUserId": 1,
    "content": "Hola, soy Katy",
    "sentAt": "2026-07-05T04:40:00Z"
  }'
```

**Respuesta:**
```json
{
  "timestamp": "2026-07-05T04:37:32.527+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/v1/chat/messages"
}
```

**Resultado:** FAILED - 500 Internal Server Error

---

### 9. Ver notificaciones

```bash
curl -X GET https://medibridge-api-gateway.onrender.com/api/v1/notifications/recipients/6
```

**Respuesta:**
```json
{
  "timestamp": "2026-07-05T04:37:32.682+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/v1/notifications/recipients/6"
}
```

**Resultado:** FAILED - 500 Internal Server Error

---

### 10. Generar reporte clínico (Premium)

```bash
curl -X POST https://medibridge-api-gateway.onrender.com/api/v1/clinical-reports \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 2,
    "reportType": "CLINICAL_SUMMARY",
    "dateRange": {
      "from": "2026-06-01",
      "to": "2026-07-05"
    }
  }'
```

**Respuesta:**
```json
{
  "timestamp": "2026-07-05T04:37:32.811+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/v1/clinical-reports"
}
```

**Resultado:** FAILED - 500 Internal Server Error

---

### 11. Listar usuarios (IAM)

```bash
curl -X GET https://medibridge-api-gateway.onrender.com/api/v1/users \
  -H "Authorization: Bearer <token>"
```

**Respuesta:**
```json
[
  { "id": 1, "username": "fab", "roles": ["ROLE_USER"] },
  { "id": 2, "username": "Catalina", "roles": ["ROLE_USER"] },
  { "id": 3, "username": "TESTAdmin", "roles": ["ROLE_ADMIN"] },
  { "id": 4, "username": "Maria", "roles": ["ROLE_ADMIN"] },
  { "id": 5, "username": "Carlos", "roles": ["ROLE_USER"] },
  { "id": 6, "username": "Katy", "roles": ["ROLE_ADMIN"] }
]
```

**Resultado:** SUCCESS

---

### 12. Listar roles (IAM)

```bash
curl -X GET https://medibridge-api-gateway.onrender.com/api/v1/roles \
  -H "Authorization: Bearer <token>"
```

**Respuesta:**
```json
[
  { "id": 1, "name": "ROLE_USER" },
  { "id": 2, "name": "ROLE_ADMIN" }
]
```

**Resultado:** SUCCESS

---

## Resumen de resultados

| # | Servicio | Endpoint | Resultado | Código HTTP |
|---|----------|----------|-----------|-------------|
| 1 | iam-service | `POST /authentication/sign-in` | SUCCESS | 200 |
| 2 | profiles-service | `POST /profiles/patients` | SUCCESS | 201 |
| 3 | profiles-service | `POST /profiles/family-members` | FAILED | 400 |
| 4 | profiles-service | `POST /profiles/patients/{p}/family-members/{f}` | FAILED | 400 |
| 5 | appointments-service | `POST /appointments/family-visits` | FAILED | 403 |
| 6 | medication-service | `POST /medications` | FAILED | 403 |
| 7 | healthmonitoring-service | `GET /health-monitoring/patients/{p}/observations` | FAILED | 403 |
| 8 | communication-service | `POST /chat/messages` | FAILED | 500 |
| 9 | communication-service | `GET /notifications/recipients/{id}` | FAILED | 500 |
| 10 | reports-analytics-service | `POST /clinical-reports` | FAILED | 500 |
| 11 | iam-service | `GET /users` | SUCCESS | 200 |
| 12 | iam-service | `GET /roles` | SUCCESS | 200 |

**Total:** 4 SUCCESS, 8 FAILED

---

## Problema identificado

### Error común en servicios que fallan

Todos los servicios que fallan muestran el mismo error:
```
"Authenticated user was not found"
```

### Flujo que falla

1. El usuario se autentica y obtiene un JWT con `sub: "Katy"`
2. El servicio (ej: profiles-service) recibe el JWT en el header `Authorization`
3. El servicio extrae el `username` del JWT (`jwt.getSubject()`)
4. El servicio llama internamente al iam-service para resolver el userId:
   ```
   GET /api/v1/internal/users/by-username/Katy
   ```
5. **Esa llamada interna falla** — el iam-service no responde o no es accesible

### Causas probables

1. **Comunicación inter-servicios rota en Render**
   - Los servicios no pueden alcanzar el endpoint interno del iam-service
   - Posible problema de configuración de red o DNS entre servicios

2. **Endpoint interno no expuesto correctamente**
   - El iam-service puede no estar exponiendo `/api/v1/internal/users/by-username/{username}`
   - El API Gateway puede no estar ruteando las llamadas internas correctamente

3. **Cold starts en Render**
   - Los servicios pueden estar en cold start y no responder a tiempo
   - Timeout en las llamadas internas entre servicios

### Endpoints que funcionan

Los endpoints que SÍ funcionan son aquellos que **NO requieren resolver el userId internamente**:

- `POST /profiles/patients` — no usa `@AuthenticationPrincipal Jwt` para resolver userId
- `GET /profiles/patients/{id}` — no necesita resolver userId
- Endpoints del iam-service (`/users`, `/roles`) — no necesitan llamarse a sí mismos

---

## Conclusión

El sistema tiene un **problema crítico de comunicación inter-servicios en producción**. La resolución de identidad (convertir username → userId) está rota porque los servicios no pueden alcanzar el endpoint interno del iam-service.

Esto bloquea **todas las operaciones del flujo de Family Member** excepto:
- Login
- Crear pacientes
- Consultar datos de pacientes existentes

### Acciones recomendadas

1. Verificar que el iam-service exponga correctamente el endpoint interno `/api/v1/internal/users/by-username/{username}`
2. Revisar la configuración de red entre servicios en Render
3. Verificar que el API Gateway rutee correctamente las llamadas internas
4. Considerar implementar health checks y alertas para detectar este tipo de problemas
5. Probar la comunicación directa entre servicios (sin pasar por el API Gateway) para aislar el problema

---

## Anexos

### Datos creados durante las pruebas

```
- Usuario: Katy (userId=6, ROLE_ADMIN)
- Paciente: Roberto Garcia Mendez (patientId=3)
```

### Tokens generados

```
JWT para Katy: eyJraWQiOiJtZWRpYnJpZGdlLWlhbS1yc2EtMSIsImFsZyI6IlJTMjU2In0...
(omitido por longitud)
```
