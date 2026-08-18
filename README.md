# ⚡ WASAPEA.ME - Lanzador y Gestor de Contactos Directo

**WASAPEA.ME** es una aplicación móvil nativa construida en **React Native + Expo**, diseñada para interactuar instantáneamente con números telefónicos internacionales sin necesidad de guardarlos previamente en la agenda de contactos del dispositivo.

---

## 🎯 Filosofía del Producto

* **Instantánea:** Abre WhatsApp, llamadas o SMS en 2 toques.
* **Offline-First:** Funciona al 100% de manera local sin conexión a Internet ni registros obligatorios.
* **Agenda Rápida Interna:** Guarda contactos temporales, clientes, notas y recordatorios en una base de datos local SQLite sin contaminar la libreta nativa de tu teléfono.
* **Normalización Internacional:** Basado en `libphonenumber-js` para interpretar correctamente formatos como `976898196`, `+51 976 898 196`, `51976898196` o `0051 976898196`.

---

## 🛠️ Stack Tecnológico

* **Framework:** React Native (SDK 57) + Expo
* **Navegación:** Expo Router v3 (Basado en archivos)
* **Base de Datos Local:** SQLite mediante `expo-sqlite`
* **ORM:** Drizzle ORM (`drizzle-orm` + `drizzle-kit`)
* **Estado Global:** Zustand
* **Parsing Telefónico:** `libphonenumber-js`
* **Módulos Nativos:** `expo-contacts`, `expo-clipboard`, `expo-notifications`, `expo-sharing`, `expo-secure-store`
* **QR Codes:** `react-native-qrcode-svg`
* **Pruebas:** Jest (`jest-expo`)

---

## 🚀 Requisitos e Instalación

### 1. Prerrequisitos
* Node.js v18+ y npm
* Dispositivo físico o emulador Android (Android Studio) / iOS Simulator (Xcode en macOS)

### 2. Instalación de Dependencias
```bash
cd wasapeame
npm install
```

### 3. Ejecutar en Desarrollo
```bash
# Iniciar servidor de desarrollo de Expo
npx expo start

# Ejecutar directamente en Android
npm run android

# Ejecutar directamente en iOS (requiere Mac)
npm run ios
```

---

## 🧪 Pruebas Unitarias y Calidad de Código

Para verificar la lógica de parsing telefónico, normalización E.164 y validaciones:

```bash
# Ejecutar pruebas unitarias de Jest
npm test

# Verificación de tipos TypeScript sin emitir
npm run typecheck

# Verificación de linter
npm run lint
```

---

## 🏗️ Arquitectura del Proyecto

```
wasapeame/
├── src/
│   ├── app/                      # Rutas de Expo Router (Tabs & Modales)
│   │   ├── (tabs)/
│   │   │   ├── index.tsx         # Pantalla 1: Inicio (Buscador/Lanzador Hero)
│   │   │   ├── history.tsx       # Pantalla 2: Historial de interacciones
│   │   │   ├── agenda/index.tsx  # Pantalla 3: Agenda interna
│   │   │   └── settings.tsx      # Pantalla 4: Ajustes y Respaldos
│   │   ├── agenda/[id].tsx       # Detalle de contacto interno
│   │   ├── agenda/create.tsx     # Formulario de creación de contacto
│   │   ├── agenda/edit/[id].tsx  # Formulario de edición
│   │   ├── pro.tsx               # Pantalla WASAPEA.ME Pro ("Próximamente")
│   │   └── _layout.tsx           # Layout raíz y ThemeProvider
│   ├── components/               # Componentes UI reutilizables
│   ├── constants/
│   │   └── app.ts                # Nombre centralizado "WASAPEA.ME" y países
│   ├── database/
│   │   ├── schema.ts             # Esquema de tablas de Drizzle SQLite
│   │   └── db.ts                 # Inicialización de expo-sqlite
│   ├── repositories/             # Capa Repository (Preparada para Supabase)
│   │   ├── ContactRepository.ts
│   │   ├── HistoryRepository.ts
│   │   ├── CategoryRepository.ts
│   │   └── ReminderRepository.ts
│   ├── services/
│   │   ├── PhoneService.ts       # Normalización y parsing libphonenumber
│   │   ├── CommunicationService.ts # Linking WhatsApp, Call, SMS, Share, Contacts
│   │   ├── NotificationService.ts  # Recordatorios locales expo-notifications
│   │   └── ExportImportService.ts  # Exportación e importación JSON/CSV
│   ├── store/
│   │   └── useAppStore.ts        # Zustand Store (Tema, Filtros, Borradores)
│   └── theme/
│       └── colors.ts             # Tokens de color Claro/Oscuro
├── drizzle.config.ts             # Configuración de Drizzle Kit
├── app.json                      # Configuración de Expo y Permisos
├── package.json
└── README.md
```

---

## 🔒 Privacidad y Preparación Cloud (Supabase)

Toda la arquitectura ha sido diseñada utilizando el **Patrón Repository** con claves primarias **UUID** y campos de timestamp (`createdAt`, `updatedAt`, `archivedAt`). Esto garantiza que en fases posteriores pueda conectarse un motor de sincronización (`SQLite ⇄ Supabase PostgreSQL`) sin reestructurar los componentes de la aplicación.
