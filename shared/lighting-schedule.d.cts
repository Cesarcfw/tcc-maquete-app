export type LightingSchedule = {
  timeZone: "America/Sao_Paulo";
  dayStart: string;
  nightStart: string;
  dayIntensity: number;
  nightIntensity: number;
};
export const TIME_ZONE: "America/Sao_Paulo";
export function defaultLightingSchedule(): LightingSchedule;
export function validLightingSchedule(
  value: unknown,
): value is LightingSchedule;
export function lightingPeriod(
  schedule: LightingSchedule,
  timestamp: number,
): "day" | "night";
