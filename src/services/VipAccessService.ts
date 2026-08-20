const TEMPORARY_ADMIN_CODES = new Set(["PROMO2026"]);

function normalize(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export class VipAccessService {
  static async verifyAccessKey(accessCode: string): Promise<boolean> {
    return TEMPORARY_ADMIN_CODES.has(normalize(accessCode));
  }
}
