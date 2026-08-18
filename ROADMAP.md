# WASAPEA.ME - Product Roadmap

## Fase 1: Lanzador Offline & Mini-Agenda Interna (Completado en MVP)
- [x] Lanzador directo a WhatsApp (`https://wa.me/51976898196?text=...`)
- [x] Integración opcional con WhatsApp Business
- [x] Acciones rápidas de Llamada (`tel:`) y SMS (`sms:`)
- [x] Parsing, validación y normalización internacional E.164 (`libphonenumber-js`)
- [x] Selector de país por prefijo (Perú +51 por defecto)
- [x] Detección inteligente de números en portapapeles y textos libres
- [x] Base de datos local persistente con SQLite (`expo-sqlite` + `drizzle-orm`)
- [x] Historial de interacciones con desduplicación por E.164 y estadísticas locales
- [x] Mini-agenda rápida local con categorías, notas y favoritos
- [x] Recordatorios locales programados (`expo-notifications`)
- [x] Generador de Código QR de WhatsApp
- [x] Exportación e Importación de respaldos (JSON y CSV)
- [x] Tema Claro/Oscuro y sistema de tokens de diseño

## Fase 2: Sincronización en la Nube con Supabase (Próximamente)
- [ ] Integración de `Supabase Auth` (Inicio de sesión con Google / Apple / Email)
- [ ] Motor de Sincronización Bidireccional (`SQLite ⇄ Supabase PostgreSQL`)
- [ ] Copia de seguridad y restauración automática al cambiar de dispositivo
- [ ] Soporte multi-dispositivo en tiempo real

## Fase 3: Monetización PRO (RevenueCat)
- [ ] Integración con `RevenueCat` para suscripciones Google Play & App Store
- [ ] Categorías e historial ilimitados en la nube
- [ ] Estadísticas avanzadas de actividad comercial
- [ ] Exportación avanzada a múltiples formatos

## Fase 4: Inteligencia de Contactos & OCR
- [ ] Escáner de números con cámara (OCR en tiempo real sobre carteles o tarjetas)
- [ ] Importación y exportación masiva en formato vCard (.vcf)
- [ ] Enlaces inteligentes y automatizaciones comunitarias
