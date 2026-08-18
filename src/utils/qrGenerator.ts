import QRCode from "qrcode";

export interface QrMatrixResult {
  size: number;
  matrix: boolean[][];
  reservedMatrix: boolean[][];
}

export interface QrLayout {
  cellSize: number;
  padding: number;
  symbolSize: number;
}

/**
 * Generates a 2D boolean grid representing QR Code modules.
 */
export function generateQrMatrix(text: string, ecLevel: "L" | "M" | "Q" | "H" = "H"): QrMatrixResult {
  if (!text) return { size: 0, matrix: [], reservedMatrix: [] };
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: ecLevel });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const reservedBits = qr.modules.reservedBit;
    const matrix: boolean[][] = [];
    const reservedMatrix: boolean[][] = [];

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      const reservedRow: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(Boolean(data[r * size + c]));
        reservedRow.push(Boolean(reservedBits[r * size + c]));
      }
      matrix.push(row);
      reservedMatrix.push(reservedRow);
    }

    return { size, matrix, reservedMatrix };
  } catch (err) {
    console.error("Error generating QR matrix:", err);
    return { size: 0, matrix: [], reservedMatrix: [] };
  }
}

/**
 * Calculates a QR layout with an exact quiet zone measured in modules.
 */
export function getQrLayout(matrixSize: number, outputSize: number, quietZoneModules: number = 4): QrLayout {
  if (matrixSize <= 0 || outputSize <= 0) return { cellSize: 0, padding: 0, symbolSize: 0 };
  const cellSize = outputSize / (matrixSize + quietZoneModules * 2);
  return {
    cellSize,
    padding: quietZoneModules * cellSize,
    symbolSize: matrixSize * cellSize
  };
}

/**
 * Checks if a given cell (row, col) falls inside one of the 3 corner Finder Patterns (7x7 eyes).
 */
export function isFinderPattern(r: number, c: number, size: number): boolean {
  // Top-Left Finder Pattern (0..6, 0..6)
  if (r < 7 && c < 7) return true;
  // Top-Right Finder Pattern (0..6, size-7..size-1)
  if (r < 7 && c >= size - 7) return true;
  // Bottom-Left Finder Pattern (size-7..size-1, 0..6)
  if (r >= size - 7 && c < 7) return true;
  return false;
}

/**
 * Checks if a cell (row, col) is in the central logo cutout area.
 */
export function isLogoArea(r: number, c: number, size: number, logoRatio: number = 0.26): boolean {
  const logoModules = Math.floor(size * logoRatio);
  const start = Math.floor((size - logoModules) / 2);
  const end = start + logoModules;
  return r >= start && r < end && c >= start && c < end;
}

/**
 * A centered badge is disabled whenever it would cover timing, format,
 * version or alignment modules required by the QR decoder.
 */
export function hasReservedModulesInLogoArea(
  reservedMatrix: boolean[][],
  logoRatio: number
): boolean {
  const size = reservedMatrix.length;
  if (size === 0) return true;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reservedMatrix[r]?.[c] && isLogoArea(r, c, size, logoRatio)) return true;
    }
  }
  return false;
}
