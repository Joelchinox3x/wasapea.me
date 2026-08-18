import { ContactRepository } from "../repositories/ContactRepository";
import { HistoryRepository } from "../repositories/HistoryRepository";

export async function seedDevData(): Promise<void> {
  if (!__DEV__) return;

  try {
    const existingContacts = await ContactRepository.getAll();
    if (existingContacts.length > 0) return;

    // Seed dummy contacts
    await ContactRepository.create({
      phoneE164: "+51976898196",
      phoneFormatted: "+51 976 898 196",
      countryCode: "+51",
      countryIso: "PE",
      name: "Juan Pérez (Cliente VIP)",
      company: "Logística Perú S.A.",
      note: "Cliente preferente. Llamar por las mañanas.",
      favorite: true
    });

    await ContactRepository.create({
      phoneE164: "+51987654321",
      phoneFormatted: "+51 987 654 321",
      countryCode: "+51",
      countryIso: "PE",
      name: "María García",
      company: "Tech Solutions",
      note: "Proveedor de licencias de software."
    });

    // Seed dummy history
    await HistoryRepository.logAction({
      phoneE164: "+51976898196",
      phoneFormatted: "+51 976 898 196",
      countryCode: "+51",
      countryIso: "PE",
      actionType: "whatsapp",
      name: "Juan Pérez"
    });

    await HistoryRepository.logAction({
      phoneE164: "+51987654321",
      phoneFormatted: "+51 987 654 321",
      countryCode: "+51",
      countryIso: "PE",
      actionType: "call",
      name: "María García"
    });
  } catch {
    /* ignore dev seed errors */
  }
}
