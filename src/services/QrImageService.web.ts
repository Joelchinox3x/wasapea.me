import * as Clipboard from "expo-clipboard";
import type {
  QrImageActionResult,
  QrImagePayload,
} from "./QrImageService.types";

function getShareText({ formattedNumber, waUrl }: QrImagePayload): string {
  return `Escribe a este número por WhatsApp:\n${formattedNumber}\n\nAbrir conversación:\n${waUrl}`;
}

function downloadPng({ pngBase64, e164, variant }: QrImagePayload): void {
  const anchor = document.createElement("a");
  anchor.href = `data:image/png;base64,${pngBase64}`;
  const label = variant === "card" ? "tarjeta-qr" : "qr";
  anchor.download = `wasapea-me-${label}-${e164.replace(/\D/g, "")}.png`;
  anchor.click();
}

export async function shareQrImage(
  payload: QrImagePayload,
): Promise<QrImageActionResult> {
  try {
    const text = getShareText(payload);
    await Clipboard.setStringAsync(text);
    if (navigator.share) {
      await navigator.share({
        title: "QR de Wasapea.me",
        text,
        url: payload.waUrl,
      });
      return { ok: true, linkCopied: true };
    }
    downloadPng(payload);
    return { ok: true, linkCopied: true };
  } catch {
    return {
      ok: false,
      error: "No se pudo compartir el QR desde este navegador.",
    };
  }
}

export async function saveQrImage(
  payload: QrImagePayload,
): Promise<QrImageActionResult> {
  try {
    downloadPng(payload);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo descargar la imagen del QR." };
  }
}
