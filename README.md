# ⚡ WASAPEA.ME — Lanzador Inteligente, Ubicación & Gestor de Contactos Directo

<div align="center">

![Wasapea.me Logo](https://img.shields.io/badge/WASAPEA.ME-v1.3.3-00E676?style=for-the-badge&logo=whatsapp&logoColor=white)
![Expo SDK](https://img.shields.io/badge/Expo_SDK-57.0-4630EB?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Drizzle_ORM-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge)

<p align="center">
  <b>La experiencia definitiva para comunicarse por WhatsApp al instante sin guardar números en tu agenda nativa.</b><br/>
  Ubicación GPS en tiempo real, navegación por gestos, plantillas de mensajes, tarjetas QR Skia y arquitectura lista para la nube.
</p>

---

</div>

## 🌟 ¿Qué es WASAPEA.ME?

**WASAPEA.ME** es una aplicación móvil nativa construida con **React Native (SDK 57) + Expo Router**, diseñada para romper la barrera de agregar números desconocidos a tu lista de contactos personales antes de enviar un mensaje de WhatsApp.

Con una interfaz ultramoderna, soporte para gestos táctiles, transmisión de ubicación GPS en tiempo real y una agenda local privada basada en **SQLite + Drizzle ORM**, **WASAPEA.ME** ofrece la solución más rápida, segura y elegante para usuarios personales, negocios y profesionales.

---

## 🔥 Funcionalidades Destacadas

### 💬 1. Marcado Directo y Normalización Internacional Inteligente
- **Envío Instantáneo a WhatsApp:** Abre conversaciones en 2 toques sin guardar el número en la libreta del teléfono.
- **Soporte Dual:** Compatible con WhatsApp Estándar (`com.whatsapp`) y WhatsApp Business (`com.whatsapp.w4b`).
- **Normalización E.164 Avanzada:** Potenciado por `libphonenumber-js` para interpretar correctamente formatos como `976898196`, `+51 976 898 196`, `51976898196` o `0051 976898196`.
- **Selector Internacional de Países:** Búsqueda rápida por país, bandera y código de marcación (Perú `+51` por defecto).
- **Acciones Rápidas Integradas:** Accesos de un solo toque para **Llamada Directa (`tel:`)** y **SMS (`sms:`)**.
- **Detección Automática de Portapapeles:** Detecta automáticamente números copiados al abrir la aplicación.

### 📍 2. Compartir Ubicación GPS y Transmisión en Tiempo Real (Live Location)
- **Ubicación GPS Puntual:** Genera un enlace geolocalizado directo de Google Maps y lo abre en WhatsApp en un toque.
- **Transmisión en Vivo (Live Location Session):** Comparte un enlace privado de seguimiento GPS durante 1 hora.
- **Notificación Nativa de Servicio Activo:** Controla la transmisión en vivo desde la barra de estado de Android e iOS con botón para detener en cualquier momento.
- **Privacidad Volátil:** Los datos de ubicación en tiempo real se almacenan únicamente en memoria RAM y se eliminan al finalizar o expirar la sesión.

### ⚡ 3. Modo Gestos (Gesture Navigation) y Experiencia Ultra-Fluida
- **Navegación por Deslizamiento (Fling Gesture):** Desliza horizontalmente la pantalla para alternar al instante entre la pestaña de **Contactos Frecuentes** y **Plantillas de Mensajes**.
- **Barra de Estado Animada ("Story Bar"):** Indicador visual superior ultradelgado que responde dinámicamente al cambio de sección.
- **Respuesta Háptica y Micro-Animaciones:** Integración con `expo-haptics`, `react-native-reanimated 4` y componentes dinámicos `ScalePressable` para retroalimentación táctil inmediata.

### 📝 4. Plantillas de Mensaje y Creador Interactivo de Citas
- **Biblioteca de Plantillas Rápidas:** Mensajes predefinidos (Saludos, Cotizaciones, Información de Pagos, Soporte) con envío directo.
- **Generador de Citas y Reuniones:** Formulario especializado para programar reuniones con fecha, hora, dirección e inclusión de ubicación interactiva mediante Google Maps y Waze.

### 👑 5. Modo VIP Actual & Próximo Modo PRO
- **Membresía VIP Actual:** Activación mediante clave o código promocional, desbloqueando la insignia dorada VIP y temas visuales exclusivos.
- **Próximamente en WASAPEA.ME PRO:**
  - ☁️ **Sincronización Bidireccional en la Nube:** Integración con `SQLite ⇄ Supabase PostgreSQL`.
  - 📱 **Multi-Dispositivo:** Acceso sincronizado desde smartphones, tablets y cliente Web.
  - 🔄 **Copia de Seguridad Automática:** Restauración instantánea tras cambio de equipo.
  - 📷 **Escáner OCR e Inteligencia Artificial:** Detección de números desde fotos de carteles, volantes o tarjetas físicas.
  - 🛡️ **Encriptación de Extremo a Extremo (E2E).**

### 📇 6. Mini-Agenda Interna, Tarjetas QR y Respaldos
- **Base de Datos Local SQLite:** Guarda contactos temporales, notas, categorías personalizadas y favoritos sin infectar la agenda del dispositivo.
- **Generador de Tarjetas QR Skia:** Tarjetas de presentación QR diseñadas con `@shopify/react-native-skia` y SVG, listas para guardar en la galería o compartir.
- **Contactos Confiables (SOS):** Configuración de lista de contactos prioritarios para envío rápido de alertas o ubicación.
- **Respaldos Portables:** Exportación e importación completa de la base de datos en formato **JSON** y **CSV** con validación de esquema.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología / Módulo |
| :--- | :--- |
| **Core Framework** | React Native (v0.86) + Expo (SDK 57) |
| **Navegación** | Expo Router v3 (Basado en archivos) |
| **Base de Datos Local** | SQLite mediante `expo-sqlite` |
| **ORM Local** | Drizzle ORM (`drizzle-orm` + `drizzle-kit`) |
| **Gestión de Estado Global** | Zustand (`zustand`) |
| **Gestos y Animaciones** | `react-native-gesture-handler` + `react-native-reanimated 4` |
| **Gráficos y Tarjetas QR** | `@shopify/react-native-skia` + `react-native-qrcode-svg` |
| **Parsing Telefónico** | `libphonenumber-js` |
| **Servicios Nativos Expo** | `expo-location`, `expo-contacts`, `expo-clipboard`, `expo-notifications`, `expo-sharing`, `expo-secure-store`, `expo-haptics` |
| **Testing & Calidad** | Jest (`jest-expo`) + TypeScript 5 |

---

## 🏗️ Arquitectura del Proyecto

```
wasapeame/
├── assets/                     # Iconos, Splash screens y recursos gráficos
├── scripts/                    # Scripts de desarrollo y reinicio
├── src/
│   ├── app/                    # Rutas de Expo Router (Tabs, Modales y Subpantallas)
│   │   ├── (tabs)/
│   │   │   ├── index.tsx       # Pantalla Principal: Lanzador Hero, Portapapeles & Gestos
│   │   │   ├── history.tsx     # Historial de llamadas y mensajes con filtros
│   │   │   ├── agenda/         # Mini-agenda interna SQLite (Lista y categorías)
│   │   │   ├── settings.tsx    # Ajustes de apariencia, respaldos y contactos confiables
│   │   │   └── share.tsx       # Generador de Tarjeta QR Skia
│   │   ├── agenda/[id].tsx     # Vista en detalle de contacto interno
│   │   ├── pro.tsx             # Pantalla de Lanzamiento WASAPEA.ME Pro
│   │   └── _layout.tsx         # Layout Raíz, ThemeProvider y ToastHost
│   ├── components/             # Componentes UI Reutilizables
│   │   ├── home/               # Composer, Header, Gestos & Accesos Rápidos
│   │   ├── messages/           # Modal de Ubicación, Citas & Plantillas
│   │   ├── settings/           # Preferencias, Respaldos y Contactos Confiables
│   │   ├── agenda/             # Formularios y tarjetas de agenda
│   │   ├── VipBenefitsModal.tsx# Modal de Membresía VIP y código promo
│   │   └── PremiumSkiaQrCode.tsx# Generador QR de alto rendimiento Skia
│   ├── constants/              # Países, formatos E.164 y plantillas predefinidas
│   ├── database/               # Esquema de tablas Drizzle (`schema.ts`) & `expo-sqlite`
│   ├── domain/                 # Modelos de datos e interfaces tipadas
│   ├── repositories/           # Patrón Repository para SQLite (Contact, History, Category, Reminder)
│   ├── services/
│   │   ├── PhoneService.ts     # Parsing y normalización de números
│   │   ├── CommunicationService.ts # Integración con WhatsApp, Call, SMS y Contactos
│   │   ├── LiveLocationService.ts  # Servicio de transmisión GPS en segundo plano
│   │   ├── LocationShareService.ts # Generación de enlaces de Google Maps
│   │   ├── NotificationService.ts  # Recordatorios nativos locales
│   │   ├── ExportImportService.ts  # Exportación e importación JSON/CSV
│   │   └── VipAccessService.ts # Autenticación y verificación de clave VIP
│   ├── store/                  # Store de Zustand (`useAppStore.ts`)
│   └── theme/                  # Tokens de diseño, tipografía y paleta Claro/Oscuro
├── app.json                    # Configuración de permisos iOS/Android y EAS
├── eas.json                    # Perfiles de build EAS (Development, Preview, Production)
├── drizzle.config.ts           # Configuración de migraciones Drizzle
├── package.json
└── README.md
```

---

## 🚀 Instalación y Ejecución Local

### 1. Prerrequisitos
- **Node.js:** v18.0.0 o superior
- **npm:** v9.0.0 o superior
- **Emulador / Dispositivo:** Android Studio (Emulador Android) o Xcode (Simulador iOS en macOS) / Aplicación Expo Go o Build Dev Client.

### 2. Instalación de Dependencias
```bash
git clone https://github.com/joelchino/wasapeame.git
cd wasapeame
npm install
```

### 3. Ejecutar en Modo Desarrollo
```bash
# Iniciar el servidor de desarrollo de Expo
npx expo start

# Ejecutar directamente en Android
npm run android

# Ejecutar directamente en iOS (Requiere macOS)
npm run ios
```

---

## 📦 Construcción y Compilación con EAS Build

El proyecto cuenta con perfiles configurados en `eas.json` para **Expo Application Services (EAS)**:

```bash
# Compilar binario para iPhone (iOS)
npx eas-cli build --platform ios --profile preview

# Compilar APK/AAB para Android
npx eas-cli build --platform android --profile preview

# Compilar versión final para tiendas (App Store / Google Play)
npx eas-cli build --platform all --profile production
```

---

## 🧪 Pruebas Unitarias y Calidad de Código

El proyecto incluye una suite completa de pruebas unitarias para validar el parsing de números telefónicos, servicios de ubicación y lógica de negocio:

```bash
# Ejecutar suite de pruebas unitarias con Jest
npm test

# Verificación de tipos en TypeScript (sin emitir código)
npm run typecheck

# Verificación del linter de código
npm run lint
```

---

## 🔒 Privacidad & Filosofía Zero-Tracking

* **100% Offline-First:** Tus contactos, notas e historial permanecen exclusivamente en la base de datos local SQLite de tu dispositivo.
* **Sin Rastreadores:** No se envían datos a servidores de terceros ni se recolecta información de uso.
* **Transmisión de Ubicación Privada:** La función de geolocalización en tiempo real se mantiene estrictamente durante la sesión activa y se destruye al finalizar.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para obtener más detalles.

<div align="center">
  <sub>Desarrollado con ❤️ por <b>Joel Chino</b> para simplificar la comunicación diaria en WhatsApp.</sub>
</div>
