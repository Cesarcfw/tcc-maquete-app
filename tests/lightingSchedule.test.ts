import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep, basename } from "node:path";
import {
  defaultLightingSchedule,
  validLightingSchedule,
  lightingPeriod,
} from "../shared/lighting-schedule.cjs";
const { createSimulator, fileStorage } = createRequire(import.meta.url)(
  "../integration/node-red/simulator.cjs",
);

test("Dia/Noite usa Brasília nos limites, na madrugada e em intervalos que cruzam meia-noite", () => {
  const schedule = defaultLightingSchedule();
  for (const [iso, period] of [
    ["2026-10-16T09:59:59Z", "night"], // 06:59 Brasília
    ["2026-10-16T10:00:00Z", "day"],
    ["2026-10-16T21:59:59Z", "day"],
    ["2026-10-16T22:00:00Z", "night"],
    ["2026-10-17T02:59:59Z", "night"],
    ["2026-10-17T03:00:00Z", "night"],
  ])
    assert.equal(lightingPeriod(schedule, Date.parse(iso)), period, iso);
  const overnight = { ...schedule, dayStart: "22:00", nightStart: "06:00" };
  assert.equal(
    lightingPeriod(overnight, Date.parse("2026-10-17T03:00:00Z")),
    "day",
  );
  assert.equal(
    lightingPeriod(overnight, Date.parse("2026-10-17T09:00:00Z")),
    "night",
  );
  for (const patch of [
    { dayStart: "24:00" },
    { nightStart: "7:00" },
    { nightStart: "07:00" },
    { dayIntensity: 101 },
    { nightIntensity: -1 },
    { dayIntensity: 20.5 },
    { timeZone: "UTC" },
  ])
    assert.equal(validLightingSchedule({ ...schedule, ...patch }), false);
});

test("programação muda sem app, manual pausa, zero apaga e gás/Manchester permanecem independentes", () => {
  let now = Date.parse("2026-10-16T09:59:59Z");
  const sim = createSimulator(() => now);
  const schedule = {
    ...defaultLightingSchedule(),
    dayIntensity: 80,
    nightIntensity: 0,
  };
  const send = (command: unknown) =>
    sim.handle("commands", "quarto-01", {
      commandId: "schedule-test",
      command,
    });
  sim.sample();
  let reply = send({ kind: "lightingSchedule", enabled: true, schedule });
  assert.equal(reply.status, 200);
  assert.equal(reply.body.telemetry.lightIntensityPercent, 0);
  now = Date.parse("2026-10-16T10:00:00Z");
  sim.sample();
  assert.equal(sim.telemetry().lightIntensityPercent, 80);
  sim.handle("simulation", "quarto-01", { gasRawAdc: 3000, ldrRawAdc: 4000 });
  assert.equal(sim.telemetry().lightIntensityPercent, 80);
  assert.equal(sim.telemetry().gasStatus, "detected");
  assert.equal(sim.telemetry().indicatorColor, "blue");
  assert.equal(
    send({ kind: "light", on: true, intensity: 25 }).body.telemetry.lightMode,
    "manual",
  );
  now = Date.parse("2026-10-16T22:00:00Z");
  sim.sample();
  assert.equal(sim.telemetry().lightIntensityPercent, 25);
  reply = send({ kind: "lightingSchedule", enabled: true, schedule });
  assert.equal(reply.body.telemetry.lightOn, false);
  assert.equal(reply.body.telemetry.lastPositiveIntensity, 25);
  assert.equal(
    send({
      kind: "lightingSchedule",
      enabled: true,
      schedule: { ...schedule, nightStart: schedule.dayStart },
    }).status,
    400,
  );
  assert.equal(sim.telemetry().lightingSchedule.nightStart, "19:00");
});

test("horários persistem ao recriar o serviço; erro de gravação não confirma nem altera estado", () => {
  const dir = mkdtempSync(join(tmpdir(), "samahi-lighting-"));
  try {
    let now = Date.parse("2026-10-16T12:00:00Z");
    const storage = fileStorage(join(dir, "lighting.json"));
    const sim = createSimulator(() => now, storage);
    const schedule = { ...defaultLightingSchedule(), nightIntensity: 15 };
    assert.equal(
      sim.handle("commands", "quarto-01", {
        commandId: "persist-1",
        command: { kind: "lightingSchedule", enabled: true, schedule },
      }).status,
      200,
    );
    now = Date.parse("2026-10-16T23:00:00Z");
    const restored = createSimulator(() => now, storage);
    assert.equal(restored.telemetry().lightIntensityPercent, 15);
    assert.equal(restored.telemetry().lightMode, "scheduled");
    assert.equal(restored.telemetry().lightingSchedule.nightIntensity, 15);
    restored.handle("commands", "quarto-01", {
      commandId: "persist-2",
      command: { kind: "light", on: true, intensity: 30 },
    });
    assert.equal(
      createSimulator(() => now, storage).telemetry().lightMode,
      "manual",
    );
    const failed = createSimulator(() => now, {
      load: () => null,
      save: () => {
        throw new Error("Disk failure");
      },
    });
    assert.equal(
      failed.handle("commands", "quarto-01", {
        commandId: "fail",
        command: { kind: "lightingSchedule", enabled: true, schedule },
      }).status,
      503,
    );
    assert.equal(failed.telemetry().lightMode, "manual");
  } finally {
    const target = resolve(dir);
    if (
      !target.startsWith(resolve(tmpdir()) + sep) ||
      !basename(target).startsWith("samahi-lighting-")
    )
      throw new Error("Diretório temporário fora do escopo");
    rmSync(target, { recursive: true, force: true });
  }
});
