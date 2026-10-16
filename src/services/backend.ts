import { Platform } from "react-native";
import type { LightingSchedule } from "../../shared/lighting-schedule.cjs";

export type Account = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned?: boolean;
  grants?: Record<string, Partial<Grants>>;
};
export type AccessLevel = "none" | "read" | "control";
export type Grants = Record<
  "light" | "sensors" | "indicator" | "history",
  AccessLevel
>;
export type SavedRoom = {
  id: string;
  name: string;
  bed: string;
  wing: string;
  device: string;
  active: number;
  grants: Partial<Grants>;
};
export type Reading = {
  lightMode?: "manual" | "scheduled";
  lightingSchedule?: LightingSchedule;
  lightingPeriod?: "day" | "night" | null;
  source: string;
  sampleAgeMs: number;
  deviceId: string;
  roomId: string;
  temperatureC?: number;
  humidityPercent?: number;
  gasStatus?: string;
  gasAcknowledged?: boolean;
  lightOn?: boolean;
  lightIntensityPercent?: number;
  lastPositiveIntensity?: number;
  indicatorColor?: string;
};
export type Audit = {
  id: number;
  at: string;
  actor: string;
  action: string;
  detail: unknown;
};
export class BackendError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export { backendAddress } from "../domain/backendAddress";
export async function backendRequest<T>(
  base: string,
  path: string,
  token: string | null,
  body?: unknown,
  method?: string,
): Promise<{ data: T; token: string | null }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${base}${path}`, {
      method: method || (body === undefined ? "GET" : "POST"),
      // No nativo, a sessao usa somente Bearer, sem cookies do navegador.
      credentials: Platform.OS === "web" ? "include" : "omit",
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) {
      // Tradução de mensagens do serviço legado; status e contrato preservados.
      const serviceMessages: Record<string, string> = {
        "Ambiente nao cadastrado no simulador.":
          "Ambiente não cadastrado no serviço.",
        "Dispositivo virtual sem comunicacao.":
          "Sem comunicação com o serviço do ambiente.",
        "Comando nao confirmado no cenario de teste.":
          "O serviço não confirmou o comando.",
      };
      throw new BackendError(
        serviceMessages[data.error] ||
          data.error ||
          (path.startsWith("/api/auth/")
            ? response.status === 429
              ? "Muitas tentativas. Aguarde um minuto antes de tentar novamente."
              : "Não foi possível autenticar ou alterar a senha. Confira os dados e o estado da conta."
            : data.message) ||
          "Não foi possível concluir a solicitação.",
        response.status,
      );
    }
    return { data, token: response.headers.get("set-auth-token") };
  } finally {
    clearTimeout(timeout);
  }
}
