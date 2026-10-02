import assert from "node:assert/strict";
import test from "node:test";
import { applyCommand, initialState } from "../src/domain/maquette";

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
