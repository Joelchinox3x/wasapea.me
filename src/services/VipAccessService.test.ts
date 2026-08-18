import { VipAccessService } from "./VipAccessService";

describe("VipAccessService", () => {
  it("accepts the temporary administrator code", async () => {
    await expect(VipAccessService.verifyAccessKey(" promo2026 ")).resolves.toBe(true);
  });

  it("rejects unknown codes", async () => {
    await expect(VipAccessService.verifyAccessKey("OTRA-CLAVE")).resolves.toBe(false);
  });
});
