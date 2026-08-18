declare module "qrcode" {
  export interface QRCodeOptions {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H" | "low" | "medium" | "quartile" | "high";
    version?: number;
    maskPattern?: number;
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export interface QRCodeData {
    modules: {
      size: number;
      data: Uint8Array;
      reservedBit: Uint8Array;
      get(row: number, col: number): boolean;
    };
  }

  export function create(text: string, options?: QRCodeOptions): QRCodeData;
}
