import assert from "node:assert/strict";
import test from "node:test";
import {
  applyCommand,
  initialState,
  applyGasReading,
  acknowledgeGas,
} from "../src/domain/maquette";

test("comandos de luz e Manchester preservam a detecção de gás independente", () => {
  const state = { ...initialState(0), gas: "detected" as const };
  assert.equal(
    applyCommand(state, { kind: "light", on: false, intensity: 0 }).gas,
    "detected",
  );
  assert.equal(
    applyCommand(state, { kind: "indicator", color: "blue" }).gas,
    "detected",
  );
});
test("detectar e reconhecer gás preservam triagem; nova ocorrência exige reconhecimento", () => {
  const state = { ...initialState(0), indicator: "green" as const };
  const detected = applyGasReading(state, "detected");
  assert.equal(detected.indicator, "green");
  const acknowledged = acknowledgeGas(detected);
  assert.equal(acknowledged.gas, "detected");
  assert.equal(acknowledged.indicator, "green");
  assert.equal(acknowledged.gasAcknowledged, true);
  assert.equal(applyGasReading(acknowledged, "detected").gasAcknowledged, true);
  const cleared = applyGasReading(acknowledged, "clear");
  assert.equal(applyGasReading(cleared, "detected").gasAcknowledged, false);
});
