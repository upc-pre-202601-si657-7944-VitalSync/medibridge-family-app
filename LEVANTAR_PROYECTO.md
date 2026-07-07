# Guia para levantar MediBridge Family

## Que estaba pasando

El proyecto si compila con TypeScript desde la carpeta correcta:

```bash
npm run typecheck
```

Los errores rojos tipo `Cannot use JSX unless the '--jsx' flag is provided` venian del editor usando una configuracion incompleta de TypeScript al abrir la carpeta padre `medibridge-mobile`. Para evitarlo se dejo explicito `jsx: react-jsx` en `tsconfig.json` y se agregaron settings de VS Code para usar el TypeScript local del app.

Si VS Code sigue mostrando errores viejos despues de estos cambios:

1. Ejecuta `npm install` dentro de `medibridge-family-app`.
2. En VS Code abre la paleta de comandos.
3. Ejecuta `TypeScript: Select TypeScript Version`.
4. Elige `Use Workspace Version`.
5. Ejecuta `TypeScript: Restart TS Server`.

Tambien puedes abrir directamente la carpeta `medibridge-family-app` en VS Code.

## Requisitos

- Node.js `20.19.4+` o `22.13.0+`.
- npm.
- Expo Go en el celular, o Android Studio/Xcode si vas a usar emulador.

Verifica versiones:

```bash
node -v
npm -v
```

## Instalacion

Desde la raiz donde esta este archivo:

```bash
npm install
```

Si estas parado en `medibridge-mobile`, primero entra al app:

```bash
cd medibridge-family-app
npm install
```

## Variables de entorno

El cliente usa `EXPO_PUBLIC_API_BASE_URL` si existe. Hay un ejemplo en `.env.example`.

Para trabajar contra backend local, crea un archivo `.env.local`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Notas:

- Android emulator usa `10.0.2.2` por defecto cuando no defines la variable.
- iOS simulator y web usan `localhost` por defecto.
- En un celular fisico, usa la IP LAN de tu PC, por ejemplo `http://192.168.1.50:8080/api/v1`.
- En Docker local, el API Gateway debe estar publicado en `8080`.

## Chequeos

```bash
npm run typecheck
npm run doctor
npm run deps:check
```

O todo junto:

```bash
npm run check
```

## Levantar el proyecto

Modo normal:

```bash
npm run start
```

Con cache limpia:

```bash
npm run start:clear
```

Android:

```bash
npm run android
```

iOS:

```bash
npm run ios
```

Web:

```bash
npm run web
```

Al abrir `http://localhost:<puerto>` la ruta raiz redirige automaticamente a login, setup o dashboard segun el estado de sesion.

Si el puerto `8081` esta ocupado, usa otro puerto:

```bash
npm run start -- --port 8089
npm run web -- --port 8089
```

Si ya tienes Metro abierto en una terminal, no levantes otro Metro en otra terminal para Android. Usa esa misma terminal:

- Presiona `a` para abrir Android.
- Presiona `w` para abrir web.
- Escanea el QR con Expo Go para probar en celular.

## Probar en Android

`npm run android` necesita una de estas dos cosas:

- Un celular Android conectado por USB con depuracion USB activa.
- Un emulador creado y abierto desde Android Studio.

Si no hay celular ni emulador, Expo muestra:

```bash
No Android connected device found, and no emulators could be started automatically.
```

Eso no significa que el proyecto este roto. Significa que falta el dispositivo Android donde correrlo.

La forma mas rapida sin instalar Android Studio es:

1. Instala Expo Go en tu Android.
2. Conecta el celular a la misma red Wi-Fi que la PC.
3. Ejecuta `npm run start:clear`.
4. Escanea el QR que sale en la terminal.

Si el celular no logra conectarse al QR por red local, prueba tunnel:

```bash
npm run start:clear -- --tunnel
```

## Warnings comunes en web

Estos mensajes pueden aparecer en desarrollo y no bloquean el arranque:

- `Development-level warnings: ON`: normal en modo desarrollo.
- `Performance optimizations: OFF`: normal en modo desarrollo.
- `[Reanimated] Reduced motion setting is enabled`: tu sistema o navegador tiene reduccion de movimiento activa.
- `Download the React DevTools`: sugerencia opcional de React.

## Error de red al registrarse

Si aparece `Network Error` al hacer login o registro, revisa que el API Gateway este disponible:

```bash
docker ps
```

Debe aparecer algo como:

```bash
medibridge-api-gateway   0.0.0.0:8080->8080/tcp
```

Puedes probar el endpoint desde PowerShell:

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/authentication/sign-up" -Method Options
```

Si usas web, la app apunta por defecto a `http://localhost:8080/api/v1`. Si usas un celular fisico con Expo Go, crea `.env.local` con la IP de tu PC:

```bash
EXPO_PUBLIC_API_BASE_URL=http://TU_IP_LAN:8080/api/v1
```

Despues reinicia Expo para que tome la variable:

```bash
npm run start:clear
```

## Stripe Checkout en suscripciones

Los planes pagos no se activan al hacer click. La app crea una sesion de Stripe Checkout, abre la pasarela y solo activa la suscripcion cuando Stripe vuelve con `checkout=success` y `session_id`.

Para que Stripe vuelva a esta app web local, `payments-service` debe tener:

```bash
FRONTEND_APP_URL=http://localhost:8090
```

En el `docker-compose.yml` local ya quedo configurado el default `http://localhost:8090` para `payments-service`. Si levantas Expo en otro puerto, cambia `FRONTEND_APP_URL` en el backend y recrea Payments:

```powershell
cd C:\Users\Sebas\IdeaProjects\medibridge\medibridge.microservices\docker
docker compose up -d payments-service
```

Stripe debe volver a:

```text
http://localhost:8090/subscriptions?checkout=success&session_id=...
```

La ruta `/subscriptions` existe en esta app solo para recibir el retorno de Stripe y confirmar el pago. Si al volver desde Stripe la app te pide login, no pierdas el flujo: la app guarda el `session_id` pendiente, y despues de iniciar sesion vuelve a Suscripcion para confirmar el pago con backend.

Si luego de pagar no aparece el plan activo:

1. Vuelve a iniciar sesion con el mismo usuario que inicio Checkout.
2. Entra a `Suscripcion`.
3. Espera el mensaje `Confirmando pago de Stripe...`.
4. Si no aparece, revisa que Stripe haya vuelto a `/subscriptions` y no a la app web en `5173`.

## Estado validado

Se validaron estos comandos:

```bash
npm run check
npm run web -- --port 8090
```

`expo-doctor` paso 20/20 checks, las dependencias estan alineadas con Expo y el arranque web ya no falla por dependencias faltantes.
