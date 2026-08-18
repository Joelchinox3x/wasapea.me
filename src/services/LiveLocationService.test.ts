import { buildLiveLocationMessage } from "./LiveLocationService";

describe("LiveLocationService", () => {
  test("creates a clear WhatsApp message with the private viewer URL", () => {
    const url = "https://safe.wasapea.me/track/private-token";
    const message = buildLiveLocationMessage(url);
    expect(message).toContain("UBICACIÓN EN VIVO");
    expect(message).toContain(url);
    expect(message).toContain("privado y temporal");
  });
});
