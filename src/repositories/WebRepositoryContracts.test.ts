import { ContactRepository } from "./ContactRepository.web";
import { HistoryRepository } from "./HistoryRepository.web";
import { MessageTemplateRepository } from "./MessageTemplateRepository.web";
import { SavedAppointmentLocationRepository } from "./SavedAppointmentLocationRepository.web";

describe("web repository contracts", () => {
  beforeEach(async () => {
    await ContactRepository.clearAll();
    await HistoryRepository.clearAll();
    await MessageTemplateRepository.clearAll();
    await SavedAppointmentLocationRepository.clearAll();
  });

  test("saved appointment locations support defaults and updates", async () => {
    const office = await SavedAppointmentLocationRepository.create({
      name: "Oficina",
      address: "Av. Central 123",
      isDefault: true
    });
    const virtual = await SavedAppointmentLocationRepository.create({
      name: "Meet",
      mapUrl: "https://meet.google.com/example",
      kind: "virtual",
      isDefault: true
    });

    const afterCreate = await SavedAppointmentLocationRepository.getAll();
    expect(afterCreate.find((item) => item.id === office.id)?.isDefault).toBe(0);
    expect(afterCreate[0]).toMatchObject({ id: virtual.id, kind: "virtual", isDefault: 1 });

    await SavedAppointmentLocationRepository.update(office.id, { address: "Av. Central 456" });
    expect((await SavedAppointmentLocationRepository.getAll()).find((item) => item.id === office.id)?.address)
      .toBe("Av. Central 456");
  });

  test("creates, updates and prevents duplicate E.164 contacts", async () => {
    const created = await ContactRepository.create({
      phoneE164: "+51953385003",
      phoneFormatted: "+51 953 385 003",
      countryCode: "+51",
      countryIso: "PE",
      name: "Cliente"
    });
    const updated = await ContactRepository.update(created.id, { name: "Cliente actualizado", favorite: true });

    expect(updated?.name).toBe("Cliente actualizado");
    expect(updated?.favorite).toBe(1);
    await expect(
      ContactRepository.create({
        phoneE164: "+51953385003",
        phoneFormatted: "+51 953 385 003",
        countryCode: "+51",
        countryIso: "PE",
        name: "Duplicado"
      })
    ).rejects.toThrow("Ya existe");
  });

  test("aggregates history actions using the shared contract", async () => {
    await HistoryRepository.logAction({
      phoneE164: "+51953385003",
      phoneFormatted: "+51 953 385 003",
      countryCode: "+51",
      countryIso: "PE",
      actionType: "whatsapp"
    });
    await HistoryRepository.logAction({
      phoneE164: "+51953385003",
      phoneFormatted: "+51 953 385 003",
      countryCode: "+51",
      countryIso: "PE",
      actionType: "call"
    });

    const rows = await HistoryRepository.getAll();
    const stats = await HistoryRepository.getStats();
    expect(rows[0].interactionCount).toBe(2);
    expect(stats.totalWhatsapp).toBe(1);
    expect(stats.totalCalls).toBe(1);
    expect(await HistoryRepository.getAllActions()).toHaveLength(2);
  });

  test("creates and manages reusable message templates", async () => {
    const created = await MessageTemplateRepository.create({
      title: "Pedido listo",
      content: "Hola, tu pedido ya está listo para recoger.",
      category: "sales",
      color: "#3B82F6"
    });

    await MessageTemplateRepository.toggleFavorite(created.id);
    await MessageTemplateRepository.recordUse(created.id);
    await MessageTemplateRepository.update(created.id, { title: "Pedido preparado" });

    const updated = (await MessageTemplateRepository.getAll()).find((item) => item.id === created.id);
    expect(updated).toMatchObject({ title: "Pedido preparado", favorite: 1, useCount: 1 });
    expect(updated?.lastUsedAt).not.toBeNull();

    await MessageTemplateRepository.delete(created.id);
    expect((await MessageTemplateRepository.getAll()).some((item) => item.id === created.id)).toBe(false);
  });
});
