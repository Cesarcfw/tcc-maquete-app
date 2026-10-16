import {
  Command,
  DeviceState,
  GasStatus,
  IndicatorColor,
} from "../domain/maquette";
import {
  validLightingSchedule,
  type LightingSchedule,
} from "../../shared/lighting-schedule.cjs";
export type Telemetry = {
  lightMode?: "manual" | "scheduled";
  lightingSchedule?: LightingSchedule;
  lightingPeriod?: "day" | "night" | null;
  source: "node-red-simulator";
  roomId: string;
  temperatureC: number;
  humidityPercent: number;
  gasStatus: GasStatus;
  gasAcknowledged: boolean;
  sampleAgeMs: number;
  lightOn: boolean;
  lightIntensityPercent: number;
  lastPositiveIntensity: number;
  indicatorColor: IndicatorColor;
};
export function decodeTelemetry(value: unknown, roomId: string): DeviceState {
  const t = value as Telemetry;
  if (
    !t ||
    t.source !== "node-red-simulator" ||
    t.roomId !== roomId ||
    !Number.isFinite(t.temperatureC) ||
    !Number.isFinite(t.humidityPercent) ||
    !Number.isFinite(t.sampleAgeMs) ||
    t.sampleAgeMs < 0 ||
    !Number.isInteger(t.lightIntensityPercent) ||
    t.lightIntensityPercent < 0 ||
    t.lightIntensityPercent > 100 ||
    !Number.isInteger(t.lastPositiveIntensity) ||
    t.lastPositiveIntensity < 1 ||
    t.lastPositiveIntensity > 100 ||
    typeof t.lightOn !== "boolean" ||
    t.lightOn !== t.lightIntensityPercent > 0 ||
    typeof t.gasAcknowledged !== "boolean" ||
    !["clear", "detected", "unavailable"].includes(t.gasStatus) ||
    !["red", "orange", "yellow", "green", "blue", "off"].includes(
      t.indicatorColor,
    )
  )
    throw new Error("Telemetria incompatível com este ambiente.");
  return {
    lightMode: t.lightMode,
    lightingSchedule: validLightingSchedule(t.lightingSchedule)
      ? t.lightingSchedule
      : undefined,
    lightingPeriod: t.lightingPeriod,
    temperature: t.temperatureC,
    humidity: t.humidityPercent,
    gas: t.gasStatus,
    gasAcknowledged: t.gasAcknowledged,
    receivedAt: Date.now() - t.sampleAgeMs,
    lightOn: t.lightOn,
    intensity: t.lightIntensityPercent,
    lastPositiveIntensity: t.lastPositiveIntensity,
    indicator: t.indicatorColor,
  };
}
export async function requestNodeRed(
  endpoint: string,
  roomId: string,
  action: string,
  body?: unknown,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(
      `${endpoint.replace(/\/$/, "")}/api/v1/rooms/${encodeURIComponent(roomId)}/${action}`,
      {
        method: body === undefined ? "GET" : "POST",
        signal: controller.signal,
        headers:
          body === undefined ? {} : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || `Erro HTTP ${response.status}`);
    return result;
  } finally {
    clearTimeout(timer);
  }
}
export async function sendNodeRedCommand(
  endpoint: string,
  roomId: string,
  command:
    | Command
    | { kind: "acknowledgeGas" }
    | {
        kind: "lightingSchedule";
        enabled: boolean;
        schedule: LightingSchedule;
      },
  commandId: string,
) {
  const result = await requestNodeRed(endpoint, roomId, "commands", {
    commandId,
    command,
  });
  if (
    result.commandId !== commandId ||
    result.status !== "applied_in_simulator"
  )
    throw new Error("Confirmação inválida.");
  return decodeTelemetry(result.telemetry, roomId);
}
