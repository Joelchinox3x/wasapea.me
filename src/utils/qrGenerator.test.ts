import {
  generateQrMatrix,
  getQrLayout,
  hasReservedModulesInLogoArea
} from "./qrGenerator";

describe("QR generator safety", () => {
  test("generates matching data and reserved-module matrices", () => {
    const result = generateQrMatrix("https://wa.me/51953385003", "H");

    expect(result.size).toBeGreaterThan(0);
    expect(result.matrix).toHaveLength(result.size);
    expect(result.reservedMatrix).toHaveLength(result.size);
    expect(result.matrix.every((row) => row.length === result.size)).toBe(true);
    expect(result.reservedMatrix.every((row) => row.length === result.size)).toBe(true);
  });

  test("keeps an exact four-module quiet zone", () => {
    const layout = getQrLayout(29, 230, 4);

    expect(layout.padding / layout.cellSize).toBeCloseTo(4, 8);
    expect(layout.symbolSize + layout.padding * 2).toBeCloseTo(230, 8);
  });

  test("hides the center badge if it would cover reserved QR modules", () => {
    const shortUrl = generateQrMatrix("https://wa.me/51953385003", "H");
    const longerUrl = generateQrMatrix(
      `https://wa.me/51953385003?text=${encodeURIComponent(
        "Hola este es un mensaje de prueba para Wasapea.me"
      )}`,
      "H"
    );

    expect(hasReservedModulesInLogoArea(shortUrl.reservedMatrix, 0.2)).toBe(false);
    expect(hasReservedModulesInLogoArea(longerUrl.reservedMatrix, 0.2)).toBe(true);
  });
});
