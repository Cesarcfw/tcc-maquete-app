import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { createApp } from "../server.mjs";
import { linkPhysicalDevice } from "../link-physical.mjs";
const { createPhysicalGateway } = createRequire(import.meta.url)(
  "../../integration/node-red/physical.cjs",
);

test("backend autenticado conecta leitura fisica e ACK, preserva permissoes e vinculo com backup", async () => {
  const dir = mkdtempSync(join(tmpdir(), "samahi-physical-api-"));
  const gateway = createPhysicalGateway();
  const p = {
    type: "network-test",
    source: "esp32-physical",
    deviceId: "ESP32-bancada",
    sequence: 1,
    uptimeMs: 2000,
    controlVersion: 2,
    pwm: true,
    gpio: 23,
    rgbControlVersion: 2,
    rgbReady: true,
    triageColor: "off",
    ledState: "off",
    lightIntensityPercent: 0,
    lastPositiveIntensity: 100,
    dhtVersion: 1,
    dhtPin: 4,
    temperatureValid: false,
    temperatureC: null,
    humidityValid: true,
    humidityPercent: 60,
    dhtSampleAgeMs: 0,
    gasVersion: 1,
    gasPin: 34,
    gasSensor: "MQ-2",
    gasAdcBits: 12,
    gasRawAdc: 400,
    gasSampleAgeMs: 0,
    gasThresholdConfigured: true,
    gasThresholdAdc: 500,
    gasClearThresholdAdc: 300,
    gasAlarmVersion: 1,
    gasAlarmActive: true,
    gasAlarmFault: false,
    rgbVisibleColor: "yellow",
    rgbBlinking: true,
    rgbAlarmFallback: true,
  };
  const incoming = (payload) =>
    gateway.ingest({ payload, ip: "192.0.2.34", port: 4211 });
  incoming(p);
  gateway.setSender((msg) => {
    const [prefix, id, action, value] = msg.payload.split(":");
    const ack = {
      source: p.source,
      deviceId: p.deviceId,
      commandId: id,
      status: "applied",
      action,
    };
    incoming(
      prefix === "led"
        ? {
            ...ack,
            type: "led-ack",
            gpio: 23,
            controlVersion: 2,
            lightIntensityPercent: Number(value),
            ledState: Number(value) > 0 ? "on" : "off",
            lastPositiveIntensity: Number(value) || 100,
          }
        : {
            ...ack,
            type: "triage-ack",
            triageColor: action,
            rgbControlVersion: 2,
            pins: [16, 17, 18],
          },
    );
  });
  const upstream = createServer(async (req, res) => {
    let data = "";
    for await (const part of req) data += part;
    const result = await gateway.handle(
      req.url.split("/").at(-1),
      "quarto-01",
      data ? JSON.parse(data) : undefined,
    );
    res.writeHead(result.status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result.body));
  });
  await new Promise((r) => upstream.listen(0, "127.0.0.1", r));
  let core, server, token;
  try {
    core = await createApp({
      dataDir: dir,
      nodeRedURL: `http://127.0.0.1:${upstream.address().port}`,
    });
    await core.bootstrap({
      name: "Teste fisico",
      email: "physical@test.invalid",
      password: "Physical-Test-Only-123!",
    });
    const linked = linkPhysicalDevice({
      file: join(dir, "samahi.sqlite"),
      backupDir: join(dir, "backups"),
    });
    assert.equal(linked.changed, true);
    assert.ok(linked.backup);
    assert.equal(
      linkPhysicalDevice({
        file: join(dir, "samahi.sqlite"),
        backupDir: join(dir, "backups"),
      }).changed,
      false,
    );
    server = core.app.listen(0, "127.0.0.1");
    await new Promise((r) => server.once("listening", r));
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
    token = (
      await request("/api/auth/sign-in/email", {
        email: "physical@test.invalid",
        password: "Physical-Test-Only-123!",
      })
    ).token;
    assert.ok(token);
    const read = await request("/api/rooms/quarto-01/telemetry");
    assert.equal(read.status, 200);
    assert.equal(read.data.temperatureC, null);
    assert.equal(read.data.gasStatus, "detected");
    assert.equal(read.data.gasRawAdc, 400);
    assert.equal(read.data.indicatorColor, "off");
    assert.equal(read.data.rgbVisibleColor, "yellow");
    let reply = await request("/api/rooms/quarto-01/commands", {
      commandId: "light",
      command: { kind: "light", on: true, intensity: 25 },
    });
    assert.equal(reply.status, 200);
    assert.equal(reply.data.status, "applied_in_hardware");
    reply = await request("/api/rooms/quarto-01/commands", {
      commandId: "recognize",
      command: { kind: "acknowledgeGas" },
    });
    assert.equal(reply.status, 200);
    assert.equal(reply.data.status, "acknowledged_in_gateway");
    assert.equal(reply.data.telemetry.gasAlarmActive, true);
    const admin = core.db
      .prepare("SELECT id FROM user WHERE email=?")
      .get("physical@test.invalid").id;
    core.db
      .prepare(
        "UPDATE grants SET level='none' WHERE user_id=? AND group_name='sensors'",
      )
      .run(admin);
    const limited = await request("/api/rooms/quarto-01/telemetry");
    assert.equal(limited.data.gasRawAdc, undefined);
    assert.equal(limited.data.temperatureC, undefined);
    assert.equal(
      (
        await request("/api/rooms/quarto-01/commands", {
          commandId: "denied",
          command: { kind: "acknowledgeGas" },
        })
      ).status,
      403,
    );
    const rows = (await request("/api/rooms/quarto-01/history")).data;
    assert.ok(rows.some((r) => r.action === "command_confirmed_hardware"));
    assert.ok(rows.some((r) => r.action === "gas_alert_acknowledged"));
  } finally {
    if (server) await new Promise((r) => server.close(r));
    gateway.close();
    if (core) core.db.close();
    await new Promise((r) => upstream.close(r));
    rmSync(dir, { recursive: true, force: true });
  }
});
