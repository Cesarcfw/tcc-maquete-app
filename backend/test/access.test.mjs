import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { createApp } from "../server.mjs";
import lighting from "../../shared/lighting-schedule.cjs";

test("Login, persistência, permissões por quarto, confirmação e revogação", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "samahi-auth-test-"));
  const telemetry = {
    roomId: "quarto-01",
    deviceId: "ESP32-quarto-01",
    source: "node-red-simulator",
    sampleAgeMs: 0,
    temperatureC: 24,
    humidityPercent: 40,
    lightOn: false,
    lightIntensityPercent: 0,
    lastPositiveIntensity: 65,
    indicatorColor: "blue",
    lightingSchedule: lighting.defaultLightingSchedule(),
    lightMode: "manual",
  };
  let forwarded = 0;
  const upstream = createServer(async (req, res) => {
    let body = "";
    for await (const c of req) body += c;
    res.setHeader("Content-Type", "application/json");
    if (body) {
      forwarded++;
      const command = JSON.parse(body);
      res.end(
        JSON.stringify({
          commandId: command.commandId,
          status: "applied_in_simulator",
          telemetry,
        }),
      );
    } else res.end(JSON.stringify(telemetry));
  });
  await new Promise((resolve) => upstream.listen(0, "127.0.0.1", resolve));
  const options = {
    dataDir,
    nodeRedURL: `http://127.0.0.1:${upstream.address().port}`,
  };
  let core = await createApp(options);
  let server;
  const password = "SenhaDeTeste-Exclusiva-123!";
  try {
    await core.bootstrap({
      name: "Admin teste",
      email: "admin@test.invalid",
      password,
    });
    server = core.app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const request = async (path, method = "GET", body, token) => {
      const response = await fetch(
        `http://127.0.0.1:${server.address().port}${path}`,
        {
          method,
          headers: {
            Origin: "http://localhost:8081",
            ...(body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        },
      );
      const data = await response.json();
      return {
        status: response.status,
        data,
        token: response.headers.get("set-auth-token"),
      };
    };
    assert.equal((await request("/api/rooms")).status, 401);
    assert.equal(
      (
        await request("/api/auth/sign-up/email", "POST", {
          email: "rogue@test.invalid",
          password,
          name: "Intruso",
          role: "admin",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/api/auth/sign-in/email", "POST", {
          email: "admin@test.invalid",
          password: "senhaerrada",
        })
      ).status,
      401,
    );
    const login = await request("/api/auth/sign-in/email", "POST", {
      email: "admin@test.invalid",
      password,
    });
    assert.equal(login.status, 200);
    assert.ok(login.token);
    const token = login.token;
    assert.equal(
      (await request("/api/me", "GET", undefined, token)).data.role,
      "admin",
    );
    const created = await request(
      "/api/users",
      "POST",
      { name: "Leitor teste", email: "reader@test.invalid", password },
      token,
    );
    assert.equal(created.status, 201, JSON.stringify(created.data));
    const reader = await request("/api/auth/sign-in/email", "POST", {
      email: "reader@test.invalid",
      password,
    });
    assert.ok(reader.token);
    assert.equal(
      (await request("/api/rooms", "GET", undefined, reader.token)).data.length,
      0,
    );
    assert.equal(
      (await request("/api/users", "GET", undefined, reader.token)).status,
      403,
    );
    assert.equal(
      (
        await request(
          "/api/rooms/quarto-01/telemetry",
          "GET",
          undefined,
          reader.token,
        )
      ).status,
      404,
    );
    const grants = {
      sensors: "read",
      light: "none",
      indicator: "none",
      history: "none",
    };
    assert.equal(
      (
        await request(
          `/api/users/${created.data.id}/grants/quarto-01`,
          "PUT",
          grants,
          token,
        )
      ).status,
      200,
    );
    const sensor = await request(
      "/api/rooms/quarto-01/telemetry",
      "GET",
      undefined,
      reader.token,
    );
    assert.equal(sensor.data.temperatureC, 24);
    assert.equal(sensor.data.lightOn, undefined);
    assert.equal(sensor.data.lightingSchedule, undefined);
    assert.equal(
      (
        await request(
          "/api/rooms/quarto-01/commands",
          "POST",
          {
            commandId: "reader-schedule",
            command: {
              kind: "lightingSchedule",
              enabled: true,
              schedule: lighting.defaultLightingSchedule(),
            },
          },
          reader.token,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await request(
          "/api/rooms/quarto-01/commands",
          "POST",
          {
            commandId: "invalid-schedule",
            command: {
              kind: "lightingSchedule",
              enabled: true,
              schedule: {
                ...lighting.defaultLightingSchedule(),
                nightStart: "07:00",
              },
            },
          },
          token,
        )
      ).status,
      400,
    );
    assert.equal(sensor.data.indicatorColor, undefined);
    const command = {
      commandId: "teste-1",
      command: { kind: "light", on: true, intensity: 25 },
    };
    assert.equal(
      (
        await request(
          "/api/rooms/quarto-01/commands",
          "POST",
          command,
          reader.token,
        )
      ).status,
      403,
    );
    assert.equal(forwarded, 0);
    assert.equal(
      (
        await request(
          "/api/rooms/quarto-01/history",
          "GET",
          undefined,
          reader.token,
        )
      ).status,
      403,
    );
    const ack = await request(
      "/api/rooms/quarto-01/commands",
      "POST",
      command,
      token,
    );
    assert.equal(ack.status, 200, JSON.stringify(ack.data));
    assert.equal(ack.data.status, "applied_in_simulator");
    assert.equal(
      (await request("/api/rooms/quarto-01/commands", "POST", command, token))
        .status,
      200,
    );
    assert.equal(forwarded, 1);
    // Um serviço que só devolve ACK genérico sem aplicar a configuração não confirma sucesso.
    assert.equal(
      (
        await request(
          "/api/rooms/quarto-01/commands",
          "POST",
          {
            commandId: "bad-schedule-ack",
            command: {
              kind: "lightingSchedule",
              enabled: true,
              schedule: lighting.defaultLightingSchedule(),
            },
          },
          token,
        )
      ).status,
      502,
    );
    assert.equal(
      (
        await request(
          "/api/rooms/quarto-01/commands",
          "POST",
          { ...command, command: { kind: "light", on: true, intensity: 50 } },
          token,
        )
      ).status,
      409,
    );
    assert.equal(
      (
        await request(
          "/api/rooms",
          "POST",
          {
            id: "quarto-02",
            name: "Segundo quarto",
            bed: "L-02",
            wing: "Teste",
            device: "ESP32-02",
            active: true,
          },
          token,
        )
      ).status,
      201,
    );
    assert.equal(
      (
        await request(
          "/api/rooms",
          "POST",
          {
            id: "quarto-03",
            name: "Duplicado",
            bed: "l-02",
            wing: "Teste",
            device: "ESP32-03",
            active: true,
          },
          token,
        )
      ).status,
      409,
    );
    await new Promise((resolve) => server.close(resolve));
    core.db.close();
    core = await createApp(options);
    server = core.app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    assert.equal(
      (await request("/api/rooms", "GET", undefined, token)).data.length,
      2,
    );
    assert.ok(
      (
        await request("/api/rooms/quarto-01/history", "GET", undefined, token)
      ).data.some((x) => x.action === "command_confirmed_simulator"),
    );
    assert.equal(
      (
        await request(
          `/api/users/${created.data.id}/password`,
          "POST",
          { newPassword: "SenhaNova-Teste-456789!" },
          token,
        )
      ).status,
      200,
    );
    assert.equal(
      (await request("/api/me", "GET", undefined, reader.token)).status,
      401,
    );
    const freshReader = await request("/api/auth/sign-in/email", "POST", {
      email: "reader@test.invalid",
      password: "SenhaNova-Teste-456789!",
    });
    assert.equal(freshReader.status, 200);
    execFileSync(
      process.execPath,
      [fileURLToPath(new URL("../backup.mjs", import.meta.url))],
      {
        cwd: dataDir,
        env: { ...process.env, SAMAHI_DATA_DIR: dataDir },
        stdio: "pipe",
      },
    );
    const backupFolder = readdirSync(join(dataDir, "backups"))[0];
    const backupDb = new DatabaseSync(
      join(dataDir, "backups", backupFolder, "samahi.sqlite"),
    );
    assert.equal(
      backupDb.prepare("SELECT count(*) AS n FROM rooms").get().n,
      2,
    );
    assert.notEqual(
      backupDb.prepare("SELECT password FROM account LIMIT 1").get().password,
      password,
    );
    backupDb.close();
    assert.equal(
      (
        await request(
          `/api/users/${created.data.id}/disable`,
          "POST",
          {},
          token,
        )
      ).status,
      200,
    );
    assert.equal(
      (await request("/api/me", "GET", undefined, reader.token)).status,
      401,
    );
    assert.equal(
      (await request("/api/auth/sign-out", "POST", {}, token)).status,
      200,
    );
    assert.equal(
      (await request("/api/me", "GET", undefined, token)).status,
      401,
    );
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => upstream.close(resolve));
    core.db.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
});
