const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const net = require("node:net");
const dgram = require("node:dgram");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function tcpPort() {
  const s = net.createServer();
  s.listen(0, "127.0.0.1");
  await once(s, "listening");
  const p = s.address().port;
  await new Promise((r) => s.close(r));
  return p;
}
async function udpPort() {
  const s = dgram.createSocket("udp4");
  s.bind(0, "127.0.0.1");
  await once(s, "listening");
  const p = s.address().port;
  s.close();
  return p;
}
test(
  "Node-RED fisico isolado: HTTP -> UDP -> ACK, sem fallback e sem tocar a placa real",
  { timeout: 45000 },
  async (t) => {
    const root = path.resolve(__dirname, "../..");
    const scratch = path.resolve(root, "../tmp/physical-api-tests");
    fs.mkdirSync(scratch, { recursive: true });
    const dir = fs.mkdtempSync(path.join(scratch, "case-")),
      uiPort = await tcpPort(),
      inputPort = await udpPort();
    let child,
      logs = "",
      socket,
      timer;
    t.after(async () => {
      clearInterval(timer);
      socket?.close();
      if (child && child.exitCode === null) {
        const end = once(child, "exit");
        child.kill();
        await end;
      }
      assert.ok(dir.startsWith(scratch + path.sep));
      fs.rmSync(dir, { recursive: true, force: true });
    });
    const nodes = JSON.parse(
      fs.readFileSync(path.join(__dirname, "physical-flows.json"), "utf8"),
    );
    nodes.push(
      { id: "esp32wifi12tab", type: "tab", label: "SOMENTE QA SINTETICO" },
      {
        id: "qa-udp-input",
        type: "udp in",
        z: "esp32wifi12tab",
        iface: "",
        port: String(inputPort),
        ipv: "udp4",
        multicast: "false",
        datatype: "utf8",
        wires: [["samahi-physical-bridge"]],
      },
      {
        id: "esp32led14out",
        type: "udp out",
        z: "esp32wifi12tab",
        addr: "",
        iface: "",
        port: "4211",
        ipv: "udp4",
        outport: String(inputPort),
        base64: false,
        multicast: "false",
        wires: [],
      },
    );
    fs.writeFileSync(path.join(dir, "flows.json"), JSON.stringify(nodes));
    fs.writeFileSync(
      path.join(dir, "settings.js"),
      "module.exports=" +
        JSON.stringify({
          uiHost: "127.0.0.1",
          uiPort,
          nodesDir: path.join(__dirname, "nodes"),
          flowFile: "flows.json",
          editorTheme: { projects: { enabled: false } },
          logging: { console: { level: "info" } },
        }),
    );
    let intensity = 0,
      indicator = "off",
      seq = 0,
      drop = false;
    const common = { source: "esp32-physical", deviceId: "ESP32-bancada" };
    socket = dgram.createSocket("udp4");
    socket.bind(4211, "127.0.0.1");
    await once(socket, "listening");
    const send = (p) => socket.send(JSON.stringify(p), inputPort, "127.0.0.1");
    socket.on("message", (buffer) => {
      if (drop) return;
      const [prefix, id, action, value] = buffer.toString().split(":");
      if (prefix === "led") {
        intensity = Number(value);
        send({
          ...common,
          type: "led-ack",
          commandId: id,
          status: "applied",
          action,
          controlVersion: 2,
          gpio: 23,
          lightIntensityPercent: intensity,
          ledState: intensity > 0 ? "on" : "off",
          lastPositiveIntensity: intensity || 100,
        });
      } else {
        indicator = action;
        send({
          ...common,
          type: "triage-ack",
          commandId: id,
          status: "applied",
          action,
          rgbControlVersion: 2,
          triageColor: indicator,
          pins: [16, 17, 18],
        });
      }
    });
    child = spawn(
      process.execPath,
      [
        path.resolve(root, "../samahi-node-red/node_modules/node-red/red.js"),
        "--userDir",
        dir,
        "--settings",
        path.join(dir, "settings.js"),
      ],
      { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
    );
    child.stdout.on("data", (b) => (logs += b));
    child.stderr.on("data", (b) => (logs += b));
    let ready = false;
    for (let i = 0; i < 150; i++) {
      if (child.exitCode !== null) assert.fail(logs);
      if (logs.includes("Started flows")) {
        ready = true;
        break;
      }
      await sleep(100);
    }
    assert.ok(ready, logs);
    const sample = () =>
      send({
        ...common,
        type: "network-test",
        sequence: ++seq,
        uptimeMs: seq * 2000,
        controlVersion: 2,
        pwm: true,
        gpio: 23,
        rgbControlVersion: 2,
        rgbReady: true,
        triageColor: indicator,
        ledState: intensity > 0 ? "on" : "off",
        lightIntensityPercent: intensity,
        lastPositiveIntensity: intensity || 100,
        dhtVersion: 1,
        dhtPin: 4,
        temperatureC: 25,
        temperatureValid: true,
        humidityPercent: 60,
        humidityValid: true,
        dhtSampleAgeMs: 0,
        gasVersion: 1,
        gasPin: 34,
        gasSensor: "MQ-2",
        gasAdcBits: 12,
        gasRawAdc: 400,
        gasSampleAgeMs: 0,
        gasAlarmVersion: 1,
        gasThresholdConfigured: true,
        gasThresholdAdc: 500,
        gasClearThresholdAdc: 300,
        gasAlarmActive: true,
        gasAlarmFault: false,
        rgbVisibleColor: "yellow",
        rgbBlinking: true,
        rgbAlarmFallback: indicator === "off",
      });
    const request = async (action, body) => {
      const response = await fetch(
        `http://127.0.0.1:${uiPort}/api/v1/rooms/quarto-01/${action}`,
        {
          method: body ? "POST" : "GET",
          headers: body ? { "Content-Type": "application/json" } : {},
          body: body ? JSON.stringify(body) : undefined,
        },
      );
      return { status: response.status, body: await response.json() };
    };
    assert.equal((await request("telemetry")).status, 503);
    sample();
    timer = setInterval(sample, 300);
    await sleep(150);
    assert.equal((await request("telemetry")).body.gasStatus, "detected");
    let result = await request("commands", {
      commandId: "qa-light",
      command: { kind: "light", on: true, intensity: 25 },
    });
    assert.equal(result.status, 200, JSON.stringify(result));
    assert.equal(result.body.status, "applied_in_hardware");
    assert.equal(intensity, 25);
    result = await request("commands", {
      commandId: "qa-color",
      command: { kind: "indicator", color: "blue" },
    });
    assert.equal(result.status, 200);
    assert.equal(indicator, "blue");
    result = await request("commands", {
      commandId: "qa-gas",
      command: { kind: "acknowledgeGas" },
    });
    assert.equal(result.body.status, "acknowledged_in_gateway");
    assert.equal(result.body.telemetry.gasAlarmActive, true);
    assert.equal((await request("simulation", {})).status, 405);
    drop = true;
    result = await request("commands", {
      commandId: "qa-timeout",
      command: { kind: "light", on: true, intensity: 75 },
    });
    assert.equal(result.status, 504);
    assert.equal(intensity, 25);
    assert.equal((await request("telemetry")).body.lightIntensityPercent, 25);
    // HTTP/UDP de teste em loopback. Nenhum pacote e enviado ao IP real do ESP.
  },
);
