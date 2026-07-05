# Flujo completo: Segmento "Red de Apoyo Familiar" (Family Member)

**Escenario:** Maria Garcia (userId=5) es hija de Juan Garcia (patientId=3, paciente adulto mayor con hipertension). Maria quiere gestionar el cuidado de su padre: visitas, salud, medicamentos, comunicacion con el doctor y reportes.

---

## PASO 1 — Registro de cuenta
**Servicio:** `iam-service`

```http
POST /api/v1/authentication/sign-up
```
```json
{
  "username": "maria.garcia",
  "password": "SecurePass123!",
  "roles": ["ROLE_USER"]
}
```
**Respuesta 201:**
```json
{
  "id": 5,
  "username": "maria.garcia",
  "roles": ["ROLE_USER"]
}
```

---

## PASO 2 — Login
**Servicio:** `iam-service`

```http
POST /api/v1/authentication/sign-in
```
```json
{
  "username": "maria.garcia",
  "password": "SecurePass123!"
}
```
**Respuesta 200:**
```json
{
  "id": 5,
  "username": "maria.garcia",
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJpYS5nYXJjaWEifQ..."
}
```
> Guarda el token. Se usara como `Authorization: Bearer <token>` en todos los pasos siguientes.

---

## PASO 3 — Crear perfil de familiar
**Servicio:** `profiles-service`

```http
POST /api/v1/profiles/family-members
Authorization: Bearer <token>
```
```json
{
  "fullName": "Maria Garcia Lopez"
}
```
**Respuesta 201:**
```json
{
  "id": 10,
  "userId": 5,
  "fullName": "Maria Garcia Lopez"
}
```
> familyMemberProfileId = 10. Ahora Maria existe como familiar en el sistema.

---

## PASO 4 — Vincularse al paciente (Care Relationship)
**Servicio:** `profiles-service`

```http
POST /api/v1/profiles/patients/3/family-members/10
Authorization: Bearer <token>
```
**Respuesta 201:**
```json
{
  "id": 25,
  "familyMemberProfileId": 10,
  "patientId": 3,
  "active": true
}
```
> A partir de aqui, Maria tiene acceso a los datos del paciente ID 3.

---

## PASO 5 — Agendar visita familiar
**Servicio:** `appointments-service`

```http
POST /api/v1/appointments/family-visits
Authorization: Bearer <token>
```
```json
{
  "patientId": 3,
  "familyMemberProfileId": 10,
  "startsAt": "2026-07-05T10:00:00",
  "durationInMinutes": 60,
  "reason": "Visita semanal de acompanamiento"
}
```
**Respuesta 201:**
```json
{
  "id": 100,
  "patientId": 3,
  "familyMemberProfileId": 10,
  "appointmentType": "FAMILY_VISIT",
  "status": "SCHEDULED",
  "startsAt": "2026-07-05T10:00:00",
  "endsAt": "2026-07-05T11:00:00",
  "reason": "Visita semanal de acompanamiento"
}
```

---

## PASO 6 — Ver todas las citas del paciente
**Servicio:** `appointments-service`

```http
GET /api/v1/appointments/patient/3
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": 100,
    "patientId": 3,
    "appointmentType": "FAMILY_VISIT",
    "status": "SCHEDULED",
    "startsAt": "2026-07-05T10:00:00",
    "endsAt": "2026-07-05T11:00:00",
    "reason": "Visita semanal de acompanamiento"
  },
  {
    "id": 101,
    "patientId": 3,
    "appointmentType": "MEDICAL",
    "status": "SCHEDULED",
    "startsAt": "2026-07-08T09:00:00",
    "endsAt": "2026-07-08T09:30:00",
    "reason": "Control de presion arterial"
  }
]
```

---

## PASO 7 — Ver detalle de una cita
**Servicio:** `appointments-service`

```http
GET /api/v1/appointments/100
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
{
  "id": 100,
  "patientId": 3,
  "appointmentType": "FAMILY_VISIT",
  "status": "SCHEDULED",
  "startsAt": "2026-07-05T10:00:00",
  "endsAt": "2026-07-05T11:00:00",
  "reason": "Visita semanal de acompanamiento"
}
```

---

## PASO 8 — Registrar observacion de salud
**Servicio:** `healthmonitoring-service`

```http
POST /api/v1/health-monitoring/patients/3/observations
Authorization: Bearer <token>
```
```json
{
  "recordedByDoctorProfileId": null,
  "systolicBloodPressure": 130,
  "diastolicBloodPressure": 85,
  "bodyTemperature": 36.8,
  "painLevel": 2,
  "emotionalState": "CALM",
  "emotionalNotes": "Paciente tranquilo, de buen animo",
  "clinicalNotes": "Presion arterial dentro de rangos normales",
  "recordedAt": "2026-07-04T15:30:00"
}
```
**Respuesta 201:**
```json
{
  "id": 50,
  "patientId": 3,
  "recordedByDoctorProfileId": null,
  "systolicBloodPressure": 130,
  "diastolicBloodPressure": 85,
  "bodyTemperature": 36.8,
  "painLevel": 2,
  "emotionalState": "CALM",
  "emotionalNotes": "Paciente tranquilo, de buen animo",
  "clinicalNotes": "Presion arterial dentro de rangos normales",
  "recordedAt": "2026-07-04T15:30:00"
}
```

---

## PASO 9 — Ver historial de observaciones
**Servicio:** `healthmonitoring-service`

```http
GET /api/v1/health-monitoring/patients/3/observations
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": 50,
    "patientId": 3,
    "systolicBloodPressure": 130,
    "diastolicBloodPressure": 85,
    "bodyTemperature": 36.8,
    "painLevel": 2,
    "emotionalState": "CALM",
    "recordedAt": "2026-07-04T15:30:00"
  },
  {
    "id": 49,
    "patientId": 3,
    "systolicBloodPressure": 145,
    "diastolicBloodPressure": 92,
    "bodyTemperature": 37.1,
    "painLevel": 4,
    "emotionalState": "ANXIOUS",
    "recordedAt": "2026-07-03T10:00:00"
  }
]
```

---

## PASO 10 — Ver alertas clinicas activas (Premium)
**Servicio:** `healthmonitoring-service`

```http
GET /api/v1/health-monitoring/patients/3/alerts/active
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": 15,
    "patientId": 3,
    "alertType": "HIGH_BLOOD_PRESSURE",
    "severity": "WARNING",
    "message": "Presion arterial elevada en ultimas 24h",
    "active": true,
    "createdAt": "2026-07-04T12:00:00Z"
  }
]
```
> Requiere suscripcion pagada activa.

---

## PASO 11 — Ver resumen de salud del paciente (Premium)
**Servicio:** `healthmonitoring-service`

```http
GET /api/v1/health-monitoring/patients/3/summary
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
{
  "patientId": 3,
  "latestBloodPressure": "130/85",
  "averageTemperature": 36.8,
  "painTrend": "DESCENDING",
  "emotionalTrend": "STABLE",
  "activeAlerts": 1,
  "observationsCount": 15
}
```
> Requiere suscripcion pagada activa.

---

## PASO 12 — Registrar medicamento en inventario
**Servicio:** `medication-service`

```http
POST /api/v1/medications
Authorization: Bearer <token>
```
```json
{
  "patientId": 3,
  "name": "Losartan 50mg",
  "dosageAmount": 1,
  "dosageUnit": "TABLET",
  "administrationRoute": "ORAL",
  "stockQuantity": 30,
  "lowStockThreshold": 10,
  "expirationDate": "2027-06-30"
}
```
**Respuesta 201:**
```json
{
  "id": 200,
  "patientId": 3,
  "name": "Losartan 50mg",
  "dosageAmount": 1,
  "dosageUnit": "TABLET",
  "administrationRoute": "ORAL",
  "stockQuantity": 30,
  "lowStockThreshold": 10,
  "expirationDate": "2027-06-30",
  "active": true
}
```

---

## PASO 13 — Ver medicamentos del paciente
**Servicio:** `medication-service`

```http
GET /api/v1/medications/patients/3
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": 200,
    "patientId": 3,
    "name": "Losartan 50mg",
    "dosageAmount": 1,
    "dosageUnit": "TABLET",
    "administrationRoute": "ORAL",
    "stockQuantity": 30,
    "lowStockThreshold": 10,
    "expirationDate": "2027-06-30",
    "active": true
  },
  {
    "id": 201,
    "patientId": 3,
    "name": "Aspirina 100mg",
    "dosageAmount": 1,
    "dosageUnit": "TABLET",
    "administrationRoute": "ORAL",
    "stockQuantity": 60,
    "lowStockThreshold": 15,
    "expirationDate": "2028-01-15",
    "active": true
  }
]
```

---

## PASO 14 — Ver detalle de un medicamento
**Servicio:** `medication-service`

```http
GET /api/v1/medications/200
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
{
  "id": 200,
  "patientId": 3,
  "name": "Losartan 50mg",
  "dosageAmount": 1,
  "dosageUnit": "TABLET",
  "administrationRoute": "ORAL",
  "stockQuantity": 30,
  "lowStockThreshold": 10,
  "expirationDate": "2027-06-30",
  "active": true
}
```

---

## PASO 15 — Actualizar stock de medicamento
**Servicio:** `medication-service`

```http
PATCH /api/v1/medications/200/stock
Authorization: Bearer <token>
```
```json
{
  "stockQuantity": 25
}
```
**Respuesta 200:**
```json
{
  "id": 200,
  "patientId": 3,
  "name": "Losartan 50mg",
  "stockQuantity": 25,
  "active": true
}
```

---

## PASO 16 — Ver alertas de stock bajo
**Servicio:** `medication-service`

```http
GET /api/v1/medications/patients/3/low-stock
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "medicationId": 200,
    "patientId": 3,
    "medicationName": "Losartan 50mg",
    "currentStock": 8,
    "threshold": 10
  }
]
```

---

## PASO 17 — Crear horario de medicacion
**Servicio:** `medication-service`

```http
POST /api/v1/medication-schedules
Authorization: Bearer <token>
```
```json
{
  "medicationId": 200,
  "patientId": 3,
  "frequencyType": "DAILY",
  "timesPerDay": 1,
  "administrationTime": "08:00:00",
  "startDate": "2026-07-01",
  "endDate": "2026-12-31"
}
```
**Respuesta 201:**
```json
{
  "id": 300,
  "medicationId": 200,
  "patientId": 3,
  "frequencyType": "DAILY",
  "timesPerDay": 1,
  "administrationTime": "08:00:00",
  "startDate": "2026-07-01",
  "endDate": "2026-12-31",
  "active": true
}
```

---

## PASO 18 — Ver horarios activos del paciente
**Servicio:** `medication-service`

```http
GET /api/v1/medication-schedules/patients/3/active
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": 300,
    "medicationId": 200,
    "patientId": 3,
    "frequencyType": "DAILY",
    "timesPerDay": 1,
    "administrationTime": "08:00:00",
    "startDate": "2026-07-01",
    "endDate": "2026-12-31",
    "active": true
  }
]
```

---

## PASO 19 — Registrar dosis administrada
**Servicio:** `medication-service`

```http
POST /api/v1/dose-administrations
Authorization: Bearer <token>
```
```json
{
  "medicationId": 200,
  "scheduleId": 300,
  "patientId": 3,
  "administeredAt": "2026-07-04T08:05:00",
  "notes": "Tomo la pastilla con desayuno"
}
```
**Respuesta 201:**
```json
{
  "id": 500,
  "medicationId": 200,
  "scheduleId": 300,
  "patientId": 3,
  "occurredAt": "2026-07-04T08:05:00",
  "status": "ADMINISTERED",
  "notes": "Tomo la pastilla con desayuno"
}
```

---

## PASO 20 — Saltar una dosis
**Servicio:** `medication-service`

```http
POST /api/v1/dose-administrations/skip
Authorization: Bearer <token>
```
```json
{
  "medicationId": 200,
  "scheduleId": 300,
  "patientId": 3,
  "skippedAt": "2026-07-05T08:00:00",
  "reason": "Paciente reporto mareo, se omitio la dosis"
}
```
**Respuesta 201:**
```json
{
  "id": 501,
  "medicationId": 200,
  "scheduleId": 300,
  "patientId": 3,
  "occurredAt": "2026-07-05T08:00:00",
  "status": "SKIPPED",
  "notes": "Paciente reporto mareo, se omitio la dosis"
}
```

---

## PASO 21 — Ver historial de dosis
**Servicio:** `medication-service`

```http
GET /api/v1/dose-administrations/medications/200
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": 500,
    "medicationId": 200,
    "scheduleId": 300,
    "patientId": 3,
    "occurredAt": "2026-07-04T08:05:00",
    "status": "ADMINISTERED",
    "notes": "Tomo la pastilla con desayuno"
  },
  {
    "id": 501,
    "medicationId": 200,
    "scheduleId": 300,
    "patientId": 3,
    "occurredAt": "2026-07-05T08:00:00",
    "status": "SKIPPED",
    "notes": "Paciente reporto mareo, se omitio la dosis"
  }
]
```

---

## PASO 22 — Enviar mensaje al doctor
**Servicio:** `communication-service`

```http
POST /api/v1/chat/messages
Authorization: Bearer <token>
```
```json
{
  "recipientUserId": 8,
  "content": "Dr. Perez, mi padre amanecio con mareo. Se salta la dosis de Losartan. Recomienda ajustar?",
  "sentAt": "2026-07-05T09:15:00Z"
}
```
**Respuesta 201:**
```json
{
  "id": "msg-abc123",
  "chatId": "chat-5-8",
  "senderUserId": 5,
  "recipientUserId": 8,
  "content": "Dr. Perez, mi padre amanecio con mareo. Se salta la dosis de Losartan. Recomienda ajustar?",
  "sentAt": "2026-07-05T09:15:00Z"
}
```

---

## PASO 23 — Ver historial de chat con el doctor
**Servicio:** `communication-service`

```http
GET /api/v1/chat/messages/5/8
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": "msg-abc123",
    "chatId": "chat-5-8",
    "senderUserId": 5,
    "recipientUserId": 8,
    "content": "Dr. Perez, mi padre amanecio con mareo...",
    "sentAt": "2026-07-05T09:15:00Z"
  },
  {
    "id": "msg-def456",
    "chatId": "chat-5-8",
    "senderUserId": 8,
    "recipientUserId": 5,
    "content": "Gracias Maria. Reducir a media pastilla por 3 dias y monitorear.",
    "sentAt": "2026-07-05T09:30:00Z"
  }
]
```

---

## PASO 24 — Ver notificaciones
**Servicio:** `communication-service`

```http
GET /api/v1/notifications/recipients/5
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": "notif-001",
    "recipientUserId": 5,
    "patientId": 3,
    "type": "MEDICATION_REMINDER",
    "channel": "IN_APP",
    "status": "UNREAD",
    "title": "Hora de medicacion",
    "message": "Losartan 50mg - dosis de las 8:00 AM",
    "sourceEvent": "SCHEDULE_TRIGGER",
    "createdAt": "2026-07-04T08:00:00Z",
    "readAt": null
  },
  {
    "id": "notif-002",
    "recipientUserId": 5,
    "patientId": 3,
    "type": "LOW_STOCK",
    "channel": "IN_APP",
    "status": "UNREAD",
    "title": "Stock bajo",
    "message": "Losartan 50mg tiene 8 unidades restantes",
    "sourceEvent": "STOCK_THRESHOLD",
    "createdAt": "2026-07-03T10:00:00Z",
    "readAt": null
  }
]
```

---

## PASO 25 — Ver solo notificaciones no leidas
**Servicio:** `communication-service`

```http
GET /api/v1/notifications/recipients/5/unread
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": "notif-001",
    "recipientUserId": 5,
    "patientId": 3,
    "type": "MEDICATION_REMINDER",
    "status": "UNREAD",
    "title": "Hora de medicacion",
    "message": "Losartan 50mg - dosis de las 8:00 AM",
    "createdAt": "2026-07-04T08:00:00Z",
    "readAt": null
  }
]
```

---

## PASO 26 — Marcar notificacion como leida
**Servicio:** `communication-service`

```http
PATCH /api/v1/notifications/notif-001/read
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
{
  "id": "notif-001",
  "recipientUserId": 5,
  "patientId": 3,
  "type": "MEDICATION_REMINDER",
  "status": "READ",
  "title": "Hora de medicacion",
  "createdAt": "2026-07-04T08:00:00Z",
  "readAt": "2026-07-04T08:10:00Z"
}
```

---

## PASO 27 — Generar reporte clinico (Premium)
**Servicio:** `reports-analytics-service`

```http
POST /api/v1/clinical-reports
Authorization: Bearer <token>
```
```json
{
  "patientId": 3,
  "reportType": "CLINICAL_SUMMARY",
  "dateRange": {
    "from": "2026-06-01",
    "to": "2026-07-04"
  }
}
```
**Respuesta 201:**
```json
{
  "id": 75,
  "patientId": 3,
  "reportType": "CLINICAL_SUMMARY",
  "status": "GENERATED",
  "generatedAt": "2026-07-04T16:00:00Z",
  "pdfPath": "/reports/clinical-75.pdf"
}
```

---

## PASO 28 — Descargar reporte en PDF (Premium)
**Servicio:** `reports-analytics-service`

```http
GET /api/v1/clinical-reports/75/pdf
Authorization: Bearer <token>
```
**Respuesta 200:** `Content-Type: application/pdf` (archivo binario)

---

## PASO 29 — Ver reportes del paciente (Premium)
**Servicio:** `reports-analytics-service`

```http
GET /api/v1/clinical-reports/patients/3
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": 75,
    "patientId": 3,
    "reportType": "CLINICAL_SUMMARY",
    "status": "GENERATED",
    "generatedAt": "2026-07-04T16:00:00Z"
  }
]
```

---

## PASO 30 — Ver dashboard analytics (Premium)
**Servicio:** `reports-analytics-service`

```http
GET /api/v1/analytics-dashboards/patients/3
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
{
  "patientId": 3,
  "totalObservations": 15,
  "averageBloodPressure": "132/84",
  "medicationAdherence": 92.5,
  "skippedDoses": 2,
  "activeAlerts": 1,
  "reportsGenerated": 3,
  "lastObservation": "2026-07-04T15:30:00"
}
```

---

## Resumen por servicio

| Servicio | Endpoints usados por Family Member | Total |
|----------|-----------------------------------|-------|
| **iam-service** | sign-up, sign-in | 2 |
| **profiles-service** | crear perfil familiar, vincular a paciente | 2 |
| **appointments-service** | agendar visita, ver citas, ver detalle | 3 |
| **healthmonitoring-service** | registrar observacion, ver observaciones, alertas, resumen | 4 |
| **medication-service** | registrar med, ver meds, detalle, stock, alertas stock, horarios, dosis, saltar dosis, historial | 9 |
| **communication-service** | enviar mensaje, ver chat, ver notificaciones, no leidas, marcar leida | 5 |
| **reports-analytics-service** | generar reporte, descargar PDF, ver reportes, dashboard | 4 |
| **payments-service** | (crear suscripcion, consultar estado) | 1-2 |
| **Total** | | ~30 |

---

## Lo que NO puede hacer el Family Member

| Accion | Endpoint bloqueado | Razon |
|--------|-------------------|-------|
| Crear perfil de doctor | `POST /profiles/doctors` | Es para doctores |
| Agendar cita medica | `POST /appointments/medical` | Solo DoctorProfile |
| Asignarse como doctor | `POST /patients/{id}/doctors/{docId}` | Solo DoctorProfile |

> **Nota:** Tecnicamente los endpoints no validan el tipo de perfil en el controller. La validacion esta en el `AuthenticatedPatientAccessService` que verifica la relacion de cuidado. Si un familiar intentara `POST /appointments/medical`, el sistema aceptaria la request pero el `requestedByUserId` no tendria perfil de doctor, lo cual podria fallar a nivel de dominio.
