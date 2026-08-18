import { buildCurrentLocationMessage, buildGoogleMapsLocationUrl } from "./LocationShareService";

describe("LocationShareService", () => {
  const coordinates = { latitude: -12.1234567, longitude: -77.1234567 };

  test("creates a Google Maps link with stable coordinate precision", () => {
    expect(buildGoogleMapsLocationUrl(coordinates)).toBe(
      "https://www.google.com/maps/search/?api=1&query=-12.123457,-77.123457"
    );
  });

  test("creates the WhatsApp message with its clickable map link", () => {
    const result = buildCurrentLocationMessage(coordinates);

    expect(result.message).toContain("*📍 COMPARTO MI UBICACIÓN*");
    expect(result.message).toContain(result.mapUrl);
    expect(result.message).toContain("WASAPEA.ME");
  });

  test("rejects invalid coordinates", () => {
    expect(() => buildGoogleMapsLocationUrl({ latitude: Number.NaN, longitude: 0 })).toThrow(
      "Las coordenadas obtenidas no son válidas."
    );
  });
});
