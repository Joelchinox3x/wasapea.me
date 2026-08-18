import * as Clipboard from "expo-clipboard";
import * as Contacts from "expo-contacts/legacy";
import { Linking, Platform, Share as NativeShare } from "react-native";
import { APP_NAME } from "../constants/app";
import { PhoneService } from "./PhoneService";

export interface CommunicationActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ImportedDeviceContact {
  name: string;
  phoneE164: string;
  phoneFormatted: string;
  company?: string;
}

export interface ContactSelectionResult {
  contact: ImportedDeviceContact | null;
  error?: string;
}

export interface DeviceContactExportItem {
  name: string;
  phoneE164: string;
  company?: string;
}

export interface DeviceContactExportResult {
  exportedCount: number;
  skippedCount: number;
  failedCount: number;
  error?: string;
}

export interface DevicePhoneNumbersResult {
  phoneNumbers: string[];
  error?: string;
}

export class CommunicationService {
  /**
   * Opens WhatsApp with an optional prefilled message.
   */
  static async openWhatsApp(e164: string, message?: string): Promise<CommunicationActionResult> {
    try {
      const url = PhoneService.buildWhatsAppUrl(e164, message);
      if (!url) return { success: false, error: "Número E.164 no válido." };

      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen && Platform.OS !== "android") {
        return { success: false, error: "WhatsApp no parece estar instalado en este dispositivo." };
      }

      await Linking.openURL(url);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "No se pudo abrir WhatsApp."
      };
    }
  }

  /**
   * Opens WhatsApp without a fixed recipient so the user can choose a contact or group.
   */
  static async openWhatsAppShare(message: string): Promise<CommunicationActionResult> {
    try {
      const url = PhoneService.buildWhatsAppShareUrl(message);
      if (!url) return { success: false, error: "Escribe un mensaje antes de abrir WhatsApp." };

      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen && Platform.OS !== "android") {
        return { success: false, error: "WhatsApp no parece estar instalado en este dispositivo." };
      }

      await Linking.openURL(url);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "No se pudo abrir WhatsApp."
      };
    }
  }

  /**
   * Tries to open WhatsApp Business, falling back gracefully to standard WhatsApp.
   */
  static async openWhatsAppBusiness(e164: string, message?: string): Promise<CommunicationActionResult> {
    try {
      const businessUrl = PhoneService.buildWhatsAppBusinessUrl(e164, message);
      const canOpenBusiness = await Linking.canOpenURL(businessUrl);

      if (canOpenBusiness) {
        await Linking.openURL(businessUrl);
        return { success: true };
      }

      // Fallback to standard WhatsApp
      return await this.openWhatsApp(e164, message);
    } catch {
      return await this.openWhatsApp(e164, message);
    }
  }

  /**
   * Initiates a phone call.
   */
  static async makeCall(e164: string): Promise<CommunicationActionResult> {
    try {
      const url = PhoneService.buildCallUrl(e164);
      if (!url) return { success: false, error: "Número no válido para llamadas." };

      await Linking.openURL(url);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "No se pudo iniciar la llamada."
      };
    }
  }

  /**
   * Opens the SMS app with an optional prefilled body.
   */
  static async sendSms(e164: string, body?: string): Promise<CommunicationActionResult> {
    try {
      const url = PhoneService.buildSmsUrl(e164, body);
      if (!url) return { success: false, error: "Número no válido para SMS." };

      await Linking.openURL(url);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "No se pudo abrir la app de SMS."
      };
    }
  }

  /**
   * Copies string to clipboard.
   */
  static async copyToClipboard(
    text: string,
    successMessage = "¡Número copiado al portapapeles!"
  ): Promise<CommunicationActionResult> {
    try {
      await Clipboard.setStringAsync(text);
      return { success: true, message: successMessage };
    } catch {
      return { success: false, error: "No se pudo copiar al portapapeles." };
    }
  }

  /**
   * Opens the native share sheet for a plain text message.
   */
  static async shareText(message: string): Promise<CommunicationActionResult> {
    const cleanMessage = message.trim();
    if (!cleanMessage) return { success: false, error: "Escribe un mensaje antes de compartir." };

    try {
      if (Platform.OS !== "web") {
        try {
          const { default: Share } = await import("react-native-share");
          await Share.open({
            title: `Compartir desde ${APP_NAME}`,
            subject: `Mensaje de ${APP_NAME}`,
            message: cleanMessage,
            failOnCancel: false
          });
          return { success: true };
        } catch {
          // The platform share sheet below remains available as a safe fallback.
        }
      }

      await NativeShare.share(
        { title: `Compartir desde ${APP_NAME}`, message: cleanMessage },
        { dialogTitle: `Compartir desde ${APP_NAME}` }
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "No se pudo compartir el mensaje."
      };
    }
  }

  /**
   * Reads current text from clipboard.
   */
  static async readClipboard(): Promise<string> {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (hasString) {
        return await Clipboard.getStringAsync();
      }
      return "";
    } catch {
      return "";
    }
  }

  /**
   * Triggers native Share Sheet for a phone number.
   */
  static async shareNumber(
    e164: string,
    formattedNumber: string,
    name?: string
  ): Promise<CommunicationActionResult> {
    try {
      const whatsappUrl = PhoneService.buildWhatsAppUrl(e164);
      if (!whatsappUrl) return { success: false, error: "No se pudo crear el enlace de WhatsApp." };

      const title = name ? `Compartir contacto: ${name}` : `Compartir desde ${APP_NAME}`;
      const message = name
        ? `${name}\n${formattedNumber}\n\nAbrir conversación en WhatsApp:\n${whatsappUrl}`
        : `${formattedNumber}\n\nAbrir conversación en WhatsApp:\n${whatsappUrl}`;

      await NativeShare.share(
        { title, message },
        { dialogTitle: `Compartir desde ${APP_NAME}` }
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "No se pudo compartir el número."
      };
    }
  }

  /**
   * Saves contact to native device phonebook using expo-contacts on-demand.
   */
  static async saveToDeviceContacts(contactData: {
    name: string;
    phoneE164: string;
    company?: string;
    note?: string;
  }): Promise<CommunicationActionResult> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        return {
          success: false,
          error: "Permiso denegado para acceder a los contactos del dispositivo."
        };
      }

      const nameParts = contactData.name.trim().split(/\s+/).filter(Boolean);
      const createdId = await Contacts.addContactAsync({
        contactType: Contacts.ContactTypes.Person,
        name: contactData.name,
        firstName: nameParts[0] || contactData.name,
        lastName: nameParts.slice(1).join(" ") || undefined,
        company: contactData.company || "",
        note: contactData.note || "",
        phoneNumbers: [
          {
            label: "mobile",
            number: contactData.phoneE164
          }
        ]
      });

      if (createdId) {
        return { success: true, message: "¡Contacto guardado en tu teléfono!" };
      }
      return { success: false, error: "No se pudo guardar el contacto en la agenda del dispositivo." };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al guardar el contacto."
      };
    }
  }

  /**
   * Saves several WASAPEA.ME contacts to the device phonebook with one permission request.
   * Existing phone numbers are skipped to avoid creating duplicates.
   */
  static async saveManyToDeviceContacts(
    contactsToExport: DeviceContactExportItem[],
    defaultCountryIso: string = "PE"
  ): Promise<DeviceContactExportResult> {
    const emptyResult: DeviceContactExportResult = {
      exportedCount: 0,
      skippedCount: 0,
      failedCount: 0
    };

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        return {
          ...emptyResult,
          error: "Concede el permiso de contactos desde los ajustes del teléfono para poder exportar."
        };
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers]
      });
      const deviceNumbers = new Set<string>();
      for (const contact of data ?? []) {
        for (const phone of contact.phoneNumbers ?? []) {
          if (!phone.number) continue;
          const parsed = PhoneService.parse(phone.number, defaultCountryIso);
          if (parsed.isValid) deviceNumbers.add(parsed.e164);
        }
      }

      const result = { ...emptyResult };
      for (const contact of contactsToExport) {
        if (deviceNumbers.has(contact.phoneE164)) {
          result.skippedCount++;
          continue;
        }

        const nameParts = contact.name.trim().split(/\s+/).filter(Boolean);
        try {
          const createdId = await Contacts.addContactAsync({
            contactType: Contacts.ContactTypes.Person,
            name: contact.name,
            firstName: nameParts[0] || contact.name,
            lastName: nameParts.slice(1).join(" ") || undefined,
            company: contact.company || "",
            phoneNumbers: [{ label: "mobile", number: contact.phoneE164 }]
          });
          if (!createdId) {
            result.failedCount++;
            continue;
          }
          deviceNumbers.add(contact.phoneE164);
          result.exportedCount++;
        } catch {
          result.failedCount++;
        }
      }
      return result;
    } catch (err) {
      return {
        ...emptyResult,
        error: err instanceof Error ? err.message : "No se pudieron exportar los contactos al teléfono."
      };
    }
  }

  /**
   * Reads normalized phone numbers already stored on the device.
   */
  static async getDeviceContactPhoneNumbers(
    defaultCountryIso: string = "PE"
  ): Promise<DevicePhoneNumbersResult> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        return {
          phoneNumbers: [],
          error: "Concede el permiso de contactos desde los ajustes del teléfono para poder exportar."
        };
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers]
      });
      const phoneNumbers = new Set<string>();
      for (const contact of data ?? []) {
        for (const phone of contact.phoneNumbers ?? []) {
          if (!phone.number) continue;
          const parsed = PhoneService.parse(phone.number, defaultCountryIso);
          if (parsed.isValid) phoneNumbers.add(parsed.e164);
        }
      }
      return { phoneNumbers: [...phoneNumbers] };
    } catch (err) {
      return {
        phoneNumbers: [],
        error: err instanceof Error ? err.message : "No se pudo revisar la agenda del teléfono."
      };
    }
  }

  /**
   * Prompts user to pick a contact from device native phonebook and imports it.
   */
  static async selectDeviceContact(defaultCountryIso: string = "PE"): Promise<ContactSelectionResult> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        return {
          contact: null,
          error: "Concede el permiso de contactos desde los ajustes del teléfono para poder importar."
        };
      }

      const selectedContact = await Contacts.presentContactPickerAsync();

      if (!selectedContact) {
        return { contact: null };
      }

      const contactName =
        selectedContact.name?.trim() ||
        [selectedContact.firstName, selectedContact.lastName].filter(Boolean).join(" ").trim() ||
        "Sin nombre";
      const phones = selectedContact.phoneNumbers || [];
      const rawPhone = phones.find((phone: Contacts.PhoneNumber) => phone.number?.trim())?.number?.trim() || "";

      if (!rawPhone) {
        return {
          contact: null,
          error: `El contacto ${contactName} no tiene un número telefónico.`
        };
      }

      const parsed = PhoneService.parse(rawPhone, defaultCountryIso);

      if (!parsed.isValid) {
        return {
          contact: null,
          error: `El contacto ${contactName} no tiene un número telefónico válido.`
        };
      }

      return {
        contact: {
          name: contactName,
          phoneE164: parsed.e164,
          phoneFormatted: parsed.formattedInternational,
          company: selectedContact.company || ""
        }
      };
    } catch (err) {
      const detail = err instanceof Error ? err.message.trim() : "";
      return {
        contact: null,
        error: detail
          ? `No se pudo abrir la agenda del teléfono. ${detail}`
          : "No se pudo abrir la agenda del teléfono."
      };
    }
  }

  /**
   * Fetches all device contacts with valid phone numbers for batch importing using non-deprecated legacy API.
   */
  static async getAllDeviceContacts(defaultCountryIso: string = "PE"): Promise<{
    contacts: {
      id: string;
      name: string;
      rawPhone: string;
      phoneE164: string;
      phoneFormatted: string;
      countryCode: string;
      countryIso: string;
    }[];
    error?: string;
  }> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        return {
          contacts: [],
          error: "Concede el permiso de contactos desde los ajustes del teléfono para poder importar."
        };
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers]
      });

      if (!data || data.length === 0) {
        return { contacts: [] };
      }

      const validList: {
        id: string;
        name: string;
        rawPhone: string;
        phoneE164: string;
        phoneFormatted: string;
        countryCode: string;
        countryIso: string;
      }[] = [];

      const seenNumbers = new Set<string>();

      for (const item of data) {
        const name =
          item.name?.trim() ||
          [item.firstName, item.lastName].filter(Boolean).join(" ").trim() ||
          "Contacto";
        if (!item.phoneNumbers || item.phoneNumbers.length === 0) continue;

        for (const phoneObj of item.phoneNumbers) {
          const rawPhone = phoneObj.number?.trim();
          if (!rawPhone) continue;

          const parsed = PhoneService.parse(rawPhone, defaultCountryIso);
          if (parsed.isValid && !seenNumbers.has(parsed.e164)) {
            seenNumbers.add(parsed.e164);
            validList.push({
              id: `${item.id || "c"}-${validList.length}`,
              name,
              rawPhone,
              phoneE164: parsed.e164,
              phoneFormatted: parsed.formattedInternational,
              countryCode: parsed.countryCode,
              countryIso: parsed.countryIso
            });
          }
        }
      }

      return { contacts: validList };
    } catch (err) {
      const detail = err instanceof Error ? err.message.trim() : "";
      return {
        contacts: [],
        error: detail
          ? `No se pudieron obtener los contactos. ${detail}`
          : "No se pudieron obtener los contactos del teléfono."
      };
    }
  }
}
