import * as Clipboard from "expo-clipboard";
import { EncodingType, File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import type {
  QrImageActionResult,
  QrImagePayload,
} from "./QrImageService.types";

function createQrFile({ pngBase64, e164, variant }: QrImagePayload): File {
  const digits = e164.replace(/\D/g, "") || Date.now().toString();
  const label = variant === "card" ? "tarjeta-qr" : "qr";
  const file = new File(Paths.cache, `wasapea-me-${label}-${digits}.png`);
  file.create({ overwrite: true });
  file.write(pngBase64, { encoding: EncodingType.Base64 });
  return file;
}

function getShareText({ formattedNumber, waUrl }: QrImagePayload): string {
  return `Escribe a este número por WhatsApp:\n${formattedNumber}\n\nAbrir conversación:\n${waUrl}`;
}

function getShareFilename({ e164, variant }: QrImagePayload): string {
  const digits = e164.replace(/\D/g, "") || Date.now().toString();
  const label = variant === "card" ? "tarjeta-qr" : "qr";
  return `wasapea-me-${label}-${digits}`;
}

async function shareWithExpoFallback(payload: QrImagePayload): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("El menú para compartir archivos no está disponible.");
  }

  const file = createQrFile(payload);
  await Sharing.shareAsync(file.uri, {
    dialogTitle: payload.variant === "card" ? "Compartir tarjeta QR" : "Compartir código QR",
    mimeType: "image/png",
    UTI: "public.png",
  });
}

export async function shareQrImage(
  payload: QrImagePayload,
): Promise<QrImageActionResult> {
  try {
    const message = getShareText(payload);
    await Clipboard.setStringAsync(message);

    try {
      const { default: Share } = await import("react-native-share");
      await Share.open({
        title: payload.variant === "card" ? "Compartir tarjeta QR" : "Compartir código QR",
        subject: "Mi QR de WhatsApp",
        message,
        url: `data:image/png;base64,${payload.pngBase64}`,
        type: "image/png",
        filename: getShareFilename(payload),
        failOnCancel: false,
        useInternalStorage: true,
      });
      return { ok: true, linkCopied: true, messageAttached: true };
    } catch {
      await shareWithExpoFallback(payload);
      return { ok: true, linkCopied: true, messageAttached: false };
    }
  } catch {
    return {
      ok: false,
      error: "No se pudo preparar o compartir la imagen del QR.",
    };
  }
}

export async function saveQrImage(
  payload: QrImagePayload,
): Promise<QrImageActionResult> {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync(true, [
      "photo",
    ]);
    if (!permission.granted) {
      return {
        ok: false,
        error: "Se necesita permiso para guardar el QR en la galería.",
      };
    }

    const file = createQrFile(payload);
    await MediaLibrary.Asset.create(file.uri);
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "No se pudo guardar la imagen del QR en la galería.",
    };
  }
}
