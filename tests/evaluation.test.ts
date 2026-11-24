import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluationUsers,
  applyLocalLightingSchedule,
  localScheduleDefaults,
} from "../src/domain/evaluation";
import { initialState } from "../src/domain/maquette";
import { canAccess } from "../src/domain/access";

test("conta da avaliação é local e tem as permissões necessárias no quarto", () => {
  const users = evaluationUsers();
  assert.equal(users.length, 1);
  assert.equal(users[0].id, "orientador-demo");
  assert.equal(users[0].name, "Orientador");
  assert.equal(canAccess(users[0], "quarto-01", "light", "control"), true);
  assert.equal(canAccess(users[0], "quarto-01", "indicator", "control"), true);
  assert.equal(canAccess(users[0], "quarto-01", "sensors", "read"), true);
  assert.equal(canAccess(users[0], "quarto-01", "sensors", "control"), false);
});
test("Dia/Noite local altera intensidade e deixa zero apagado sem depender de servidor", () => {
  const schedule = {
    ...localScheduleDefaults(),
    dayIntensity: 45,
    nightIntensity: 0,
  };
  const device = {
    ...initialState(),
    lightMode: "scheduled" as const,
    lightingSchedule: schedule,
  };
  const day = applyLocalLightingSchedule(
    device,
    Date.parse("2026-11-16T15:00:00Z"),
  );
  assert.equal(day.intensity, 45);
  assert.equal(day.lightingPeriod, "day");
  const night = applyLocalLightingSchedule(
    day,
    Date.parse("2026-11-17T02:00:00Z"),
  );
  assert.equal(night.intensity, 0);
  assert.equal(night.lightOn, false);
  assert.equal(night.lastPositiveIntensity, 45);
  const manual = { ...day, lightMode: "manual" as const };
  assert.equal(
    applyLocalLightingSchedule(manual, Date.parse("2026-11-17T02:00:00Z")),
    manual,
  );
});
