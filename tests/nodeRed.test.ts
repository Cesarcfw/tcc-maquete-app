import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { decodeTelemetry } from "../src/services/nodeRed";
const { createSimulator } = createRequire(import.meta.url)(
  "../integration/node-red/simulator.cjs",
);
test("Node-RED confirma luz, preserva intensidade ao apagar e mantém Manchester independente do gás", () => {
  const sim = createSimulator();
  sim.sample();
  const send = (command: unknown) =>
    sim.handle("commands", "quarto-01", { commandId: "test-1", command });
  assert.equal(
    send({ kind: "light", on: true, intensity: 25 }).body.telemetry
      .lightIntensityPercent,
    25,
  );
  assert.equal(
    send({ kind: "light", on: false, intensity: 0 }).body.telemetry
      .lastPositiveIntensity,
    25,
  );
  assert.equal(send({ kind: "light", on: true, intensity: 101 }).status, 400);
  assert.equal(sim.telemetry().lightIntensityPercent, 0);
  send({ kind: "indicator", color: "orange" });
  sim.handle("simulation", "quarto-01", { gasRawAdc: 3628 });
  assert.equal(sim.telemetry().gasStatus, "detected");
  assert.equal(sim.telemetry().indicatorColor, "orange");
  send({ kind: "acknowledgeGas" });
  assert.equal(sim.telemetry().gasAcknowledged, true);
  sim.handle("simulation", "quarto-01", { gasRawAdc: 843 });
  assert.equal(sim.telemetry().gasAcknowledged, false);
});
test("Node-RED valida sensores e falhas; LDR não controla mais a iluminação", () => {
  let now = 1000;
  const sim = createSimulator(() => now);
  sim.sample();
  assert.equal(
    sim.handle("simulation", "quarto-01", { temperatureC: 30, gasRawAdc: 5000 })
      .status,
    400,
  );
  assert.equal(sim.telemetry().temperatureC, 24);
  sim.handle("simulation", "quarto-01", { ldrRawAdc: 4063 });
  assert.equal(sim.telemetry().lightIntensityPercent, 0);
  sim.handle("commands", "quarto-01", {
    commandId: "test-2",
    command: { kind: "light", on: true, intensity: 25 },
  });
  sim.handle("simulation", "quarto-01", { ldrRawAdc: 32 });
  assert.equal(sim.telemetry().lightIntensityPercent, 25);
  assert.equal(
    sim.handle("commands", "quarto-01", {
      commandId: "test-3",
      command: { kind: "automatic" },
    }).status,
    400,
  );
  assert.equal(sim.telemetry().lightIntensityPercent, 25);
  now += 11000;
  assert.equal(
    sim.handle("commands", "quarto-01", {
      commandId: "test-4",
      command: { kind: "light", on: true, intensity: 50 },
    }).status,
    409,
  );
  sim.handle("simulation", "quarto-01", { scenario: "offline" });
  assert.equal(sim.handle("telemetry", "quarto-01").status, 503);
  assert.equal(sim.handle("telemetry", "outro").status, 404);
});
test("adaptador rejeita sala errada, resposta malformada e estado inconsistente", () => {
  const sim = createSimulator();
  sim.sample();
  const value = sim.telemetry();
  assert.equal(decodeTelemetry(value, "quarto-01").gas, "clear");
  assert.throws(() => decodeTelemetry(value, "outro"));
  assert.throws(() =>
    decodeTelemetry({ ...value, lightOn: true }, "quarto-01"),
  );
  assert.throws(() =>
    decodeTelemetry({ ...value, sampleAgeMs: NaN }, "quarto-01"),
  );
});
