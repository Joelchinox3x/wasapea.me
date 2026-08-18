import {
  ImageFormat,
  PaintStyle,
  Skia,
  type SkCanvas,
  type SkFont,
  type SkImage,
  type SkPaint
} from "@shopify/react-native-skia";
import { generateQrMatrix, getQrLayout, isFinderPattern, isLogoArea } from "../utils/qrGenerator";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1440;
const QR_QUIET_ZONE_MODULES = 2;
const QR_LOGO_RATIO = 0.22;
const LOGO_SOURCE_CROP_RATIO = 0.08;

export interface QrShareCardFonts {
  regular: SkFont;
  semibold: SkFont;
  bold: SkFont;
}

interface CreateQrShareCardOptions {
  formattedNumber: string;
  waUrl: string;
  fonts: QrShareCardFonts;
  brandSymbol: SkImage;
}

function makePaint(color: string, style: PaintStyle = PaintStyle.Fill): SkPaint {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(color));
  paint.setStyle(style);
  return paint;
}

function drawCenteredText(
  canvas: SkCanvas,
  text: string,
  baselineY: number,
  font: SkFont,
  paint: SkPaint
): void {
  const bounds = font.measureText(text, paint);
  canvas.drawText(text, (CARD_WIDTH - bounds.width) / 2, baselineY, paint, font);
}

function drawQrCode(
  canvas: SkCanvas,
  value: string,
  x: number,
  y: number,
  size: number,
  brandSymbol: SkImage
): boolean {
  const qr = generateQrMatrix(value, "H");
  if (qr.size === 0) return false;

  const { cellSize, padding } = getQrLayout(
    qr.size,
    size,
    QR_QUIET_ZONE_MODULES
  );
  if (!cellSize) return false;

  const modules = Skia.PathBuilder.Make();
  const functional = Skia.PathBuilder.Make();
  let modulesPath: ReturnType<typeof modules.build> | null = null;
  let functionalPath: ReturnType<typeof functional.build> | null = null;
  const qrPaint = makePaint("#065F46");
  const whitePaint = makePaint("#FFFFFF");
  const imagePaint = makePaint("#FFFFFF");
  const dotRadius = cellSize * 0.43;
  const functionalInset = cellSize * 0.05;

  try {
    for (let row = 0; row < qr.size; row += 1) {
      for (let column = 0; column < qr.size; column += 1) {
        if (!qr.matrix[row][column] || isFinderPattern(row, column, qr.size)) continue;
        if (isLogoArea(row, column, qr.size, QR_LOGO_RATIO)) continue;
        const cellX = x + padding + column * cellSize;
        const cellY = y + padding + row * cellSize;

        if (qr.reservedMatrix[row]?.[column]) {
          functional.addRRect(
            Skia.RRectXY(
              Skia.XYWHRect(
                cellX + functionalInset,
                cellY + functionalInset,
                cellSize - functionalInset * 2,
                cellSize - functionalInset * 2
              ),
              cellSize * 0.12,
              cellSize * 0.12
            )
          );
        } else {
          modules.addCircle(cellX + cellSize / 2, cellY + cellSize / 2, dotRadius);
        }
      }
    }

    modulesPath = modules.build();
    functionalPath = functional.build();
    canvas.drawPath(modulesPath, qrPaint);
    canvas.drawPath(functionalPath, qrPaint);

    const corners = [
      { row: 0, column: 0 },
      { row: 0, column: qr.size - 7 },
      { row: qr.size - 7, column: 0 }
    ];
    corners.forEach(({ row, column }) => {
      const eyeX = x + padding + column * cellSize;
      const eyeY = y + padding + row * cellSize;
      canvas.drawRRect(
        Skia.RRectXY(Skia.XYWHRect(eyeX, eyeY, 7 * cellSize, 7 * cellSize), cellSize * 0.8, cellSize * 0.8),
        qrPaint
      );
      canvas.drawRRect(
        Skia.RRectXY(
          Skia.XYWHRect(eyeX + cellSize, eyeY + cellSize, 5 * cellSize, 5 * cellSize),
          cellSize * 0.5,
          cellSize * 0.5
        ),
        whitePaint
      );
      canvas.drawRRect(
        Skia.RRectXY(
          Skia.XYWHRect(eyeX + 2 * cellSize, eyeY + 2 * cellSize, 3 * cellSize, 3 * cellSize),
          cellSize * 0.65,
          cellSize * 0.65
        ),
        qrPaint
      );
    });

    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const badgeSize = qr.size * cellSize * QR_LOGO_RATIO;
    const badgeRadius = badgeSize / 2;
    canvas.drawCircle(centerX, centerY, badgeRadius + 7, qrPaint);
    canvas.drawCircle(centerX, centerY, badgeRadius + 3, whitePaint);

    const logoSize = badgeSize * 0.96;
    const sourceInsetX = brandSymbol.width() * LOGO_SOURCE_CROP_RATIO;
    const sourceInsetY = brandSymbol.height() * LOGO_SOURCE_CROP_RATIO;
    canvas.drawImageRect(
      brandSymbol,
      Skia.XYWHRect(
        sourceInsetX,
        sourceInsetY,
        brandSymbol.width() - sourceInsetX * 2,
        brandSymbol.height() - sourceInsetY * 2
      ),
      Skia.XYWHRect(centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize),
      imagePaint,
      true
    );
    return true;
  } finally {
    modulesPath?.dispose();
    functionalPath?.dispose();
    qrPaint.dispose();
    whitePaint.dispose();
    imagePaint.dispose();
  }
}

export function createQrShareCardPng({
  formattedNumber,
  waUrl,
  fonts,
  brandSymbol
}: CreateQrShareCardOptions): string | null {
  const surface = Skia.Surface.MakeOffscreen(CARD_WIDTH, CARD_HEIGHT);
  if (!surface) return null;

  const paints = {
    background: makePaint("#ECFDF5"),
    header: makePaint("#064E3B"),
    decoration: makePaint("rgba(16, 185, 129, 0.20)"),
    decorationSoft: makePaint("rgba(255, 255, 255, 0.08)"),
    white: makePaint("#FFFFFF"),
    shadow: makePaint("rgba(6, 78, 59, 0.12)"),
    brand: makePaint("#A7F3D0"),
    title: makePaint("#FFFFFF"),
    subtitle: makePaint("#D1FAE5"),
    label: makePaint("#047857"),
    number: makePaint("#064E3B"),
    instruction: makePaint("#334155"),
    footer: makePaint("#64748B"),
    border: makePaint("#A7F3D0", PaintStyle.Stroke),
    numberPanel: makePaint("rgba(255, 255, 255, 0.78)")
  };
  paints.border.setStrokeWidth(3);

  try {
    const canvas = surface.getCanvas();
    canvas.drawRect(Skia.XYWHRect(0, 0, CARD_WIDTH, CARD_HEIGHT), paints.background);
    canvas.drawRect(Skia.XYWHRect(0, 0, CARD_WIDTH, 380), paints.header);
    canvas.drawCircle(970, 55, 190, paints.decorationSoft);
    canvas.drawCircle(95, 315, 145, paints.decoration);

    drawCenteredText(canvas, "WASAPEA.ME", 92, fonts.semibold, paints.brand);
    drawCenteredText(canvas, "Escribe a este número", 205, fonts.bold, paints.title);
    drawCenteredText(
      canvas,
      "o escanea el QR para abrir WhatsApp",
      270,
      fonts.regular,
      paints.subtitle
    );

    const qrCard = Skia.RRectXY(Skia.XYWHRect(160, 320, 760, 760), 44, 44);
    const qrShadow = Skia.RRectXY(Skia.XYWHRect(160, 338, 760, 760), 44, 44);
    canvas.drawRRect(qrShadow, paints.shadow);
    canvas.drawRRect(qrCard, paints.white);
    canvas.drawRRect(qrCard, paints.border);

    if (!drawQrCode(canvas, waUrl, 160, 320, 760, brandSymbol)) return null;

    const numberPanel = Skia.RRectXY(Skia.XYWHRect(145, 1135, 790, 178), 42, 42);
    canvas.drawRRect(numberPanel, paints.numberPanel);
    canvas.drawRRect(numberPanel, paints.border);
    drawCenteredText(canvas, "MI NÚMERO", 1190, fonts.regular, paints.label);
    drawCenteredText(canvas, formattedNumber, 1275, fonts.bold, paints.number);
    drawCenteredText(
      canvas,
      waUrl.includes("text=") ? "Escanea · El mensaje quedará listo" : "Escanea con la cámara de tu celular",
      1360,
      fonts.regular,
      paints.instruction
    );
    drawCenteredText(canvas, "Creado con WASAPEA.ME", 1410, fonts.regular, paints.footer);

    surface.flush();
    const cardImage = surface.makeImageSnapshot();
    const pngBase64 = cardImage.encodeToBase64(ImageFormat.PNG, 100);
    cardImage.dispose();
    return pngBase64;
  } finally {
    Object.values(paints).forEach((paint) => paint.dispose());
    surface.dispose();
  }
}
