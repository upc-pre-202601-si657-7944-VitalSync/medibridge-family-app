# Plan de Implementacion UI - MediBridge Family

**Fecha:** 2026-07-05
**Estado actual del proyecto:** Analisis y planificacion

---

## Estado Actual del Proyecto

### Tecnologia y Stack

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | React Native + Expo SDK 57 |
| Navegacion | expo-router (file-based routing) |
| Estado global | Zustand |
| HTTP Client | Axios |
| Storage | expo-secure-store + react-native-mmkv |
| Internacionalizacion | i18next + react-i18next |
| Fuentes | @expo-google-fonts/inter |
| Animaciones | react-native-reanimated |
| Lenguaje | TypeScript |

### Estructura de Carpetas

```
medi-bridge-family/
├── app/                          # Rutas (expo-router)
│   ├── _layout.tsx              # Root layout con RouteGuard
│   ├── (auth)/                  # Grupo de autenticacion
│   │   ├── _layout.tsx
│   │   ├── login.tsx            # ✅ Implementado
│   │   └── register.tsx         # ✅ Implementado
│   └── (family)/                # Grupo principal (requiere auth)
│       ├── _layout.tsx          # Drawer navigation
│       ├── dashboard.tsx        # ✅ Implementado (basico)
│       ├── profile.tsx          # ✅ Implementado (perfil familiar)
│       ├── patient/
│       │   ├── index.tsx        # ✅ Implementado (lista/crear)
│       │   └── [id].tsx         # ✅ Implementado (detalle)
│       ├── doctor/
│       │   ├── index.tsx        # ✅ Implementado (lista/crear)
│       │   └── [id].tsx         # ✅ Implementado (detalle)
│       ├── appointments.tsx     # ✅ Implementado (lista + form)
│       ├── medication.tsx       # ✅ Implementado (solo lista)
│       ├── monitoring.tsx       # ✅ Implementado (solo lista)
│       ├── messages.tsx         # ✅ Implementado (notificaciones)
│       ├── reports.tsx          # ✅ Implementado (lista + generar)
│       ├── payments.tsx         # ⚠️ Revisar
│       └── settings.tsx         # ✅ Implementado (basico)
├── src/
│   ├── core/
│   │   ├── api/services.ts      # ✅ Axios instances configuradas
│   │   ├── auth/auth-store.ts   # ✅ Zustand store para auth
│   │   ├── i18n/                # ✅ Internacionalizacion
│   │   └── storage/             # ✅ MMKV + SecureStore
│   ├── features/
│   │   ├── appointments/        # ⚠️ Vacio o minimo
│   │   ├── communication/       # ⚠️ Vacio o minimo
│   │   ├── family/              # ✅ drawer-content.tsx
│   │   ├── iam/                 # ✅ use-auth, models, enums
│   │   ├── medication/          # ⚠️ Vacio o minimo
│   │   ├── monitoring/          # ⚠️ Vacio o minimo
│   │   ├── payments/            # ⚠️ Vacio o minimo
│   │   ├── profiles/            # ⚠️ Vacio o minimo
│   │   └── reports/             # ⚠️ Vacio o minimo
│   └── shared/
│       ├── components/          # ✅ 9 componentes base
│       └── theme/               # ✅ colors, spacing, typography
└── docs/                        # Documentacion
```

### Componentes Shared Disponibles

| Componente | Descripcion |
|------------|-------------|
| Button | Boton con estados loading/disabled |
| TextInput | Input con label y validacion |
| Card | Contenedor con sombra |
| Badge | Etiqueta de estado |
| EmptyState | Estado vacio con icono |
| LoadingSpinner | Spinner de carga |
| Banner | Mensajes de error/success |
| Select | Dropdown selector |
| Logo | Logo de MediBridge |

### Endpoints Configurados

```typescript
// src/core/api/services.ts
const PRODUCTION_BASE_URL = 'https://medibridge-api-gateway.onrender.com/api/v1';
```

Todos los servicios apuntan al API Gateway en produccion.

---

## Analisis GAP: Lo que existe vs Lo que falta

### Seccion 1: Auth (Onboarding)

| Pantalla | Estado | Observaciones |
|----------|--------|---------------|
| Splash Screen | ⚠️ Basico | Solo muestra spinner, falta animacion |
| Sign Up | ✅ Implementado | Falta validacion de campos |
| Sign In | ✅ Implementado | Falta "Olvide mi password" |

### Seccion 2: Setup Inicial

| Pantalla | Estado | Observaciones |
|----------|--------|---------------|
| Crear perfil familiar | ✅ Implementado | En profile.tsx |
| Registrar paciente | ✅ Implementado | En patient/index.tsx |
| Vincular familiar a paciente | ❌ No implementado | Falta endpoint y UI |
| Asignar doctor | ✅ Implementado | En doctor/index.tsx |

### Seccion 3: Home / Dashboard

| Componente | Estado | Observaciones |
|------------|--------|---------------|
| Selector de paciente | ❌ No implementado | Hardcodeado en profilesStore |
| Card de alerta activa | ❌ No implementado | Requiere endpoint premium |
| Card de signos vitales | ❌ No implementado | Requiere endpoint summary |
| Card de proxima cita | ❌ No implementado | Solo muestra metricas |
| Lista de medicamentos del dia | ❌ No implementado | Falta logica de horarios |
| Card de stock bajo | ❌ No implementado | Falta filtro low-stock |
| Badge de notificaciones | ⚠️ Parcial | Solo en messages.tsx |

### Seccion 4: Salud

| Pantalla | Estado | Observaciones |
|----------|--------|---------------|
| Lista de observaciones | ✅ Implementado | monitoring.tsx |
| Formulario de observacion | ❌ No implementado | Falta modal/form |
| Tabs internos | ❌ No implementado | Falta Resumen/Alertas |
| Alertas clinicas (Premium) | ❌ No implementado | Falta gating |
| Resumen de salud (Premium) | ❌ No implementado | Falta endpoint |

### Seccion 5: Medicamentos

| Pantalla | Estado | Observaciones |
|----------|--------|---------------|
| Lista de medicamentos | ✅ Implementado | medication.tsx |
| Agregar medicamento | ❌ No implementado | Falta formulario |
| Detalle de medicamento | ❌ No implementado | Falta pantalla |
| Actualizar stock | ❌ No implementado | Falta modal |
| Alertas stock bajo | ⚠️ Parcial | Solo badge, no pantalla |
| Horarios activos | ❌ No implementado | Falta tab |
| Crear horario | ❌ No implementado | Falta formulario |
| Registrar dosis | ❌ No implementado | Falta modal |
| Saltar dosis | ❌ No implementado | Falta modal |
| Historial de dosis | ❌ No implementado | Falta tab |

### Seccion 6: Citas

| Pantalla | Estado | Observaciones |
|----------|--------|---------------|
| Lista de citas | ✅ Implementado | appointments.tsx |
| Agendar visita familiar | ✅ Implementado | Form en la misma pantalla |
| Detalle de cita | ❌ No implementado | Falta modal/pantalla |
| Filtros (Todas/Familiares/Medicas) | ❌ No implementado | Falta tabs/filtros |

### Seccion 7: Comunicacion

| Pantalla | Estado | Observaciones |
|----------|--------|---------------|
| Lista de notificaciones | ✅ Implementado | messages.tsx |
| Marcar como leida | ✅ Implementado | Funcional |
| Chat con doctores | ❌ No implementado | Falta pantalla completa |
| Enviar mensaje | ❌ No implementado | Falta formulario |
| Historial de chat | ❌ No implementado | Falta lista de mensajes |
| Tabs Chat/Notificaciones | ❌ No implementado | Solo muestra notificaciones |

### Seccion 8: Reportes (Premium)

| Pantalla | Estado | Observaciones |
|----------|--------|---------------|
| Lista de reportes | ✅ Implementado | reports.tsx |
| Generar reporte | ✅ Implementado | Form en la misma pantalla |
| Ver detalle de reporte | ❌ No implementado | Falta pantalla |
| Descargar PDF | ❌ No implementado | Falta integracion |
| Dashboard analytics | ❌ No implementado | Falta pantalla completa |
| Premium gating | ❌ No implementado | Falta validacion de suscripcion |

### Seccion 9: Perfil / Configuracion

| Pantalla | Estado | Observaciones |
|----------|--------|---------------|
| Mi perfil | ✅ Implementado | profile.tsx |
| Datos del paciente | ✅ Implementado | patient/[id].tsx |
| Equipo de cuidado | ❌ No implementado | Falta pantalla |
| Estado de suscripcion | ❌ No implementado | Falta en payments.tsx |
| Historial de facturas | ❌ No implementado | Falta en payments.tsx |
| Cerrar sesion | ⚠️ Parcial | Falta boton en settings |

---

## Plan de Implementacion por Fases

### Fase 1: Core Infrastructure (Semana 1)

**Objetivo:** Establecer bases solidas para el desarrollo

| Tarea | Prioridad | Estimado | Dependencias |
|-------|-----------|----------|--------------|
| 1.1 Crear tipos TypeScript para todos los modelos | Alta | 4h | - |
| 1.2 Implementar Premium gating service | Alta | 3h | 1.1 |
| 1.3 Crear hooks personalizados por feature | Alta | 6h | 1.1 |
| 1.4 Implementar error handling global | Media | 4h | - |
| 1.5 Agregar pull-to-refresh consistente | Media | 2h | - |

**Entregables:**
- `src/features/*/domain/models.ts` - Tipos para cada feature
- `src/core/services/premium-service.ts` - Validacion de suscripcion
- `src/features/*/application/use-*.ts` - Hooks por feature
- `src/shared/hooks/use-error-handler.ts` - Manejo de errores

---

### Fase 2: Home / Dashboard Mejorado (Semana 2)

**Objetivo:** Dashboard completo con toda la informacion relevante

| Tarea | Prioridad | Estimado | Dependencias |
|-------|-----------|----------|--------------|
| 2.1 Selector de paciente (si hay multiples) | Alta | 4h | 1.1 |
| 2.2 Card de alerta activa | Alta | 3h | 1.2 |
| 2.3 Card de signos vitales (summary) | Alta | 4h | 1.1 |
| 2.4 Card de proxima cita | Media | 3h | 1.1 |
| 2.5 Lista de medicamentos del dia | Media | 4h | 1.3 |
| 2.6 Card de stock bajo | Media | 2h | 1.3 |
| 2.7 Badge de notificaciones no leidas | Media | 2h | - |

**Entregables:**
- `app/(family)/dashboard.tsx` - Dashboard completo
- `src/features/monitoring/ui/health-summary-card.tsx`
- `src/features/appointments/ui/next-appointment-card.tsx`
- `src/features/medication/ui/today-medications-card.tsx`
- `src/features/medication/ui/low-stock-alert.tsx`

---

### Fase 3: Salud (Semana 3)

**Objetivo:** Modulo de salud completo con registro y visualizacion

| Tarea | Prioridad | Estimado | Dependencias |
|-------|-----------|----------|--------------|
| 3.1 Tabs internos (Resumen/Observaciones/Alertas) | Alta | 4h | - |
| 3.2 Formulario de observacion (modal) | Alta | 6h | 1.1 |
| 3.3 Pantalla de resumen de salud (Premium) | Alta | 5h | 1.2 |
| 3.4 Pantalla de alertas clinicas (Premium) | Alta | 4h | 1.2 |
| 3.5 Mejorar lista de observaciones | Media | 3h | - |
| 3.6 Agregar graficos de tendencias | Baja | 6h | 3.5 |

**Entregables:**
- `app/(family)/monitoring.tsx` - Con tabs
- `src/features/monitoring/ui/observation-form.tsx`
- `src/features/monitoring/ui/health-summary.tsx`
- `src/features/monitoring/ui/clinical-alerts.tsx`

---

### Fase 4: Medicamentos (Semanas 4-5)

**Objetivo:** Modulo de medicamentos completo

| Tarea | Prioridad | Estimado | Dependencias |
|-------|-----------|----------|--------------|
| 4.1 Tabs internos (Inventario/Horarios/Historial) | Alta | 4h | - |
| 4.2 Formulario de nuevo medicamento | Alta | 5h | 1.1 |
| 4.3 Pantalla de detalle de medicamento | Alta | 4h | - |
| 4.4 Modal de actualizar stock | Media | 3h | - |
| 4.5 Formulario de horario | Alta | 5h | 1.1 |
| 4.6 Modal de registrar dosis | Alta | 4h | - |
| 4.7 Modal de saltar dosis | Media | 3h | - |
| 4.8 Pantalla de alertas stock bajo | Media | 3h | - |
| 4.9 Historial de dosis por medicamento | Media | 4h | - |

**Entregables:**
- `app/(family)/medication.tsx` - Con tabs
- `src/features/medication/ui/medication-form.tsx`
- `src/features/medication/ui/medication-detail.tsx`
- `src/features/medication/ui/schedule-form.tsx`
- `src/features/medication/ui/dose-registration.tsx`
- `src/features/medication/ui/low-stock-screen.tsx`

---

### Fase 5: Citas (Semana 6)

**Objetivo:** Modulo de citas mejorado

| Tarea | Prioridad | Estimado | Dependencias |
|-------|-----------|----------|--------------|
| 5.1 Filtros/Tabs (Todas/Familiares/Medicas) | Alta | 3h | - |
| 5.2 Pantalla de detalle de cita | Alta | 4h | - |
| 5.3 Mejorar formulario de agendar | Media | 3h | - |
| 5.4 Agregar date/time picker nativo | Media | 4h | - |
| 5.5 Confirmacion de cita agendada | Baja | 2h | - |

**Entregables:**
- `app/(family)/appointments.tsx` - Con filtros
- `app/(family)/appointments/[id].tsx` - Detalle
- `src/features/appointments/ui/appointment-form.tsx`
- `src/features/appointments/ui/appointment-detail.tsx`

---

### Fase 6: Comunicacion (Semanas 7-8)

**Objetivo:** Chat completo con doctores y cuidadores

| Tarea | Prioridad | Estimado | Dependencias |
|-------|-----------|----------|--------------|
| 6.1 Tabs Chat/Notificaciones | Alta | 3h | - |
| 6.2 Lista de conversaciones | Alta | 5h | 1.1 |
| 6.3 Pantalla de chat individual | Alta | 8h | - |
| 6.4 Enviar mensaje | Alta | 3h | - |
| 6.5 WebSocket para tiempo real | Media | 8h | 6.3 |
| 6.6 Notificaciones push | Media | 6h | - |
| 6.7 Marcar notificaciones como leidas | Media | 2h | - |

**Entregables:**
- `app/(family)/messages.tsx` - Con tabs
- `app/(family)/messages/chat/[userId].tsx` - Chat individual
- `src/features/communication/ui/conversation-list.tsx`
- `src/features/communication/ui/chat-screen.tsx`
- `src/features/communication/ui/notification-list.tsx`

---

### Fase 7: Reportes Premium (Semana 9)

**Objetivo:** Modulo de reportes con gating premium

| Tarea | Prioridad | Estimado | Dependencias |
|-------|-----------|----------|--------------|
| 7.1 Premium gating en pantallas | Alta | 4h | 1.2 |
| 7.2 Pantalla de detalle de reporte | Alta | 4h | - |
| 7.3 Descargar PDF | Alta | 5h | - |
| 7.4 Dashboard analytics | Media | 8h | 1.1 |
| 7.5 Compartir reporte | Baja | 3h | 7.3 |
| 7.6 Upgrade prompt | Media | 3h | 1.2 |

**Entregables:**
- `app/(family)/reports.tsx` - Con gating
- `app/(family)/reports/[id].tsx` - Detalle
- `app/(family)/analytics.tsx` - Dashboard
- `src/features/reports/ui/premium-gate.tsx`
- `src/features/reports/ui/report-detail.tsx`
- `src/features/reports/ui/analytics-dashboard.tsx`

---

### Fase 8: Perfil y Configuracion (Semana 10)

**Objetivo:** Configuracion completa con suscripciones

| Tarea | Prioridad | Estimado | Dependencias |
|-------|-----------|----------|--------------|
| 8.1 Equipo de cuidado | Alta | 4h | 1.1 |
| 8.2 Estado de suscripcion | Alta | 4h | 1.2 |
| 8.3 Historial de facturas | Media | 4h | - |
| 8.4 Boton de cerrar sesion | Media | 1h | - |
| 8.5 Configuracion de notificaciones | Baja | 3h | - |
| 8.6 Privacidad y terminos | Baja | 2h | - |

**Entregables:**
- `app/(family)/settings.tsx` - Mejorado
- `app/(family)/care-team.tsx` - Equipo de cuidado
- `app/(family)/subscription.tsx` - Suscripcion
- `app/(family)/invoices.tsx` - Facturas
- `src/features/profiles/ui/care-team.tsx`
- `src/features/payments/ui/subscription-status.tsx`

---

### Fase 9: Setup Inicial (Semana 11)

**Objetivo:** Flujo de onboarding completo

| Tarea | Prioridad | Estimado | Dependencias |
|-------|-----------|----------|--------------|
| 9.1 Stepper de 4 pasos | Alta | 6h | - |
| 9.2 Paso 1: Crear perfil familiar | Alta | 2h | Ya existe |
| 9.3 Paso 2: Registrar paciente | Alta | 2h | Ya existe |
| 9.4 Paso 3: Vincular familiar a paciente | Alta | 4h | 1.1 |
| 9.5 Paso 4: Asignar doctor | Alta | 2h | Ya existe |
| 9.6 Navegacion entre pasos | Media | 3h | - |
| 9.7 Validacion de setup completo | Media | 3h | - |

**Entregables:**
- `app/(auth)/setup/index.tsx` - Stepper principal
- `app/(auth)/setup/step-[n].tsx` - Pasos individuales
- `src/features/family/ui/setup-stepper.tsx`

---

### Fase 10: Polish y Optimizacion (Semana 12)

**Objetivo:** Mejoras finales y optimizacion

| Tarea | Prioridad | Estimado | Dependencias |
|-------|-----------|----------|--------------|
| 10.1 Animaciones y transiciones | Media | 6h | Todas |
| 10.2 Offline support basico | Media | 8h | - |
| 10.3 Cache de datos frecuentes | Media | 4h | - |
| 10.4 Optimizacion de imagenes | Baja | 3h | - |
| 10.5 Testing en dispositivos | Alta | 8h | Todas |
| 10.6 Fix de bugs | Alta | 8h | Todas |

**Entregables:**
- Animaciones con react-native-reanimated
- Cache con MMKV
- Testing en iOS y Android
- Bug fixes documentados

---

## Resumen de Esfuerzo

| Fase | Semanas | Horas Estimadas |
|------|---------|-----------------|
| Fase 1: Core Infrastructure | 1 | 19h |
| Fase 2: Dashboard Mejorado | 2 | 22h |
| Fase 3: Salud | 3 | 22h |
| Fase 4: Medicamentos | 4-5 | 36h |
| Fase 5: Citas | 6 | 16h |
| Fase 6: Comunicacion | 7-8 | 35h |
| Fase 7: Reportes Premium | 9 | 27h |
| Fase 8: Perfil y Config | 10 | 18h |
| Fase 9: Setup Inicial | 11 | 22h |
| Fase 10: Polish | 12 | 33h |
| **Total** | **12 semanas** | **250 horas** |

---

## Prioridades por Impacto

### Critico (Bloquea el uso)
1. Vincular familiar a paciente
2. Formulario de observacion de salud
3. Registrar/administrar dosis
4. Chat con doctores

### Alto (Mejora significativamente la UX)
1. Dashboard mejorado con cards
2. Selector de paciente
3. Premium gating
4. Horarios de medicacion

### Medio (Complementa la experiencia)
1. Graficos de tendencias
2. Descargar PDFs
3. Notificaciones push
4. Offline support

### Bajo (Nice to have)
1. Animaciones
2. Compartir reportes
3. Temas personalizados

---

## Consideraciones Tecnicas

### Navegacion
- Actual: Drawer navigation
- Propuesta: Bottom tabs + Drawer para secciones secundarias

### Estado Global
- Actual: Zustand para auth
- Propuesta: Zustand para cada feature (medication-store, monitoring-store, etc.)

### Componentes Reutilizables
- Crear componentes especificos:
  - `VitalSignsCard`
  - `MedicationCard`
  - `AppointmentCard`
  - `ChatBubble`
  - `NotificationCard`

### Testing
- Unit tests para hooks
- Integration tests para flujos criticos
- E2E tests para setup inicial

### Performance
- Lazy loading de pantallas
- Virtualizacion de listas largas
- Cache de respuestas API

---

## Dependencias Externas

| Dependencia | Estado | Observaciones |
|-------------|--------|---------------|
| API Backend | ⚠️ Problemas de comunicacion | Ver api-testing-results.md |
| Premium/Subscription | ❌ No implementado | Requiere validacion |
| WebSocket Chat | ❌ No probado | Requiere testing |
| PDF Generation | ❌ No probado | Requiere testing |

---

## Siguientes Pasos Inmediatos

1. **Resolver problemas de API** - Ver api-testing-results.md
2. **Crear tipos TypeScript** - Base para todo el desarrollo
3. **Implementar Premium gating** - Requerido para varias features
4. **Comenzar con Dashboard mejorado** - Impacto inmediato en UX

---

## Notas

- Este plan asume un desarrollador full-time
- Las estimaciones pueden variar segun complejidad real
- Se recomienda iterar por fases y validar con usuarios
- El backend tiene problemas de comunicacion que deben resolverse primero
