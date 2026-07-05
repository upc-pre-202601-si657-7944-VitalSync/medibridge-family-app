# Family Network — API Documentation

Usuario `ROLE_ADMIN` / `FAMILY_MEMBER`. Gestiona pacientes, agenda visitas familiares, monitorea salud,
administra medicación y se comunica con el equipo de cuidado.

## API Gateway (entrada única en producción)

| Entorno | Base URL |
|---|---|
| **Producción (Render)** | `https://medibridge-api-gateway.onrender.com` |
| **Local** | `http://localhost:8080` |

En producción **todos los endpoints se consumen a través del API Gateway** con la misma base URL.
Las URLs directas a cada servicio listadas abajo son para referencia y acceso local.

Swagger UI unificado: https://medibridge-api-gateway.onrender.com/swagger-ui.html

---

## 1. IAM Service

| Entorno | Base URL |
|---|---|
| **Producción (Render)** | `https://medibridge-iam-service.onrender.com` |
| **Local** | `http://localhost:8081` |

### POST `/api/v1/authentication/sign-up`

Registra un nuevo usuario Family Network.

```
Content-Type: application/json
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| username | String | Sí | Nombre de usuario único |
| password | String | Sí | Contraseña |
| roles | String[] | Sí | `["ROLE_ADMIN"]` para Family Network |

**Response 201:**
```json
{
  "id": 1,
  "username": "juan.perez",
  "roles": ["ROLE_ADMIN"]
}
```

---

### POST `/api/v1/authentication/sign-in`

Inicia sesión. Devuelve un JWT para usar como `Authorization: Bearer <token>`.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| username | String | Sí | Nombre de usuario |
| password | String | Sí | Contraseña |

**Response 200:**
```json
{
  "id": 1,
  "username": "juan.perez",
  "token": "eyJhbGciOiJSUzI1NiIs..."
}
```

---

### GET `/api/v1/users`

Lista todos los usuarios del sistema. **Requiere JWT**.

**Response 200:**
```json
[
  { "id": 1, "username": "juan.perez", "roles": ["ROLE_ADMIN"] }
]
```

---

### GET `/api/v1/users/{userId}`

Obtiene un usuario por ID. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| userId | Long | ID del usuario |

**Response 200:**
```json
{ "id": 1, "username": "juan.perez", "roles": ["ROLE_ADMIN"] }
```

---

### GET `/api/v1/roles`

Lista los roles disponibles. **Requiere JWT**.

**Response 200:**
```json
[
  { "id": 1, "name": "ROLE_USER" },
  { "id": 2, "name": "ROLE_ADMIN" }
]
```

---

## 2. Profiles Service

| Entorno | Base URL |
|---|---|
| **Producción (Render)** | `https://medibridge-profiles-service.onrender.com` |
| **Local** | `http://localhost:8082` |

### POST `/api/v1/profiles/family-members`

Crea el perfil de familiar vinculado al usuario autenticado. **Requiere JWT**.
El `userId` se extrae automáticamente del token.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| fullName | String | Sí | Nombre completo del familiar |

**Response 201:**
```json
{
  "id": 10,
  "userId": 1,
  "fullName": "Juan Pérez"
}
```

---

### GET `/api/v1/profiles/family-members/{familyMemberProfileId}`

Obtiene el perfil de un familiar. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| familyMemberProfileId | Long | ID del perfil de familiar |

**Response 200:**
```json
{
  "id": 10,
  "userId": 1,
  "fullName": "Juan Pérez"
}
```

---

### POST `/api/v1/profiles/patients`

Crea un paciente bajo la cuenta del familiar. **Requiere JWT**.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| fullName | String | Sí | Nombre completo del paciente |

**Response 201:**
```json
{
  "id": 100,
  "fullName": "María Pérez"
}
```

---

### GET `/api/v1/profiles/patients/{patientId}`

Obtiene los datos de un paciente. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |

**Response 200:**
```json
{
  "id": 100,
  "fullName": "María Pérez"
}
```

---

### POST `/api/v1/profiles/patients/{patientId}/family-members/{familyMemberProfileId}`

Vincula un familiar a un paciente (relación de cuidado). **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |
| familyMemberProfileId | Long | ID del perfil de familiar |

**Response 201:**
```json
{
  "id": 50,
  "familyMemberProfileId": 10,
  "patientId": 100,
  "active": true
}
```

---

### POST `/api/v1/profiles/patients/{patientId}/doctors/{doctorProfileId}`

Asigna un doctor a un paciente. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |
| doctorProfileId | Long | ID del perfil del doctor |

**Response 201:**
```json
{
  "id": 30,
  "doctorProfileId": 5,
  "patientId": 100,
  "active": true
}
```

---

## 3. Appointments Service

| Entorno | Base URL |
|---|---|
| **Producción (Render)** | `https://medibridge-appointments-service.onrender.com` |
| **Local** | `http://localhost:8084` |

### POST `/api/v1/appointments/family-visits`

Agenda una visita familiar. **Requiere JWT**.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| patientId | Long | Sí | ID del paciente |
| familyMemberProfileId | Long | Sí | ID del perfil del familiar que visita |
| startsAt | LocalDateTime | Sí | Fecha y hora de inicio (ISO 8601) |
| durationInMinutes | Integer | Sí | Duración en minutos |
| reason | String | Sí | Motivo de la visita |

**Response 201:**
```json
{
  "id": 200,
  "patientId": 100,
  "familyMemberProfileId": 10,
  "appointmentType": "FAMILY_VISIT",
  "status": "SCHEDULED",
  "startsAt": "2026-07-05T10:00:00",
  "endsAt": "2026-07-05T11:00:00",
  "reason": "Visita de control"
}
```

---

### POST `/api/v1/appointments/medical`

Agenda una cita médica. **Requiere JWT**.

*(Misma estructura que family-visits pero orientada a doctorProfileId)*

---

### GET `/api/v1/appointments/{appointmentId}`

Obtiene una cita por ID. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| appointmentId | Long | ID de la cita |

**Response 200:**
```json
{
  "id": 200,
  "patientId": 100,
  "doctorProfileId": null,
  "familyMemberProfileId": 10,
  "appointmentType": "FAMILY_VISIT",
  "status": "SCHEDULED",
  "startsAt": "2026-07-05T10:00:00",
  "endsAt": "2026-07-05T11:00:00",
  "reason": "Visita de control"
}
```

---

### GET `/api/v1/appointments/patient/{patientId}`

Lista todas las citas de un paciente. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |

**Response 200:**
```json
[
  {
    "id": 200,
    "patientId": 100,
    "doctorProfileId": null,
    "familyMemberProfileId": 10,
    "appointmentType": "FAMILY_VISIT",
    "status": "COMPLETED",
    "startsAt": "2026-07-05T10:00:00",
    "endsAt": "2026-07-05T11:00:00",
    "reason": "Visita de control"
  }
]
```

---

## 4. Health Monitoring Service

| Entorno | Base URL |
|---|---|
| **Producción (Render)** | `https://medibridge-healthmonitoring-service.onrender.com` |
| **Local** | `http://localhost:8085` |

### POST `/api/v1/health-monitoring/patients/{patientId}/observations`

Registra una observación de salud. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente (en URL) |

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| recordedByDoctorProfileId | Long | Sí | ID del doctor que registró |
| systolicBloodPressure | Integer | No | Presión sistólica |
| diastolicBloodPressure | Integer | No | Presión diastólica |
| bodyTemperature | BigDecimal | No | Temperatura corporal |
| painLevel | Integer | No | Nivel de dolor (0-10) |
| emotionalState | EmotionalState | No | Estado emocional |
| emotionalNotes | String | No | Notas emocionales |
| clinicalNotes | String | No | Notas clínicas |
| recordedAt | LocalDateTime | Sí | Fecha/hora del registro |

**Response 201:**
```json
{
  "id": 300,
  "patientId": 100,
  "recordedByDoctorProfileId": 5,
  "systolicBloodPressure": 120,
  "diastolicBloodPressure": 80,
  "bodyTemperature": 36.5,
  "painLevel": 2,
  "emotionalState": "STABLE",
  "emotionalNotes": "Paciente tranquilo",
  "clinicalNotes": "Signos vitales normales",
  "recordedAt": "2026-07-05T10:30:00"
}
```

---

### GET `/api/v1/health-monitoring/patients/{patientId}/observations`

Historial de observaciones de salud. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |

**Response 200:** Array de `PatientHealthObservationResource`.

---

### GET `/api/v1/health-monitoring/patients/{patientId}/alerts/active`

Alertas clínicas activas. **Requiere JWT + suscripción Premium**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |

**Response 200:**
```json
[
  {
    "id": 400,
    "patientId": 100,
    "observationId": 300,
    "severity": "HIGH",
    "status": "ACTIVE",
    "message": "Presión arterial elevada detectada",
    "triggeredAt": "2026-07-05T10:30:05"
  }
]
```

---

### GET `/api/v1/health-monitoring/patients/{patientId}/summary`

Resumen de salud del paciente. **Requiere JWT + suscripción Premium**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |

**Response 200:**
```json
{
  "patientId": 100,
  "summary": "Paciente estable. Sin alertas críticas en los últimos 7 días."
}
```

---

## 5. Medication Service

| Entorno | Base URL |
|---|---|
| **Producción (Render)** | `https://medibridge-medication-service.onrender.com` |
| **Local** | `http://localhost:8086` |

### Inventario de Medicamentos

#### POST `/api/v1/medications`

Registra un nuevo medicamento. **Requiere JWT**.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| patientId | Long | Sí | ID del paciente |
| name | String | Sí | Nombre del medicamento |
| dosageAmount | BigDecimal | Sí | Cantidad por dosis |
| dosageUnit | DosageUnit | Sí | Unidad (MG, ML, TABLET, etc.) |
| administrationRoute | AdministrationRoute | Sí | Vía (ORAL, INTRAVENOUS, etc.) |
| stockQuantity | Integer | Sí | Cantidad en stock |
| lowStockThreshold | Integer | Sí | Umbral de stock bajo |
| expirationDate | LocalDate | Sí | Fecha de vencimiento |

**Response 201:**
```json
{
  "id": 1,
  "patientId": 100,
  "name": "Ibuprofeno",
  "dosageAmount": 400,
  "dosageUnit": "MG",
  "administrationRoute": "ORAL",
  "stockQuantity": 30,
  "lowStockThreshold": 5,
  "expirationDate": "2027-01-15",
  "active": true
}
```

---

#### GET `/api/v1/medications/{medicationId}`

Obtiene un medicamento por ID. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| medicationId | Integer | ID del medicamento |

---

#### GET `/api/v1/medications/patients/{patientId}`

Lista todos los medicamentos de un paciente. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |

---

#### PATCH `/api/v1/medications/{medicationId}/stock`

Actualiza el stock de un medicamento. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| medicationId | Integer | ID del medicamento (URL) |

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| stockQuantity | Integer | Sí | Nueva cantidad en stock |

---

#### GET `/api/v1/medications/patients/{patientId}/low-stock`

Lista medicamentos con stock bajo. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |

**Response 200:**
```json
[
  {
    "medicationId": 1,
    "patientId": 100,
    "medicationName": "Ibuprofeno",
    "currentStock": 3,
    "threshold": 5
  }
]
```

---

### Horarios de Medicación

#### POST `/api/v1/medication-schedules`

Crea un horario de administración. **Requiere JWT**.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| medicationId | Integer | Sí | ID del medicamento |
| patientId | Long | Sí | ID del paciente |
| frequencyType | FrequencyType | Sí | Tipo de frecuencia |
| timesPerDay | Integer | Sí | Veces por día |
| administrationTime | LocalTime | Sí | Hora de administración |
| startDate | LocalDate | Sí | Fecha de inicio |
| endDate | LocalDate | Sí | Fecha de fin |

**Response 201:**
```json
{
  "id": 10,
  "medicationId": 1,
  "patientId": 100,
  "frequencyType": "DAILY",
  "timesPerDay": 2,
  "administrationTime": "08:00:00",
  "startDate": "2026-07-01",
  "endDate": "2026-07-31",
  "active": true
}
```

---

#### GET `/api/v1/medication-schedules/patients/{patientId}/active`

Horarios activos de un paciente. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |

---

### Administración de Dosis

#### POST `/api/v1/dose-administrations`

Registra una dosis administrada. **Requiere JWT**.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| medicationId | Integer | Sí | ID del medicamento |
| scheduleId | Integer | Sí | ID del horario |
| patientId | Long | Sí | ID del paciente |
| administeredAt | LocalDateTime | Sí | Fecha/hora de administración |
| notes | String | No | Notas |

**Response 201:**
```json
{
  "id": 500,
  "medicationId": 1,
  "scheduleId": 10,
  "patientId": 100,
  "occurredAt": "2026-07-05T08:00:00",
  "status": "ADMINISTERED",
  "notes": "Tomado con agua"
}
```

---

#### POST `/api/v1/dose-administrations/skip`

Registra una dosis omitida. **Requiere JWT**.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| medicationId | Integer | Sí | ID del medicamento |
| scheduleId | Integer | Sí | ID del horario |
| patientId | Long | Sí | ID del paciente |
| skippedAt | LocalDateTime | Sí | Fecha/hora en que se omitió |
| reason | String | Sí | Motivo de la omisión |

---

#### GET `/api/v1/dose-administrations/medications/{medicationId}`

Historial de dosis de un medicamento. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| medicationId | Integer | ID del medicamento |

---

## 6. Reports & Analytics Service

| Entorno | Base URL |
|---|---|
| **Producción (Render)** | `https://medibridge-reports-analytics-service.onrender.com` |
| **Local** | `http://localhost:8087` |

*Todos requieren **JWT + suscripción Premium**.*

### POST `/api/v1/clinical-reports`

Genera un reporte clínico.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| patientId | Long | Sí | ID del paciente |
| reportType | ReportType | Sí | Tipo de reporte |
| startDate | LocalDate | Sí | Fecha de inicio del período |
| endDate | LocalDate | Sí | Fecha de fin del período |

**Response 201:**
```json
{
  "id": 1,
  "patientId": 100,
  "reportType": "MONTHLY_SUMMARY",
  "periodStartDate": "2026-06-01",
  "periodEndDate": "2026-06-30",
  "generatedAt": "2026-07-05T12:00:00",
  "summary": "Resumen clínico del período...",
  "pdfPath": "/reports/1/report.pdf",
  "sections": []
}
```

---

### POST `/api/v1/clinical-reports/{reportId}/pdf`

Genera el PDF de un reporte existente.

| Parámetro | Tipo | Descripción |
|---|---|---|
| reportId | Integer | ID del reporte |

---

### GET `/api/v1/clinical-reports/{reportId}/pdf`

Descarga el PDF del reporte. Devuelve `Content-Type: application/pdf`.

| Parámetro | Tipo | Descripción |
|---|---|---|
| reportId | Integer | ID del reporte |

---

### GET `/api/v1/clinical-reports/{reportId}`

Obtiene los metadatos de un reporte.

| Parámetro | Tipo | Descripción |
|---|---|---|
| reportId | Integer | ID del reporte |

---

### GET `/api/v1/clinical-reports/patients/{patientId}`

Lista todos los reportes de un paciente.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |

---

### GET `/api/v1/analytics-dashboards/patients/{patientId}`

Dashboard analítico del paciente.

| Parámetro | Tipo | Descripción |
|---|---|---|
| patientId | Long | ID del paciente |

**Response 200:**
```json
{
  "id": 1,
  "patientId": 100,
  "metricSnapshots": [],
  "trendIndicators": []
}
```

---

## 7. Communication Service

| Entorno | Base URL |
|---|---|
| **Producción (Render)** | `https://medibridge-communication-service.onrender.com` |
| **Local** | `http://localhost:8088` |

### Chat

#### POST `/api/v1/chat/messages`

Envía un mensaje de chat. **Requiere JWT** (senderUserId del token).

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| recipientUserId | Long | Sí | ID del destinatario |
| content | String | Sí | Contenido del mensaje |
| sentAt | Instant | Sí | Timestamp de envío |

**Response 201:**
```json
{
  "id": "msg_abc123",
  "chatId": "1_5",
  "senderUserId": 1,
  "recipientUserId": 5,
  "content": "¿Cómo está mamá hoy?",
  "sentAt": "2026-07-05T10:00:00Z"
}
```

---

#### GET `/api/v1/chat/messages/{senderUserId}/{recipientUserId}`

Historial de mensajes entre dos usuarios. **Requiere JWT**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| senderUserId | Long | ID del remitente |
| recipientUserId | Long | ID del destinatario |

---

#### POST `/api/v1/chat/users/connect`

Conecta un usuario al chat (presencia). **Sin auth**.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| userId | Long | Sí | ID del usuario |
| username | String | No | Nombre de usuario |
| fullName | String | No | Nombre completo |

**Response 200:**
```json
{
  "id": "conn_xyz",
  "userId": 1,
  "username": "juan.perez",
  "fullName": "Juan Pérez",
  "status": "ONLINE",
  "connectedAt": "2026-07-05T09:55:00Z",
  "disconnectedAt": null
}
```

---

#### POST `/api/v1/chat/users/disconnect`

Desconecta un usuario del chat. **Sin auth**.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| userId | Long | Sí | ID del usuario |
| username | String | No | Nombre de usuario |
| fullName | String | No | Nombre completo |

---

#### GET `/api/v1/chat/users/connected`

Lista usuarios conectados. **Sin auth**.

**Response 200:** Array de `ConnectedUserResource`.

---

### Notificaciones

#### GET `/api/v1/notifications/recipients/{recipientUserId}`

Todas las notificaciones de un usuario. **Sin auth**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| recipientUserId | Long | ID del usuario destinatario |

**Response 200:**
```json
[
  {
    "id": "notif_001",
    "recipientUserId": 1,
    "patientId": 100,
    "type": "DOSE_MISSED",
    "channel": "IN_APP",
    "status": "UNREAD",
    "title": "Dosis omitida",
    "message": "María Pérez omitió su dosis de Ibuprofeno a las 20:00",
    "sourceEvent": "DoseAdministrationSkipped",
    "createdAt": "2026-07-05T20:05:00Z",
    "readAt": null
  }
]
```

---

#### GET `/api/v1/notifications/recipients/{recipientUserId}/unread`

Notificaciones no leídas. **Sin auth**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| recipientUserId | Long | ID del usuario destinatario |

---

#### PATCH `/api/v1/notifications/{notificationId}/read`

Marca una notificación como leída. **Sin auth**.

| Parámetro | Tipo | Descripción |
|---|---|---|
| notificationId | String | ID de la notificación |

---

## Flujo típico de Family Network

```
1. POST /authentication/sign-up          → crear cuenta (ROLE_ADMIN)
2. POST /authentication/sign-in          → obtener JWT
3. POST /profiles/family-members         → crear perfil de familiar
4. POST /profiles/patients               → crear paciente
5. POST /profiles/patients/{p}/family-members/{f}  → vincular familiar al paciente
6. POST /profiles/patients/{p}/doctors/{d}         → asignar doctor al paciente
7. POST /appointments/family-visits      → agendar visita
8. POST /medications + schedules         → registrar medicación
9. POST /dose-administrations            → administrar dosis
10. GET /health-monitoring/{p}/observations  → monitorear salud
11. GET /clinical-reports/patients/{p}   → generar reportes (Premium)
12. POST /chat/messages                  → comunicarse con el doctor
```
