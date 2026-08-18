import type { MessageTemplateCategory, MessageTemplateItem } from "../domain/models";

export const MESSAGE_TEMPLATE_CATEGORIES: {
  id: MessageTemplateCategory;
  label: string;
  color: string;
}[] = [
  { id: "general", label: "General", color: "#10B981" },
  { id: "sales", label: "Ventas", color: "#3B82F6" },
  { id: "payments", label: "Cobros", color: "#F59E0B" },
  { id: "appointments", label: "Citas", color: "#8B5CF6" },
  { id: "thanks", label: "Gracias", color: "#EC4899" }
];

const createdAt = "2026-01-01T00:00:00.000Z";
export const LOCATION_MESSAGE_TEMPLATE_ID = "msg-template-location";
export const HOME_APPOINTMENT_TEMPLATE_ID = "msg-template-appointment-pro";
export const APPOINTMENT_MESSAGE_TEMPLATE_IDS = [
  "msg-template-appointment",
  HOME_APPOINTMENT_TEMPLATE_ID
] as const;

export function isAppointmentMessageTemplate(templateId: string): boolean {
  return APPOINTMENT_MESSAGE_TEMPLATE_IDS.includes(
    templateId as (typeof APPOINTMENT_MESSAGE_TEMPLATE_IDS)[number]
  );
}

export const DEFAULT_MESSAGE_TEMPLATES: MessageTemplateItem[] = [
  {
    id: "msg-template-greeting",
    title: "Saludo",
    content: "Hola 👋\n\nEspero que estés muy bien.",
    category: "general",
    color: "#10B981",
    isDefault: 1,
    favorite: 0,
    useCount: 0,
    lastUsedAt: null,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: "msg-template-quote",
    title: "Solicitar cotización",
    content: "Hola 👋\n\nQuisiera solicitar una cotización. ¿Podrías enviarme información sobre precios y disponibilidad?",
    category: "sales",
    color: "#3B82F6",
    isDefault: 1,
    favorite: 0,
    useCount: 0,
    lastUsedAt: null,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: "msg-template-proforma-catalog",
    title: "Proforma & Catálogo de Productos",
    content: "*📋 CATÁLOGO Y PROFORMA DE PRODUCTOS*\n\nHola 👋 Gracias por tu interés. Te compartimos la lista de productos y precios disponibles:\n\n*🚜 MAQUINARIA Y EQUIPOS DISPONIBLES:*\n\n1. 🟡 *EXCAVADORA HIDRÁULICA CAT 320D*\n   - 💰 *Precio:* S/ 85,000.00\n   - ⚙️ *Estado:* Disponible para entrega inmediata / cotización\n\n2. 🚜 *CARGADOR FRONTAL 950H*\n   - 💰 *Precio:* S/ 45,000.00\n   - ⚙️ *Estado:* Disponible para entrega inmediata / cotización\n\n---\n*💡 ¿Deseas solicitar una proforma formal en PDF o ficha técnica?*\nEscríbenos el nombre del equipo o responde *PROFORMA* para enviarte la documentación completa.\n\n_Atención personalizada e inmediata._ 🤝",
    category: "sales",
    color: "#3B82F6",
    isDefault: 1,
    favorite: 1,
    useCount: 0,
    lastUsedAt: null,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: "msg-template-appointment",
    title: "Confirmar cita",
    content: "Hola 👋\n\nTe escribo para confirmar nuestra cita. ¿Me confirmas si el horario sigue disponible?",
    category: "appointments",
    color: "#8B5CF6",
    isDefault: 1,
    favorite: 0,
    useCount: 0,
    lastUsedAt: null,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: "msg-template-appointment-pro",
    title: "Confirmación de cita profesional",
    content: "*📅 CONFIRMACIÓN DE CITA*\n\nHola *[Nombre]* 👋\n\nTu cita ha sido registrada correctamente.\n\n*Detalles de la cita*\n- 📆 *Fecha:* [Día y fecha]\n- 🕐 *Hora:* [Hora]\n- 📍 *Lugar:* [Dirección o enlace]\n- 👤 *Atención:* [Servicio o profesional]\n\n> Responde *CONFIRMO* para reservar tu horario.\n\n*Antes de tu cita*\n1. Llega 10 minutos antes.\n2. Lleva la información necesaria.\n3. Si deseas reprogramar, avísanos con anticipación.\n\n_Tu tiempo es importante para nosotros._\n*¡Te esperamos!* ✅",
    category: "general",
    color: "#10B981",
    isDefault: 1,
    favorite: 0,
    useCount: 0,
    lastUsedAt: null,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: "msg-template-payment",
    title: "Recordatorio de pago",
    content: "Hola 👋\n\nTe enviamos un recordatorio amable sobre el pago pendiente. Quedamos atentos a tu confirmación.",
    category: "payments",
    color: "#F59E0B",
    isDefault: 1,
    favorite: 0,
    useCount: 0,
    lastUsedAt: null,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: LOCATION_MESSAGE_TEMPLATE_ID,
    title: "Compartir ubicación",
    content: "Hola 👋\n\nTe comparto la ubicación para que puedas llegar fácilmente:\n",
    category: "general",
    color: "#10B981",
    isDefault: 1,
    favorite: 0,
    useCount: 0,
    lastUsedAt: null,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: "msg-template-promotion",
    title: "Promoción",
    content: "¡Hola! 👋\n\nTenemos una promoción especial para ti por tiempo limitado. Escríbenos para conocer todos los detalles.",
    category: "sales",
    color: "#3B82F6",
    isDefault: 1,
    favorite: 0,
    useCount: 0,
    lastUsedAt: null,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: "msg-template-thanks",
    title: "Agradecimiento",
    content: "¡Muchas gracias por comunicarte con nosotros! 🙌\n\nFue un gusto atenderte. Estamos disponibles cuando nos necesites.",
    category: "thanks",
    color: "#EC4899",
    isDefault: 1,
    favorite: 0,
    useCount: 0,
    lastUsedAt: null,
    createdAt,
    updatedAt: createdAt
  },
  {
    id: "msg-template-happy-birthday",
    title: "Feliz cumpleaños",
    content: "*🎉 ¡FELIZ CUMPLEAÑOS, [Nombre]! 🎂*\n\nHoy celebramos un día muy especial: *el día en que llegaste al mundo*. ✨\n\n> Que este nuevo año de vida venga lleno de momentos inolvidables, nuevas oportunidades y muchísima felicidad.\n\n*Mis mejores deseos para ti:*\n- 💚 Salud para disfrutar cada momento.\n- 🌟 Éxitos en todos tus proyectos.\n- 😊 Motivos de sobra para sonreír.\n- 🎁 Muchas sorpresas bonitas.\n\n_Disfruta mucho tu día, celébralo a lo grande y nunca dejes de cumplir tus sueños._\n\n*¡Que tengas un cumpleaños maravilloso!* 🥳🎈\n\n_Con mucho cariño,_\n*[Tu nombre]*",
    category: "general",
    color: "#10B981",
    isDefault: 1,
    favorite: 0,
    useCount: 0,
    lastUsedAt: null,
    createdAt,
    updatedAt: createdAt
  }
];

export function getMessageTemplateCategory(category: MessageTemplateCategory) {
  return MESSAGE_TEMPLATE_CATEGORIES.find((item) => item.id === category) ?? MESSAGE_TEMPLATE_CATEGORIES[0];
}
