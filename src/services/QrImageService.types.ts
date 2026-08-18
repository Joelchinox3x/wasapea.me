export type QrImageVariant = "card" | "qr";

export interface QrImagePayload {
  pngBase64: string;
  e164: string;
  formattedNumber: string;
  waUrl: string;
  variant: QrImageVariant;
}

export interface QrImageActionResult {
  ok: boolean;
  linkCopied?: boolean;
  messageAttached?: boolean;
  error?: string;
}
