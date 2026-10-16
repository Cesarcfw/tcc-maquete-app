import test from "node:test";
import assert from "node:assert/strict";
import { describeAuditEvent } from "../src/domain/history";

test("histórico classifica gás, falhas e recuperação sem confundir confirmações", () => {
  for (const current of ["detected", "unavailable"])
    assert.equal(
      describeAuditEvent("gas_status_changed", { current }).type,
      "error",
    );
  assert.match(
    describeAuditEvent("gas_status_changed", { current: "detected" }).message,
    /Gás detectado/,
  );
  assert.equal(
    describeAuditEvent("gas_status_changed", { current: "clear" }).type,
    "info",
  );
  for (const action of [
    "communication_lost",
    "telemetry_stale",
    "command_unconfirmed",
  ])
    assert.equal(describeAuditEvent(action, {}).type, "error");
  assert.equal(describeAuditEvent("communication_restored", {}).type, "info");
  assert.equal(
    describeAuditEvent("command_confirmed_simulator", {}).type,
    "success",
  );
  assert.equal(describeAuditEvent("gas_status_changed", null).type, "info");
  assert.equal(
    describeAuditEvent("unknown", null).message,
    "Registro do ambiente",
  );
});
