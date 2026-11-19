import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { decodeReading, emptyReading } from "../src/domain/reading";
import { confirmedReply } from "../shared/device-contract.cjs";
const { createPhysicalGateway } = createRequire(import.meta.url)(
  "../integration/node-red/physical.cjs",
);
const sample = {
  type: "network-test",
  source: "esp32-physical",
  deviceId: "ESP32-bancada",
  sequence: 10,
  uptimeMs: 20000,
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
  dhtSampleAgeMs: 0,
  temperatureC: 25,
  temperatureValid: true,
  humidityPercent: 60,
  humidityValid: true,
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
const incoming = (payload: unknown, ip = "192.0.2.34") => ({
  payload,
  ip,
  port: 4211,
});
test("ponte fisica nao fabrica leitura; preserva alerta com histerese e distingue triagem do amarelo temporario", async () => {
  let now = 1000;
  const g = createPhysicalGateway({ clock: () => now });
  assert.equal((await g.handle("telemetry", "quarto-01")).status, 503);
  assert.equal(
    g.ingest(incoming({ ...sample, source: "node-red-simulator" })),
    false,
  );
  assert.equal(g.ingest(incoming(sample)), true);
  let t = g.telemetry();
  assert.equal(t.source, "esp32-physical");
  assert.equal(t.gasStatus, "detected");
  assert.equal(t.indicatorColor, "off");
  assert.equal(t.rgbVisibleColor, "yellow");
  assert.equal(t.buzzerOn, false);
  const recognized = await g.handle("commands", "quarto-01", {
    commandId: "ack",
    command: { kind: "acknowledgeGas" },
  });
  assert.equal(recognized.body.status, "acknowledged_in_gateway");
  assert.equal(g.telemetry().gasAlarmActive, true);
  assert.equal(
    g.ingest(incoming({ ...sample, sequence: 9, uptimeMs: 19000 + 2000 })),
    false,
  );
  now += 11000;
  t = g.telemetry();
  assert.equal(t.sampleAgeMs, 11000);
  assert.equal(t.temperatureValid, false);
  assert.equal(
    (
      await g.handle("commands", "quarto-01", {
        commandId: "c",
        command: { kind: "indicator", color: "red" },
      })
    ).status,
    409,
  );
  g.close();
});
test("luz so muda apos ACK correlacionado; ACK errado/timeout nao aplica estado", async () => {
  const g = createPhysicalGateway({ ackTimeoutMs: 30 });
  g.ingest(incoming(sample));
  let wire: any;
  g.setSender((msg: unknown) => {
    wire = msg;
  });
  const wait = g.handle("commands", "quarto-01", {
    commandId: "app-command_with_long_id",
    command: { kind: "light", on: true, intensity: 25 },
  });
  assert.equal(g.telemetry().lightIntensityPercent, 0);
  const id = wire.payload.split(":")[1];
  assert.match(id, /^p-[a-f0-9]{24}$/);
  const ack = {
    type: "led-ack",
    source: sample.source,
    deviceId: sample.deviceId,
    commandId: id,
    status: "applied",
    action: "level",
    controlVersion: 2,
    gpio: 23,
    lightIntensityPercent: 25,
    ledState: "on",
    lastPositiveIntensity: 25,
  };
  assert.equal(g.ingest(incoming(ack, "192.0.2.99")), false);
  assert.equal(
    g.ingest(incoming({ ...ack, lightIntensityPercent: 50 })),
    false,
  );
  assert.equal(g.ingest(incoming(ack)), true);
  const result = await wait;
  assert.equal(result.body.status, "applied_in_hardware");
  assert.equal(g.telemetry().lightIntensityPercent, 25);
  assert.equal(
    confirmedReply(result.body, "app-command_with_long_id", "light"),
    true,
  );
  const timed = await g.handle("commands", "quarto-01", {
    commandId: "timeout",
    command: { kind: "indicator", color: "red" },
  });
  assert.equal(timed.status, 504);
  assert.equal(g.telemetry().indicatorColor, "off");
  g.close();
});
test("indicador aceita quatro cores; agenda confirma luz fisica e modo; erros nao usam simulacao", async () => {
  let saved: any;
  const g = createPhysicalGateway({
    storage: {
      load: () => null,
      save: (v: unknown) => {
        saved = v;
      },
    },
  });
  g.ingest(incoming(sample));
  g.setSender((msg: any) => {
    const [prefix, id, action, value] = msg.payload.split(":");
    if (prefix === "triage")
      g.ingest(
        incoming({
          type: "triage-ack",
          source: sample.source,
          deviceId: sample.deviceId,
          commandId: id,
          status: "applied",
          action,
          triageColor: action,
          rgbControlVersion: 2,
          pins: [16, 17, 18],
        }),
      );
    else
      g.ingest(
        incoming({
          type: "led-ack",
          source: sample.source,
          deviceId: sample.deviceId,
          commandId: id,
          status: "applied",
          action,
          controlVersion: 2,
          gpio: 23,
          lightIntensityPercent: Number(value),
          ledState: Number(value) > 0 ? "on" : "off",
          lastPositiveIntensity: Number(value) || 100,
        }),
      );
  });
  assert.equal(
    (
      await g.handle("commands", "quarto-01", {
        commandId: "bad",
        command: { kind: "indicator", color: "orange" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await g.handle("commands", "quarto-01", {
        commandId: "red",
        command: { kind: "indicator", color: "red" },
      })
    ).status,
    200,
  );
  const schedule = {
    timeZone: "America/Sao_Paulo",
    dayStart: "07:00",
    nightStart: "19:00",
    dayIntensity: 100,
    nightIntensity: 20,
  };
  const result = await g.handle("commands", "quarto-01", {
    commandId: "schedule",
    command: { kind: "lightingSchedule", enabled: true, schedule },
  });
  assert.equal(result.status, 200);
  assert.equal(saved.mode, "scheduled");
  assert.equal(result.body.telemetry.lightMode, "scheduled");
  assert.equal((await g.handle("simulation", "quarto-01", {})).status, 405);
  g.close();
});
test("decodificacao nao troca falha do DHT por zero nem origem fisica por simulada", () => {
  assert.equal(emptyReading().temperature, null);
  const g = createPhysicalGateway();
  g.ingest(
    incoming({ ...sample, temperatureValid: false, temperatureC: null }),
  );
  const device = decodeReading(g.telemetry());
  assert.equal(device.temperature, null);
  assert.equal(device.humidity, 60);
  assert.equal(device.rgbAlarmFallback, true);
  assert.equal(device.source, "esp32-physical");
  assert.equal(
    confirmedReply(
      {
        commandId: "x",
        status: "applied_in_simulator",
        telemetry: { source: "esp32-physical" },
      },
      "x",
      "light",
    ),
    false,
  );
  g.close();
});
