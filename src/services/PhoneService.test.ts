import { PhoneService } from "./PhoneService";

describe("PhoneService Tests", () => {
  describe("Peru Phone Number Normalization (+51)", () => {
    const expectedE164 = "+51976898196";

    test("should parse 9-digit local Peru number '976898196'", () => {
      const result = PhoneService.parse("976898196", "PE");
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe(expectedE164);
    });

    test("should parse space-separated number '976 898 196'", () => {
      const result = PhoneService.parse("976 898 196", "PE");
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe(expectedE164);
    });

    test("should parse hyphenated number '976-898-196'", () => {
      const result = PhoneService.parse("976-898-196", "PE");
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe(expectedE164);
    });

    test("should parse E.164 format with country code '+51 976 898 196'", () => {
      const result = PhoneService.parse("+51 976 898 196", "PE");
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe(expectedE164);
    });

    test("should parse double zero international prefix '0051 976898196'", () => {
      const result = PhoneService.parse("0051 976898196", "PE");
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe(expectedE164);
    });

    test("should parse raw prefixed number '51976898196'", () => {
      const result = PhoneService.parse("51976898196", "PE");
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe(expectedE164);
    });
  });

  describe("International Phone Numbers Parsing", () => {
    test("should parse Mexico number '+52 55 1234 5678'", () => {
      const result = PhoneService.parse("+52 55 1234 5678", "MX");
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe("+525512345678");
      expect(result.countryCode).toBe("+52");
    });

    test("should parse Spain number '+34 612 345 678'", () => {
      const result = PhoneService.parse("+34 612 345 678", "ES");
      expect(result.isValid).toBe(true);
      expect(result.e164).toBe("+34612345678");
    });

    test("should fail on invalid short string '123'", () => {
      const result = PhoneService.parse("123", "PE");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Text Extraction", () => {
    test("should extract phone number embedded in sentence", () => {
      const text = "Habla con José, su número es 976-898-196 y dile que me llame.";
      const candidates = PhoneService.extractPhoneNumbers(text, "PE");
      expect(candidates.length).toBe(1);
      expect(candidates[0].parsed.e164).toBe("+51976898196");
    });

    test("should extract multiple distinct numbers without duplicates", () => {
      const text = "Llama a María al 976898196 o a Juan al +51 987654321.";
      const candidates = PhoneService.extractPhoneNumbers(text, "PE");
      expect(candidates.length).toBe(2);
      expect(candidates[0].parsed.e164).toBe("+51976898196");
      expect(candidates[1].parsed.e164).toBe("+51987654321");
    });

    test("should normalize a spaced wa.me URL to a Peru national input", () => {
      const normalized = PhoneService.normalizeForInput("https://wa.me/51 953 385 003", "PE");
      expect(normalized?.parsed.e164).toBe("+51953385003");
      expect(normalized?.input).toBe("953 385 003");
      expect(normalized?.country.iso).toBe("PE");
    });

    test("should switch country and remove the international prefix", () => {
      const normalized = PhoneService.normalizeForInput("+52 55 1234 5678", "PE");
      expect(normalized?.input).toBe("55 1234 5678");
      expect(normalized?.country.iso).toBe("MX");
      expect(normalized?.country.code).toBe("+52");
    });
  });

  describe("URL Generators", () => {
    test("should generate wa.me link without '+' and with encoded message", () => {
      const url = PhoneService.buildWhatsAppUrl("+51976898196", "Hola, cotización por favor");
      expect(url).toBe("https://wa.me/51976898196?text=Hola%2C%20cotizaci%C3%B3n%20por%20favor");
    });

    test("should remove spaces and punctuation from a formatted wa.me number", () => {
      expect(PhoneService.buildWhatsAppUrl("+51 993 385 003")).toBe("https://wa.me/51993385003");
    });

    test("should generate a recipient-free wa.me share link", () => {
      expect(PhoneService.buildWhatsAppShareUrl(" Hola equipo 👋 ")).toBe(
        "https://wa.me/?text=Hola%20equipo%20%F0%9F%91%8B"
      );
      expect(PhoneService.buildWhatsAppShareUrl("   ")).toBe("");
    });

    test("should generate tel: and sms: URLs", () => {
      expect(PhoneService.buildCallUrl("+51976898196")).toBe("tel:+51976898196");
      expect(PhoneService.buildSmsUrl("+51976898196", "Consulta")).toBe("sms:+51976898196?body=Consulta");
    });
  });
});
