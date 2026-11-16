import { initialUsers, type DemoUser } from "./access";
import type { DeviceState } from "./maquette";
import {
  defaultLightingSchedule,
  lightingPeriod,
  validLightingSchedule,
} from "../../shared/lighting-schedule.cjs";

export function evaluationUsers(): DemoUser[] {
  return [
    {
      ...initialUsers()[0],
      id: "orientador-demo",
      name: "Orientador",
      email: "orientador@samahi.invalid",
    },
  ];
}

export function applyLocalLightingSchedule(
  device: DeviceState,
  now: number,
): DeviceState {
  if (
    device.lightMode !== "scheduled" ||
    !validLightingSchedule(device.lightingSchedule)
  )
    return device;
  const schedule = device.lightingSchedule!;
  const period = lightingPeriod(schedule, now);
  const intensity =
    period === "day" ? schedule.dayIntensity : schedule.nightIntensity;
  return {
    ...device,
    lightingPeriod: period,
    intensity,
    lightOn: intensity > 0,
    lastPositiveIntensity:
      intensity > 0 ? intensity : device.lastPositiveIntensity,
  };
}

export const localScheduleDefaults = defaultLightingSchedule;
