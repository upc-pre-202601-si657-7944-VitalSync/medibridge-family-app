# Estructura UI - App Movil Red de Apoyo Familiar

**Fecha:** 2026-07-05
**Segmento:** Family Member (Red de Apoyo Familiar)
**Total secciones:** 9
**Total pantallas estimadas:** 25-30

---

## Secciones principales (Bottom Navigation)

| # | Seccion | Endpoints que consume | Proposito |
|---|---------|----------------------|-----------|
| 1 | **Home / Dashboard** | health-monitoring (summary, alerts), appointments (list), medications (low-stock, schedules), notifications (unread) | Vista resumen de todo lo que importa del paciente |
| 2 | **Salud** | health-monitoring (observations, alerts, summary) | Monitoreo clinico del paciente |
| 3 | **Medicamentos** | medications (inventario, stock), medication-schedules, dose-administrations | Gestion completa de la medicacion |
| 4 | **Citas** | appointments (family-visits, list) | Agenda de visitas y citas |
| 5 | **Comunicacion** | chat (messages), notifications | Chat con doctores/cuidadores + notificaciones |

---

## Secciones secundarias

| # | Seccion | Endpoints que consume | Proposito |
|---|---------|----------------------|-----------|
| 6 | **Reportes** (Premium) | clinical-reports, analytics-dashboards | Reportes PDF y metricas |
| 7 | **Perfil / Configuracion** | profiles (family-member, patient), subscriptions, invoices | Datos personales y suscripcion |

---

## Secciones de onboarding (pre-login)

| # | Seccion | Endpoints que consume | Proposito |
|---|---------|----------------------|-----------|
| 8 | **Auth** | sign-up, sign-in | Registro y login |
| 9 | **Setup inicial** | crear perfil familiar, crear paciente, vincular familiar a paciente, asignar doctor | Configuracion inicial del cuidado |

---

## UI por seccion

### 1. Home / Dashboard

```
+-------------------------------------+
|  <- Roberto Garcia Mendez    [!] (3)|  <- Selector de paciente + badge notificaciones
+-------------------------------------+
|                                     |
|  +-- Alerta ----------------------+ |
|  | Presion arterial elevada       | |  <- Card de alerta activa (Premium)
|  +--------------------------------+ |
|                                     |
|  +-- Signos vitales -------------+  |
|  | 130/85 mmHg    36.8 C         | |  <- Ultimos signos del summary
|  | Calm          Dolor: 2/10     | |
|  +--------------------------------+ |
|                                     |
|  +-- Proxima cita ---------------+  |
|  | 06 Jul - 10:00 AM             | |  <- Proxima visita del appointments
|  | Visita de acompanamiento      | |
|  +--------------------------------+ |
|                                     |
|  +-- Medicamentos hoy -----------+  |
|  | Losartan 50mg - 8:00 AM    OK | |  <- Horarios del dia
|  | Aspirina 100mg - 8:00 AM   OK | |
|  | Losartan 50mg - 8:00 PM  Pend | |
|  +--------------------------------+ |
|                                     |
|  +-- Stock bajo -----------------+  |
|  | Losartan 50mg - 8 unidades    | |  <- Alertas de reposicion
|  +--------------------------------+ |
|                                     |
+------+-----+------+------+---------+
| Home | Salud| Meds | Citas| Chat  |  <- Bottom navigation
+------+-----+------+------+---------+
```

**Componentes:**
- Selector de paciente (header)
- Card de alerta activa (Premium)
- Card de signos vitales (Premium)
- Card de proxima cita
- Lista de medicamentos del dia
- Card de stock bajo (condicional)
- Badge de notificaciones no leidas

---

### 2. Salud

```
+-------------------------------------+
| Salud                               |
+-------------------------------------+
|                                     |
|  [Resumen] [Observaciones] [Alertas]|  <- Tabs internos
|                                     |
|  +-- Registrar observacion -------+ |
|  |  Presion:  [130] / [85]        | |
|  |  Temp:     [36.8] C            | |
|  |  Dolor:    [slider 0-10]       | |
|  |  Estado:   [Calm dropdown]     | |
|  |  Notas:    [_______________]   | |
|  |         [Guardar observacion]  | |
|  +--------------------------------+ |
|                                     |
|  +-- Historial -------------------+ |
|  |  04 Jul - 15:30                | |
|  |  130/85 | 36.8 C | Dolor: 2   | |
|  |                                | |
|  |  03 Jul - 10:00                | |
|  |  145/92 | 37.1 C | Dolor: 4   | |
|  +--------------------------------+ |
|                                     |
+-------------------------------------+
```

**Pantallas internas:**

| Tab | Endpoint | Descripcion |
|-----|----------|-------------|
| Resumen | `GET /health-monitoring/patients/{p}/summary` | Panorama general (Premium) |
| Observaciones | `GET /health-monitoring/patients/{p}/observations` | Lista cronologica + form de registro |
| Alertas | `GET /health-monitoring/patients/{p}/alerts/active` | Alertas clinicas con severidad (Premium) |

**Formulario de observacion:**
- Presion sistolica (Integer)
- Presion diastolica (Integer)
- Temperatura corporal (BigDecimal)
- Nivel de dolor (0-10 slider)
- Estado emocional (dropdown: CALM, ANXIOUS, STABLE, etc.)
- Notas emocionales (String)
- Notas clinicas (String)

---

### 3. Medicamentos

```
+-------------------------------------+
| Medicamentos              [+ Agregar]|
+-------------------------------------+
|                                     |
|  [Inventario] [Horarios] [Historial]|  <- Tabs internos
|                                     |
|  +-- Losartan 50mg ---------------+ |
|  | 1 tableta | Oral | Stock: 25   | |
|  | [========--] 83%               | |  <- Barra de stock visual
|  | Vence: Jun 2027                | |
|  | [Editar] [Registrar dosis]     | |
|  +--------------------------------+ |
|                                     |
|  +-- Aspirina 100mg --------------+ |
|  | 1 tableta | Oral | Stock: 60   | |
|  | [============] 100%            | |
|  | Vence: Ene 2028                | |
|  | [Editar] [Registrar dosis]     | |
|  +--------------------------------+ |
|                                     |
|  +-- Stock bajo ------------------+ |
|  | Losartan 50mg: 8 unidades      | |  <- Seccion condicional
|  | Umbral: 10 -> [Reponer stock]  | |
|  +--------------------------------+ |
|                                     |
+-------------------------------------+
```

**Modal de registro de dosis:**
```
+-------------------------------------+
|  Registrar dosis                    |
+-------------------------------------+
|  Medicamento: Losartan 50mg         |
|  Horario: 8:00 AM                   |
|                                     |
|  (o) Administrada                   |
|  ( ) Saltada                        |
|                                     |
|  Hora: [08:05 AM]                   |
|  Notas: [Tomo con desayuno____]    |
|                                     |
|         [Confirmar]                 |
+-------------------------------------+
```

**Tabs internos:**

| Tab | Endpoints | Descripcion |
|-----|-----------|-------------|
| Inventario | `GET /medications/patients/{p}`, `POST /medications`, `PATCH /medications/{id}/stock`, `GET /medications/{id}`, `GET /medications/patients/{p}/low-stock` | Lista de medicamentos + acciones |
| Horarios | `GET /medication-schedules/patients/{p}/active`, `POST /medication-schedules` | Calendario de tomas |
| Historial | `GET /dose-administrations/medications/{id}` | Registro de dosis por medicamento |

**Formulario de nuevo medicamento:**
- Nombre del medicamento (String)
- Cantidad por dosis (BigDecimal)
- Unidad (dropdown: TABLET, MG, ML, etc.)
- Via de administracion (dropdown: ORAL, INTRAVENOUS, etc.)
- Stock inicial (Integer)
- Umbral de stock bajo (Integer)
- Fecha de vencimiento (Date)

**Formulario de horario:**
- Medicamento (selector)
- Tipo de frecuencia (dropdown: DAILY, WEEKLY, etc.)
- Veces por dia (Integer)
- Hora de administracion (Time)
- Fecha inicio (Date)
- Fecha fin (Date)

---

### 4. Citas

```
+-------------------------------------+
| Citas                   [+ Agendar] |
+-------------------------------------+
|                                     |
|  [Todas] [Familiares] [Medicas]     |  <- Filtros
|                                     |
|  +-- Julio 2026 ------------------+ |
|  |                                 | |
|  |  06 Lun ----------------------- | |
|  |  10:00 - 11:00                  | |
|  |  Visita de acompanamiento       | |
|  |  Estado: Programada             | |
|  |                                 | |
|  |  08 Mie ----------------------- | |
|  |  09:00 - 09:30                  | |
|  |  Control de presion arterial    | |
|  |  Estado: Programada             | |
|  |                                 | |
|  +--------------------------------+ |
|                                     |
+-------------------------------------+
```

**Modal de agendar visita familiar:**
```
+-------------------------------------+
|  Agendar visita familiar            |
+-------------------------------------+
|  Paciente: Roberto Garcia           |
|  Fecha:    [06 Jul 2026]            |
|  Hora:     [10:00 AM]               |
|  Duracion: [60 min]                 |
|  Motivo:   [___________________]    |
|                                     |
|         [Agendar visita]            |
+-------------------------------------+
```

**Endpoints:**
- `GET /appointments/patient/{p}` - Lista de citas
- `POST /appointments/family-visits` - Agendar visita familiar
- `GET /appointments/{id}` - Detalle de cita

---

### 5. Comunicacion

```
+-------------------------------------+
| Comunicacion                        |
+-------------------------------------+
|                                     |
|  [Chat] [Notificaciones]            |  <- Tabs internos
|                                     |
|  +-- Conversaciones --------------+ |
|  |  Dr. Perez                     | |
|  |  "Reducir a media pastilla..."  | |
|  |  Hace 2h - 1 sin leer          | |
|  |                                | |
|  |  Carlos (hermano)              | |
|  |  "Como estuvo papa hoy?"       | |
|  |  Hace 5h                       | |
|  +--------------------------------+ |
+-------------------------------------+
```

**Pantalla de chat individual:**
```
+-------------------------------------+
|  <- Chat con Dr. Perez              |
+-------------------------------------+
|                                     |
|  [Katy] 09:15 AM                    |
|  Mi padre amanecio con mareo        |
|                                     |
|           [Dr. Perez] 09:30 AM      |
|  Reducir a media pastilla x3 dias   |
|                                     |
|  [___________________] [Enviar]     |
+-------------------------------------+
```

**Pantalla de notificaciones:**
```
+-------------------------------------+
|  Notificaciones                     |
+-------------------------------------+
|  [Todas] [No leidas]                |  <- Filtro
|                                     |
|  +-- Medication Reminder ----------+|
|  | Losartan 50mg - 8:00 AM        ||
|  | Hace 2h               [Marcar] ||
|  +--------------------------------+|
|                                     |
|  +-- Stock Bajo -------------------+|
|  | Losartan 50mg tiene 8 unidades ||
|  | Hace 1 dia            [Marcar] ||
|  +--------------------------------+|
|                                     |
+-------------------------------------+
```

**Endpoints:**
- `POST /chat/messages` - Enviar mensaje
- `GET /chat/messages/{sender}/{recipient}` - Historial de chat
- `GET /notifications/recipients/{id}` - Todas las notificaciones
- `GET /notifications/recipients/{id}/unread` - No leidas
- `PATCH /notifications/{id}/read` - Marcar como leida

---

### 6. Reportes (Premium)

```
+-------------------------------------+
| Reportes                  [Premium] |
+-------------------------------------+
|                                     |
|  +-- Upgrade a Premium -----------+ |
|  |  Accede a reportes clinicos,   | |
|  |  alertas avanzadas y mas       | |
|  |         [Ver planes]           | |
|  +--------------------------------+ |
|                                     |
|  +-- Reportes generados ---------+  |
|  |  Resumen Clinico - Jul 2026   | |
|  |  Generado: 04 Jul 2026        | |
|  |  [Ver] [Descargar PDF]        | |
|  +--------------------------------+ |
|                                     |
|  [+ Generar nuevo reporte]          |
|                                     |
|  +-- Dashboard Analytics ---------+ |
|  |  Adherencia: 92.5%             | |
|  |  [============--] 92%          | |
|  |                                 | |
|  |  Presion promedio: 132/84      | |
|  |  Observaciones: 15             | |
|  |  Dosis omitidas: 2             | |
|  +--------------------------------+ |
|                                     |
+-------------------------------------+
```

**Endpoints:**
- `GET /clinical-reports/patients/{p}` - Lista de reportes
- `POST /clinical-reports` - Generar reporte
- `GET /clinical-reports/{id}` - Ver reporte
- `GET /clinical-reports/{id}/pdf` - Descargar PDF
- `GET /analytics-dashboards/patients/{p}` - Dashboard metricas

**Premium gating:**
- Si el usuario no tiene suscripcion activa, mostrar prompt de upgrade
- Las secciones bloqueadas deben verse pero con lock icon

---

### 7. Perfil / Configuracion

```
+-------------------------------------+
| Configuracion                       |
+-------------------------------------+
|                                     |
|  +-- Mi perfil -------------------+ |
|  |  Katy Fernandez Rodriguez      | |
|  |  Familiares ID: 10             | |
|  +--------------------------------+ |
|                                     |
|  +-- Paciente a cargo -----------+  |
|  |  Roberto Garcia Mendez        | |
|  |  Paciente ID: 3               | |
|  +--------------------------------+ |
|                                     |
|  +-- Equipo de cuidado ----------+  |
|  |  Dr. Carlos Perez             | |
|  |  Carlos Garcia (hermano)      | |
|  +--------------------------------+ |
|                                     |
|  +-- Suscripcion ----------------+  |
|  |  Plan: Free                   | |
|  |  [Upgrade a Premium ->]       | |
|  +--------------------------------+ |
|                                     |
|  +-- Facturas -------------------+  |
|  |  Historial de pagos           | |
|  +--------------------------------+ |
|                                     |
|  [Cerrar sesion]                    |
|                                     |
+-------------------------------------+
```

**Endpoints:**
- `GET /profiles/family-members/{id}` - Mi perfil
- `GET /profiles/patients/{id}` - Datos del paciente
- `GET /internal/profiles/patients/{p}/care-team-members` - Equipo de cuidado
- `GET /subscriptions/users/{id}/active` - Estado de suscripcion
- `POST /subscriptions` - Crear suscripcion
- `GET /invoices/users/{id}` - Historial de facturas

---

### 8. Auth (Onboarding)

```
+-------------------------------------+
|                                     |
|           [Logo MediBridge]         |
|                                     |
|  +-- Iniciar sesion -------------+  |
|  |  Usuario: [_______________]   | |
|  |  Password: [_______________]  | |
|  |         [Ingresar]            | |
|  |                                | |
|  |  No tienes cuenta?            | |
|  |  [Registrate aqui]            | |
|  +--------------------------------+ |
|                                     |
+-------------------------------------+
```

**Pantalla de registro:**
```
+-------------------------------------+
|                                     |
|           [Logo MediBridge]         |
|                                     |
|  +-- Crear cuenta ---------------+  |
|  |  Usuario: [_______________]   | |
|  |  Password: [_______________]  | |
|  |  Confirmar: [_______________] | |
|  |         [Registrarme]         | |
|  |                                | |
|  |  Ya tienes cuenta?            | |
|  |  [Inicia sesion]              | |
|  +--------------------------------+ |
|                                     |
+-------------------------------------+
```

**Endpoints:**
- `POST /authentication/sign-up` - Registro
- `POST /authentication/sign-in` - Login

---

### 9. Setup inicial (flujo post-registro)

```
+-------------------------------------+
| Configuracion inicial        (1/4)  |  <- Stepper de pasos
+-------------------------------------+
|                                     |
|  +-- Paso 1: Tu perfil ----------+  |
|  |  Nombre completo:             | |
|  |  [Katy Fernandez Rodriguez]   | |
|  |         [Siguiente ->]         | |
|  +--------------------------------+ |
|                                     |
+-------------------------------------+
```

**Pasos del setup:**

| Paso | Endpoint | Descripcion |
|------|----------|-------------|
| 1. Tu perfil | `POST /profiles/family-members` | Nombre completo del familiar |
| 2. Tu paciente | `POST /profiles/patients` | Datos del familiar a cargo |
| 3. Vinculacion | `POST /profiles/patients/{p}/family-members/{f}` | Crear relacion de cuidado |
| 4. Doctor | `POST /profiles/patients/{p}/doctors/{d}` | Vincular medico tratante |

---

## Resumen de complejidad

| # | Seccion | Prioridad | Complejidad UI | Pantallas |
|---|---------|-----------|----------------|-----------|
| 1 | Home / Dashboard | Alta | Media | 1 |
| 2 | Salud | Alta | Media | 3 (tabs) + 1 modal |
| 3 | Medicamentos | Alta | Alta | 3 (tabs) + 3 modales |
| 4 | Citas | Alta | Baja | 1 + 1 modal |
| 5 | Comunicacion | Alta | Alta | 2 (tabs) + chat individual |
| 6 | Reportes (Premium) | Media | Media | 2 + 1 modal |
| 7 | Perfil / Config | Media | Baja | 1 |
| 8 | Auth | Alta | Baja | 2 |
| 9 | Setup inicial | Alta | Media | 4 (stepper) |
| | **Total** | | | **~25-30** |

---

## Consideraciones tecnicas

### Premium Gating
- Las secciones de Salud (alertas/resumen), Reportes y Dashboard deben mostrar un prompt de upgrade si el usuario no tiene suscripcion activa
- Las secciones bloqueadas deben verse pero con lock icon y CTA a upgrade

### Multi-paciente
- Si el familiar cuida a mas de un paciente, necesita un selector de paciente en la parte superior del Home
- El selector debe aparecer en todas las secciones que consumen endpoints con `{patientId}`

### Notificaciones push
- Los endpoints de notificaciones son REST, pero para tiempo real convendria WebSocket (ya existe en communication-service)
- El badge del tab de Comunicacion debe actualizarse en tiempo real

### Offline
- El inventario de medicamentos y el registro de dosis son candidatos fuertes para cache offline
- Las observaciones de salud tambien podrian cachearse y sincronizarse cuando haya conexion

### Navegacion
```
[Auth] -> Sign Up / Sign In
  |
[Setup] -> Crear perfil -> Registrar paciente -> Vincular -> Asignar doctor
  |
+----------------------------------------------+
|  Home  |  Salud  |  Meds  |  Citas  |  Chat |
+----------------------------------------------+
  |
  +-> (desde perfil/settings)
       [Reportes] -> Solo Premium
       [Suscripcion] -> Gestion de pagos
```

### Estados de carga y error
- Cada pantalla debe manejar: loading, success, error, empty state
- Los errores de red deben mostrar un mensaje claro con opcion de reintentar
- Las pantallas con datos del paciente deben manejar el caso "sin paciente vinculado"
