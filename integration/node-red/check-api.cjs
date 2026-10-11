// Teste integrado contra a instancia local. Reinicia apenas o estado virtual.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = "http://127.0.0.1:1880/api/v1/rooms/quarto-01/";
const records = [];
async function req(action, body, expected = 200) {
  const r = await fetch(root + action, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(6000),
  });
  const data = await r.json();
  assert.equal(r.status, expected, JSON.stringify(data));
  records.push({ action, status: r.status, data });
  return data;
}
const cmd = (c) => ({ commandId: "api-test", command: c });
(async () => {
  await req("reset", {});
  let a = await req("telemetry");
  await new Promise((resolve) => setTimeout(resolve, 2200));
  let b = await req("telemetry");
  assert.ok(b.sequence > a.sequence);
  b = await req("commands", cmd({ kind: "light", on: true, intensity: 25 }));
  assert.equal(b.commandId, "api-test");
  assert.equal(b.telemetry.lightIntensityPercent, 25);
  await req("commands", cmd({ kind: "light", on: true, intensity: 101 }), 400);
  assert.equal((await req("telemetry")).lightIntensityPercent, 25);
  await req("simulation", { scenario: "timeout" });
  await req("commands", cmd({ kind: "light", on: true, intensity: 50 }), 504);
  assert.equal((await req("telemetry")).lightIntensityPercent, 25);
  await req("simulation", { scenario: "stale" });
  await req("commands", cmd({ kind: "light", on: false, intensity: 0 }), 409);
  await req("simulation", { scenario: "offline" });
  await req("telemetry", undefined, 503);
  await req("simulation", {
    scenario: "normal",
    temperatureC: 30,
    humidityPercent: 70,
    gasRawAdc: 3628,
  });
  assert.equal((await req("telemetry")).gasStatus, "detected");
  await req("commands", cmd({ kind: "acknowledgeGas" }));
  assert.equal((await req("telemetry")).gasAcknowledged, true);
  await req("simulation", { gasRawAdc: 843 });
  assert.equal((await req("telemetry")).gasAcknowledged, false);
  const preflight = await fetch(root + "commands", {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:8082",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  assert.equal(
    preflight.headers.get("access-control-allow-origin"),
    "http://localhost:8082",
  );
  const foreign = await fetch(root + "telemetry", {
    headers: { Origin: "https://example.com" },
  });
  assert.equal(foreign.headers.get("access-control-allow-origin"), null);
  await req("reset", {});
  await req("commands", cmd({ kind: "light", on: true, intensity: 25 }));
  fs.writeFileSync(
    path.join(__dirname, "../../docs/evidencias/node-red/api-teste.json"),
    JSON.stringify(
      {
        date: new Date().toISOString(),
        result: "passed",
        cors: "local allowed; external origin not allowed",
        records,
      },
      null,
      2,
    ),
  );
  console.log(
    "API integrada: periodicidade, comandos, validacao, falhas, gas e CORS passaram.",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
