import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep, basename } from "node:path";
import { createServer, request as httpRequest } from "node:http";
import { createRequire } from "node:module";
import { createApp } from "../server.mjs";
import lighting from "../../shared/lighting-schedule.cjs";
const require = createRequire(import.meta.url);
const { createSimulator } = require("../../integration/node-red/simulator.cjs");

test("Cliente nativo Bearer: login, sensores, controles, gas, historico e logout sem Origin/Cookie", async () => {
  const directory = mkdtempSync(join(tmpdir(), "samahi-phone-"));
  const simulator = createSimulator();
  const upstream = createServer(async (req, res) => {
    let body = "";
    for await (const part of req) body += part;
    const match = /^\/api\/v1\/rooms\/([^/]+)\/(\w+)$/.exec(req.url || "");
    const result = match
      ? simulator.handle(match[2], match[1], body ? JSON.parse(body) : {})
      : { status: 404, body: {} };
    res.writeHead(result.status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result.body));
  });
  await new Promise((done) => upstream.listen(0, "127.0.0.1", done));
  let core, server;
  try {
    core = await createApp({
      dataDir: directory,
      nodeRedURL: `http://127.0.0.1:${upstream.address().port}`,
    });
    await core.bootstrap({
      name: "Teste nativo",
      email: "phone@test.invalid",
      password: "Ensaio-Nativo-123456!",
    });
    server = core.app.listen(0, process.env.SAMAHI_TEST_HOST || "127.0.0.1");
    await new Promise((done) => server.once("listening", done));
    const base = `http://${server.address().address}:${server.address().port}`;
    let token = null,
      id = 0;
    const request = async (path, body) => {
      // node:http nao acrescenta Sec-Fetch-Mode, diferentemente do fetch do Node.
      return new Promise((done, fail) => {
        const req = httpRequest(
          base + path,
          {
            method: body === undefined ? "GET" : "POST",
            headers: {
              ...(body === undefined
                ? {}
                : { "Content-Type": "application/json" }),
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
          (res) => {
            let raw = "";
            res.on("data", (chunk) => {
              raw += chunk;
            });
            res.on("end", () => {
              try {
                done({
                  status: res.statusCode,
                  data: JSON.parse(raw),
                  token: res.headers["set-auth-token"],
                });
              } catch (error) {
                fail(error);
              }
            });
          },
        );
        req.on("error", fail);
        req.setTimeout(8000, () =>
          req.destroy(new Error("Timeout do cliente nativo de teste")),
        );
        req.end(body === undefined ? undefined : JSON.stringify(body));
      });
    };
    const login = await request("/api/auth/sign-in/email", {
      email: "phone@test.invalid",
      password: "Ensaio-Nativo-123456!",
    });
    assert.equal(login.status, 200);
    assert.ok(login.token);
    token = login.token;
    assert.equal((await request("/api/me")).data.role, "admin");
    assert.equal((await request("/api/rooms")).data[0].id, "quarto-01");
    const route = "/api/rooms/quarto-01/";
    assert.equal((await request(route + "telemetry")).data.temperatureC, 24);
    async function command(value) {
      const commandId = `phone-${++id}`;
      const reply = await request(route + "commands", {
        commandId,
        command: value,
      });
      assert.equal(reply.status, 200);
      assert.equal(reply.data.commandId, commandId);
      assert.equal(reply.data.status, "applied_in_simulator");
      return reply.data.telemetry;
    }
    assert.equal(
      (await command({ kind: "light", on: true, intensity: 25 }))
        .lightIntensityPercent,
      25,
    );
    assert.equal(
      (await command({ kind: "light", on: false, intensity: 0 }))
        .lastPositiveIntensity,
      25,
    );
    assert.equal(
      (await command({ kind: "light", on: true, intensity: 25 })).lightOn,
      true,
    );
    await command({ kind: "indicator", color: "red" });
    const schedule = {
      ...lighting.defaultLightingSchedule(),
      dayIntensity: 35,
      nightIntensity: 35,
    };
    assert.equal(
      (await command({ kind: "lightingSchedule", enabled: true, schedule }))
        .lightIntensityPercent,
      35,
    );
    assert.equal(
      (await request(route + "telemetry")).data.lightMode,
      "scheduled",
    );
    simulator.handle("simulation", "quarto-01", { ldrRawAdc: 500 });
    simulator.sample();
    assert.equal(
      (await request(route + "telemetry")).data.lightIntensityPercent,
      35,
    );
    assert.equal(
      (await command({ kind: "light", on: false, intensity: 0 })).lightMode,
      "manual",
    );
    simulator.handle("simulation", "quarto-01", { gasRawAdc: 3000 });
    const alarm = (await request(route + "telemetry")).data;
    assert.equal(alarm.gasStatus, "detected");
    assert.equal(alarm.indicatorColor, "red");
    assert.equal(
      (await command({ kind: "acknowledgeGas" })).gasAcknowledged,
      true,
    );
    simulator.handle("simulation", "quarto-01", { gasRawAdc: 800 });
    assert.equal((await request(route + "telemetry")).data.gasStatus, "clear");
    const history = (await request(route + "history")).data;
    assert.ok(
      history.some((row) => row.action === "command_confirmed_simulator"),
    );
    assert.ok(history.some((row) => row.action === "gas_status_changed"));
    assert.equal((await request("/api/auth/sign-out", {})).status, 200);
    assert.equal((await request("/api/me")).status, 401);
  } finally {
    if (server) await new Promise((done) => server.close(done));
    core?.db.close();
    await new Promise((done) => upstream.close(done));
    const target = resolve(directory);
    if (
      !target.startsWith(resolve(tmpdir()) + sep) ||
      !basename(target).startsWith("samahi-phone-")
    )
      throw new Error("Diretorio temporario fora do escopo do teste.");
    rmSync(target, { recursive: true, force: true });
  }
});
