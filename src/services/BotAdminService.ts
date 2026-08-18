import { BOT_SERVER_URL } from "../constants/app";
import * as Device from "expo-device";
import { SecureStorageService } from "./SecureStorageService";

const ADMIN_TOKEN_KEY = "wasapeame.bot-admin-token";

export interface BotRule {
  id: string;
  trigger: string;
  matchType: "exact" | "contains" | "starts_with";
  responseMessage: string;
  enabled: boolean;
  templateId?: string;
  createdAt: string;
}

export interface BotStatus {
  enabled: boolean;
  ready: boolean;
  hasCredentials: boolean;
  rulesCount: number;
  verifyTokenConfigured: boolean;
  graphVersion: string;
  webhookUrl: string;
  missingCredentials: string[];
  machinery?: {
    enabled: boolean;
    catalogConfigured: boolean;
    businessName: string;
    salesAdminConfigured: boolean;
  };
}

export interface BotSimulationOption {
  id: string;
  title: string;
}

export interface BotSimulationResponse {
  replies: string[];
  options: BotSimulationOption[];
}

interface RulesResponse {
  rules: BotRule[];
}

interface PairDeviceResponse {
  accessToken: string;
}

async function parseError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (payload?.error) return payload.error;
  if (response.status === 401) return "La vinculación no es válida o fue revocada.";
  return payload?.error || `El servidor respondió ${response.status}.`;
}

export class BotAdminService {
  private static async request<T>(path: string, adminToken: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${BOT_SERVER_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    });
    if (!response.ok) throw new Error(await parseError(response));
    return await response.json() as T;
  }

  static getStoredAdminToken(): Promise<string | null> {
    return SecureStorageService.getItem(ADMIN_TOKEN_KEY);
  }

  static async storeAdminToken(token: string): Promise<void> {
    const saved = await SecureStorageService.setItem(ADMIN_TOKEN_KEY, token.trim());
    if (!saved) throw new Error("No se pudo guardar la clave de forma segura.");
  }

  static clearAdminToken(): Promise<boolean> {
    return SecureStorageService.deleteItem(ADMIN_TOKEN_KEY);
  }

  static async pairDevice(code: string): Promise<string> {
    const deviceName = Device.deviceName
      || [Device.brand, Device.modelName].filter(Boolean).join(" ")
      || "Dispositivo WASAPEA.ME";
    const response = await fetch(`${BOT_SERVER_URL}/api/bot/pair`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim(), deviceName })
    });
    if (!response.ok) throw new Error(await parseError(response));
    const payload = await response.json() as PairDeviceResponse;
    if (!payload.accessToken) throw new Error("El servidor no devolvió una vinculación válida.");
    return payload.accessToken;
  }

  static getStatus(adminToken: string): Promise<BotStatus> {
    return this.request<BotStatus>("/api/bot/status", adminToken);
  }

  static async getRules(adminToken: string): Promise<BotRule[]> {
    const payload = await this.request<RulesResponse>("/api/bot/rules", adminToken);
    return payload.rules;
  }

  static async saveRules(adminToken: string, rules: BotRule[]): Promise<BotRule[]> {
    const payload = await this.request<RulesResponse>("/api/bot/rules", adminToken, {
      method: "POST",
      body: JSON.stringify({ rules })
    });
    return payload.rules;
  }

  static async setEnabled(adminToken: string, enabled: boolean): Promise<boolean> {
    const payload = await this.request<{ enabled: boolean }>("/api/bot/toggle", adminToken, {
      method: "POST",
      body: JSON.stringify({ enabled })
    });
    return payload.enabled;
  }

  static simulate(adminToken: string, sessionId: string, message: string): Promise<BotSimulationResponse> {
    return this.request<BotSimulationResponse>("/api/bot/simulate", adminToken, {
      method: "POST",
      body: JSON.stringify({ sessionId, message })
    });
  }
}
