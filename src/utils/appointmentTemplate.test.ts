import type { MessageTemplateItem } from "../domain/models";
import { buildAppointmentTemplateMessage } from "./appointmentTemplate";

const template: MessageTemplateItem = {
  id: "msg-template-appointment-pro",
  title: "Confirmar cita",
  content: "Hola *[Nombre]*. Fecha: [Día y fecha], hora: [Hora], lugar: [Dirección o enlace], servicio: [Servicio o profesional].",
  category: "appointments",
  color: "#10B981",
  isDefault: 1,
  favorite: 0,
  useCount: 0,
  lastUsedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

describe("buildAppointmentTemplateMessage", () => {
  it("replaces every appointment field", () => {
    expect(buildAppointmentTemplateMessage(template, {
      name: "Ana",
      date: "15 de agosto",
      time: "3:30 p. m.",
      address: "Av. Central 123",
      service: "Consulta"
    })).toBe("Hola *Ana*. Fecha: 15 de agosto, hora: 3:30 p. m., lugar: Av. Central 123, servicio: Consulta.");
  });

  it("replaces repeated fields without requiring String.replaceAll", () => {
    expect(buildAppointmentTemplateMessage(
      { ...template, content: "[Nombre] / [Nombre] / [Hora]" },
      {
        name: "Ana",
        date: "15 de agosto",
        time: "3:30 p. m.",
        address: "Av. Central 123"
      }
    )).toBe("Ana / Ana / 3:30 p. m.");
  });

  it("requires the essential fields", () => {
    expect(() => buildAppointmentTemplateMessage(template, {
      name: "",
      date: "15 de agosto",
      time: "3:30 p. m.",
      address: "Av. Central 123"
    })).toThrow("Completa nombre, fecha, hora y dirección.");
  });
});
