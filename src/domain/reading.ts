import type { Reading } from "../services/backend";
import {
  type DeviceState,
  type IndicatorColor,
  initialState,
} from "./maquette";
import { validLightingSchedule } from "../../shared/lighting-schedule.cjs";
const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const colors = ["red", "orange", "yellow", "green", "blue", "off"];
export function emptyReading(): DeviceState {
  return {
    ...initialState(0),
    temperature: null,
    humidity: null,
    gas: "unavailable",
    lightOn: false,
    intensity: 0,
    indicator: "off",
  };
}
export function decodeReading(t: Reading, now = Date.now()): DeviceState {
  if (
    !t ||
    !["node-red-simulator", "esp32-physical"].includes(t.source) ||
    !finite(t.sampleAgeMs) ||
    t.sampleAgeMs < 0
  )
    throw new Error("Origem ou idade da leitura inválida.");
  if (
    t.lightIntensityPercent !== undefined &&
    (!Number.isInteger(t.lightIntensityPercent) ||
      t.lightIntensityPercent < 0 ||
      t.lightIntensityPercent > 100 ||
      (t.lightOn !== undefined && t.lightOn !== t.lightIntensityPercent > 0))
  )
    throw new Error("Estado de iluminação inválido.");
  if (t.indicatorColor !== undefined && !colors.includes(t.indicatorColor))
    throw new Error("Cor de triagem inválida.");
  return {
    source: t.source,
    lightMode: t.lightMode,
    lightingSchedule: validLightingSchedule(t.lightingSchedule)
      ? t.lightingSchedule
      : undefined,
    lightingPeriod: t.lightingPeriod,
    lightingScheduleError: t.lightingScheduleError,
    temperature:
      t.temperatureValid !== false &&
      finite(t.temperatureC) &&
      t.temperatureC >= -40 &&
      t.temperatureC <= 80
        ? t.temperatureC
        : null,
    humidity:
      t.humidityValid !== false &&
      finite(t.humidityPercent) &&
      t.humidityPercent >= 0 &&
      t.humidityPercent <= 100
        ? t.humidityPercent
        : null,
    gas:
      t.gasStatus === "clear" || t.gasStatus === "detected"
        ? t.gasStatus
        : "unavailable",
    gasAcknowledged: t.gasAcknowledged === true,
    receivedAt: now - t.sampleAgeMs,
    lightOn: t.lightOn === true,
    intensity: t.lightIntensityPercent ?? 0,
    lastPositiveIntensity: t.lastPositiveIntensity ?? 100,
    indicator: (t.indicatorColor || "off") as IndicatorColor,
    gasRawAdc: finite(t.gasRawAdc) ? t.gasRawAdc : null,
    gasThresholdAdc: t.gasThresholdAdc,
    gasClearThresholdAdc: t.gasClearThresholdAdc,
    gasAlarmActive: t.gasAlarmActive,
    gasAlarmFault: t.gasAlarmFault,
    gasMonitoringConfigured: t.gasMonitoringConfigured,
    rgbVisibleColor: colors.includes(t.rgbVisibleColor || "")
      ? (t.rgbVisibleColor as IndicatorColor)
      : undefined,
    rgbBlinking: t.rgbBlinking,
    rgbAlarmFallback: t.rgbAlarmFallback,
  };
}
