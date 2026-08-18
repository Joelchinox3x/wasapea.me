import type { MessageTemplateItem } from "../domain/models";

export interface AppointmentTemplateValues {
  name: string;
  date: string;
  time: string;
  address: string;
  service?: string;
  professional?: string;
}

function replaceToken(source: string, token: string, value: string): string {
  return source.split(token).join(value);
}

export function buildAppointmentTemplateMessage(
  template: MessageTemplateItem,
  values: AppointmentTemplateValues
): string {
  const name = values.name.trim();
  const date = values.date.trim();
  const time = values.time.trim();
  const address = values.address.trim();
  const service = values.service?.trim() || "Cita programada";
  const professional = values.professional?.trim();
  const attention = professional ? `${service} · ${professional}` : service;

  if (!name || !date || !time || !address) {
    throw new Error("Completa nombre, fecha, hora y dirección.");
  }

  if (template.content.includes("[Nombre]")) {
    const withName = replaceToken(template.content, "[Nombre]", name);
    const withDate = replaceToken(withName, "[Día y fecha]", date);
    const withTime = replaceToken(withDate, "[Hora]", time);
    const withAddress = replaceToken(withTime, "[Dirección o enlace]", address);
    return replaceToken(withAddress, "[Servicio o profesional]", attention);
  }

  return `*📅 CONFIRMACIÓN DE CITA*\n\nHola *${name}* 👋\n\nTu cita quedó programada correctamente.\n\n*Detalles de la cita*\n- 📆 *Fecha:* ${date}\n- 🕐 *Hora:* ${time}\n- 📍 *Lugar:* ${address}\n- 👤 *Atención:* ${attention}\n\n> Responde *CONFIRMO* para reservar tu horario.\n\n_¡Te esperamos!_ ✅`;
}
