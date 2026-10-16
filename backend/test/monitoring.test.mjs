import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join, sep, basename } from "node:path";
import { createApp } from "../server.mjs";

test("Gás e perda/retorno persistem sem duplicar por consulta, cliente ou reinício", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "samahi-monitoring-"));
  const telemetry = {
    roomId: "quarto-01",
    deviceId: "ESP32-quarto-01",
    source: "node-red-simulator",
    sampleAgeMs: 0,
    gasStatus: "clear",
  };
  const upstream = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(telemetry));
  });
  await new Promise((done) => upstream.listen(0, "127.0.0.1", done));
  const port = upstream.address().port;
  const options = { dataDir, nodeRedURL: `http://127.0.0.1:${port}` };
  let core, server, token;
  const start = async () => {
    core = await createApp(options);
    server = core.app.listen(0, "127.0.0.1");
    await new Promise((done) => server.once("listening", done));
  };
  const request = async (path, body) => {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}${path}`,
      {
        method: body ? "POST" : "GET",
        headers: {
          Origin: "http://localhost:8081",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    );
    return {
      status: response.status,
      data: await response.json(),
      token: response.headers.get("set-auth-token"),
    };
  };
  const reading = () => request("/api/rooms/quarto-01/telemetry");
  const history = async () =>
    (await request("/api/rooms/quarto-01/history")).data;
  const count = (rows, action) =>
    rows.filter((row) => row.action === action).length;
  try {
    await start();
    await core.bootstrap({
      name: "Monitoramento",
      email: "monitoring@test.invalid",
      password: "Monitoring-123456!",
    });
    token = (
      await request("/api/auth/sign-in/email", {
        email: "monitoring@test.invalid",
        password: "Monitoring-123456!",
      })
    ).token;
    assert.ok(token);
    assert.equal((await reading()).status, 200);
    assert.equal(count(await history(), "communication_restored"), 0);
    telemetry.gasStatus = "detected";
    await Promise.all([reading(), reading(), reading()]);
    let rows = await history();
    assert.equal(
      rows.filter(
        (row) =>
          row.action === "gas_status_changed" &&
          row.detail.current === "detected",
      ).length,
      1,
    );
    telemetry.gasStatus = "unavailable";
    await reading();
    await reading();
    assert.equal(
      (await history()).filter(
        (row) =>
          row.action === "gas_status_changed" &&
          row.detail.current === "unavailable",
      ).length,
      1,
    );
    telemetry.gasStatus = "clear";
    await reading();
    const gasCount = count(await history(), "gas_status_changed");

    telemetry.sampleAgeMs = 10000;
    telemetry.gasStatus = "detected";
    await reading();
    await reading();
    rows = await history();
    assert.equal(count(rows, "telemetry_stale"), 1);
    assert.equal(
      count(rows, "gas_status_changed"),
      gasCount,
      "amostra antiga não cria nova detecção",
    );
    assert.equal(
      JSON.parse(
        core.db
          .prepare("SELECT payload FROM latest_readings WHERE room_id=?")
          .get("quarto-01").payload,
      ).gasStatus,
      "clear",
    );
    telemetry.sampleAgeMs = 0;
    telemetry.gasStatus = "clear";
    await reading();
    await reading();
    assert.equal(count(await history(), "communication_restored"), 1);

    await new Promise((done) => upstream.close(done));
    assert.equal((await reading()).status, 503);
    assert.equal((await reading()).status, 503);
    assert.equal(count(await history(), "communication_lost"), 1);
    await new Promise((done) => server.close(done));
    server = null;
    core.db.close();
    core = null;
    await start();
    assert.equal((await reading()).status, 503);
    assert.equal(
      count(await history(), "communication_lost"),
      1,
      "reinício não duplica falha persistida",
    );
    await new Promise((done) => upstream.listen(port, "127.0.0.1", done));
    assert.equal((await reading()).status, 200);
    await reading();
    rows = await history();
    assert.equal(count(rows, "communication_restored"), 2);
    assert.equal(count(rows, "communication_lost"), 1);
  } finally {
    if (server) await new Promise((done) => server.close(done));
    core?.db.close();
    if (upstream.listening) await new Promise((done) => upstream.close(done));
    const target = resolve(dataDir);
    if (
      !target.startsWith(resolve(tmpdir()) + sep) ||
      !basename(target).startsWith("samahi-monitoring-")
    )
      throw new Error("Diretório temporário fora do escopo.");
    rmSync(target, { recursive: true, force: true });
  }
});
