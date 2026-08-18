import { CountryCode, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { CountryItem, DEFAULT_COUNTRY, POPULAR_COUNTRIES } from "../constants/app";

export interface ParsedPhoneResult {
  isValid: boolean;
  e164: string;
  formattedInternational: string;
  formattedNational: string;
  countryCode: string;
  countryIso: string;
  rawInput: string;
  error?: string;
}

export interface ExtractedPhoneCandidate {
  raw: string;
  parsed: ParsedPhoneResult;
}

export interface NormalizedPhoneInput {
  input: string;
  country: CountryItem;
  parsed: ParsedPhoneResult;
}

export class PhoneService {
  /**
   * Cleans raw input by trimming leading/trailing spaces and normalizing whitespace.
   */
  static cleanInput(input: string): string {
    if (!input) return "";
    return input.trim().replace(/[\r\n\t]+/g, " ");
  }

  /**
   * Parses and validates a phone number string using libphonenumber-js.
   * Handles formats like:
   * - 976898196
   * - 976 898 196
   * - 976-898-196
   * - (976) 898 196
   * - +51 976 898 196
   * - 51976898196
   * - 0051 976898196
   */
  static parse(rawNumber: string, defaultCountryIso: string = DEFAULT_COUNTRY.iso): ParsedPhoneResult {
    const cleaned = this.cleanInput(rawNumber);
    if (!cleaned) {
      return {
        isValid: false,
        e164: "",
        formattedInternational: "",
        formattedNational: "",
        countryCode: "",
        countryIso: defaultCountryIso.toUpperCase(),
        rawInput: rawNumber,
        error: "Por favor ingresa un número de teléfono."
      };
    }

    const iso = (defaultCountryIso || DEFAULT_COUNTRY.iso).toUpperCase() as CountryCode;

    // Normalize "00" international prefix to "+"
    let normalized = cleaned;
    if (normalized.startsWith("00")) {
      normalized = "+" + normalized.slice(2);
    }

    // Try parsing with libphonenumber-js
    try {
      const phoneNumber = parsePhoneNumberFromString(normalized, iso);

      if (phoneNumber && phoneNumber.isValid()) {
        const countryCallingCode = `+${phoneNumber.countryCallingCode}`;
        return {
          isValid: true,
          e164: phoneNumber.format("E.164"),
          formattedInternational: phoneNumber.formatInternational(),
          formattedNational: phoneNumber.formatNational(),
          countryCode: countryCallingCode,
          countryIso: phoneNumber.country || defaultCountryIso.toUpperCase(),
          rawInput: rawNumber
        };
      }

      // If strict validation fails, check if adding default country prefix yields a valid number
      if (!normalized.startsWith("+")) {
        const prefixed = `+${getCountryCallingCode(iso)}${normalized.replace(/\D/g, "")}`;
        const fallbackPhone = parsePhoneNumberFromString(prefixed, iso);
        if (fallbackPhone && fallbackPhone.isValid()) {
          return {
            isValid: true,
            e164: fallbackPhone.format("E.164"),
            formattedInternational: fallbackPhone.formatInternational(),
            formattedNational: fallbackPhone.formatNational(),
            countryCode: `+${fallbackPhone.countryCallingCode}`,
            countryIso: fallbackPhone.country || defaultCountryIso.toUpperCase(),
            rawInput: rawNumber
          };
        }
      }

      return {
        isValid: false,
        e164: "",
        formattedInternational: cleaned,
        formattedNational: cleaned,
        countryCode: "",
        countryIso: defaultCountryIso.toUpperCase(),
        rawInput: rawNumber,
        error: "El número no parece válido para el país seleccionado."
      };
    } catch {
      return {
        isValid: false,
        e164: "",
        formattedInternational: cleaned,
        formattedNational: cleaned,
        countryCode: "",
        countryIso: defaultCountryIso.toUpperCase(),
        rawInput: rawNumber,
        error: "No se pudo interpretar el número telefónico."
      };
    }
  }

  /**
   * Finds a valid phone inside pasted text, including spaced wa.me URLs.
   */
  static parseFromText(rawText: string, defaultCountryIso: string = DEFAULT_COUNTRY.iso): ParsedPhoneResult {
    const cleaned = this.cleanInput(rawText);
    const waMeMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?wa\.me\s*\/\s*([+\d][\d\s().-]{5,})/i);

    if (waMeMatch) {
      const digits = waMeMatch[1].replace(/\D/g, "");
      const parsedWaNumber = this.parse(`+${digits}`, defaultCountryIso);
      if (parsedWaNumber.isValid) return parsedWaNumber;
    }

    const direct = this.parse(cleaned, defaultCountryIso);
    if (direct.isValid) return direct;

    const candidate = this.extractPhoneNumbers(cleaned, defaultCountryIso)[0];
    if (candidate) return candidate.parsed;

    return direct;
  }

  /**
   * Converts any valid local/international representation into the value shown
   * in the input and the matching country selector state.
   */
  static normalizeForInput(rawText: string, defaultCountryIso: string = DEFAULT_COUNTRY.iso): NormalizedPhoneInput | null {
    const parsed = this.parseFromText(rawText, defaultCountryIso);
    if (!parsed.isValid) return null;

    const knownCountry = POPULAR_COUNTRIES.find(
      (country) => country.iso.toUpperCase() === parsed.countryIso.toUpperCase()
    );
    const country = knownCountry || {
      iso: parsed.countryIso,
      code: parsed.countryCode,
      name: parsed.countryIso,
      flag: this.countryFlag(parsed.countryIso)
    };

    return {
      input: parsed.formattedNational,
      country,
      parsed
    };
  }

  private static countryFlag(countryIso: string): string {
    const iso = countryIso.toUpperCase();
    if (!/^[A-Z]{2}$/.test(iso)) return "🌐";
    return String.fromCodePoint(...[...iso].map((letter) => letter.charCodeAt(0) + 127397));
  }

  /**
   * Extracts candidate phone numbers embedded in freeform text.
   * e.g. "Habla con José su número es 976-898-196 o al +51 987 654 321"
   */
  static extractPhoneNumbers(text: string, defaultCountryIso: string = DEFAULT_COUNTRY.iso): ExtractedPhoneCandidate[] {
    if (!text || text.trim().length === 0) return [];

    // Match potential phone number patterns (digits, spaces, hyphens, parens, plus prefix)
    const regex = /(\+?\d[\d\s\-\(\)]{6,20}\d)/g;
    const matches = text.match(regex) || [];
    const candidates: ExtractedPhoneCandidate[] = [];
    const seenE164 = new Set<string>();

    for (const match of matches) {
      const trimmed = match.trim();
      const parsed = this.parse(trimmed, defaultCountryIso);
      if (parsed.isValid && !seenE164.has(parsed.e164)) {
        seenE164.add(parsed.e164);
        candidates.push({ raw: trimmed, parsed });
      }
    }

    return candidates;
  }

  /**
   * Generates a wa.me URL for WhatsApp without '+' in E.164.
   * e.g. +51976898196 -> https://wa.me/51976898196?text=...
   */
  static buildWhatsAppUrl(e164: string, message?: string): string {
    if (!e164) return "";
    const cleanDigits = e164.replace(/\D/g, "");
    if (!cleanDigits) return "";
    let url = `https://wa.me/${cleanDigits}`;
    if (message && message.trim()) {
      url += `?text=${encodeURIComponent(message.trim())}`;
    }
    return url;
  }

  /**
   * Generates a recipient-free WhatsApp share URL.
   * WhatsApp will ask the user which contact or group should receive it.
   */
  static buildWhatsAppShareUrl(message: string): string {
    const cleanMessage = message.trim();
    if (!cleanMessage) return "";
    return `https://wa.me/?text=${encodeURIComponent(cleanMessage)}`;
  }

  /**
   * Generates a WhatsApp Business deep link.
   * Falls back to standard wa.me URL if needed.
   */
  static buildWhatsAppBusinessUrl(e164: string, message?: string): string {
    if (!e164) return "";
    const cleanDigits = e164.replace(/\D/g, "");
    if (!cleanDigits) return "";
    let url = `whatsapp-business://send?phone=${cleanDigits}`;
    if (message && message.trim()) {
      url += `&text=${encodeURIComponent(message.trim())}`;
    }
    return url;
  }

  /**
   * Generates tel: URL for phone calls.
   */
  static buildCallUrl(e164: string): string {
    if (!e164) return "";
    return `tel:${e164}`;
  }

  /**
   * Generates sms: URL for SMS messages.
   */
  static buildSmsUrl(e164: string, body?: string): string {
    if (!e164) return "";
    let url = `sms:${e164}`;
    if (body && body.trim()) {
      url += `?body=${encodeURIComponent(body.trim())}`;
    }
    return url;
  }
}
