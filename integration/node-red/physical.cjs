const { Buffer } = require("node:buffer");
const { randomBytes } = require("node:crypto");
const {
  defaultLightingSchedule,
  validLightingSchedule,
  lightingPeriod,
} = require("../../shared/lighting-schedule.cjs");
const colors = ["red", "yellow", "green", "blue", "off"];
const finite = (v) => typeof v === "number" && Number.isFinite(v);
const level = (v) => Number.isInteger(v) && v >= 0 && v <= 100;
const ageValid = (v, max) => finite(v) && v >= 0 && v <= max;

function createPhysicalGateway(options = {}) {
  const clock = options.clock || Date.now;
  const roomId = options.roomId || "quarto-01";
  const deviceId = options.deviceId || "ESP32-bancada";
  const timeout = options.ackTimeoutMs || 3000;
  const storage = options.storage;
  let latest = null,
    peer = null,
    received = 0,
    pending = null,
    sender = null,
    closed = false;
  let acknowledged = false,
    wasAlarm = false,
    scheduleError = null;
  let settings = { mode: "manual", schedule: defaultLightingSchedule() };
  const saved = storage?.load();
  if (saved) {
    if (
      !["manual", "scheduled"].includes(saved.mode) ||
      !validLightingSchedule(saved.schedule)
    )
      throw new Error("Configuracao fisica de luz invalida.");
    settings = saved;
  }
  const fail = (status, error) => ({ status, body: { error } });
  const fresh = () => latest && clock() - received < 10000;
  function save(next) {
    storage?.save(next);
    settings = next;
  }
  function finish(result) {
    if (!pending) return;
    const entry = pending;
    pending = null;
    clearTimeout(entry.timer);
    entry.resolve(result);
  }
  function ingest(msg) {
    let p = msg.payload;
    if (Number(msg.port) !== 4211 || typeof msg.ip !== "string") return false;
    if (typeof p === "string" || Buffer.isBuffer(p)) {
      try {
        p = JSON.parse(p.toString());
      } catch {
        return false;
      }
    }
    if (!p || p.source !== "esp32-physical" || p.deviceId !== deviceId)
      return false;
    if (p.type === "network-test") {
      if (
        p.controlVersion !== 2 ||
        typeof p.pwm !== "boolean" ||
        p.gpio !== 23 ||
        p.rgbControlVersion !== 2 ||
        !level(p.lightIntensityPercent) ||
        p.ledState !== (p.lightIntensityPercent > 0 ? "on" : "off") ||
        !Number.isInteger(p.lastPositiveIntensity) ||
        p.lastPositiveIntensity < 1 ||
        p.lastPositiveIntensity > 100 ||
        !colors.includes(p.triageColor) ||
        !Number.isSafeInteger(p.sequence) ||
        p.sequence < 0 ||
        !Number.isSafeInteger(p.uptimeMs) ||
        p.uptimeMs < 0
      )
        return false;
      if (fresh() && peer !== msg.ip) return false;
      if (
        latest &&
        peer === msg.ip &&
        p.sequence <= latest.sequence &&
        p.uptimeMs >= latest.uptimeMs
      )
        return false;
      if (latest && p.uptimeMs < latest.uptimeMs) {
        // Sem identificador de boot no contrato antigo, exigir janela sem leitura
        // antes de aceitar reducao de uptime: evita reabrir alerta com UDP atrasado.
        if (fresh()) return false;
        finish(
          fail(
            409,
            "ESP reiniciou; confira o estado antes de repetir o comando.",
          ),
        );
        acknowledged = false;
      }
      if (peer && peer !== msg.ip)
        finish(fail(409, "Endereco do ESP mudou durante o comando."));
      peer = msg.ip;
      latest = { ...p };
      received = clock();
      const alarm = p.gasAlarmVersion === 1 && p.gasAlarmActive === true;
      if (!alarm || !wasAlarm) acknowledged = false;
      wasAlarm = alarm;
      return true;
    }
    if (
      !pending ||
      msg.ip !== pending.ip ||
      p.commandId !== pending.wireId ||
      p.status !== "applied"
    )
      return false;
    const expected = pending;
    if (expected.kind === "light") {
      if (
        p.type !== "led-ack" ||
        p.action !== "level" ||
        p.controlVersion !== 2 ||
        p.gpio !== 23 ||
        p.lightIntensityPercent !== expected.value ||
        p.ledState !== (expected.value > 0 ? "on" : "off") ||
        !Number.isInteger(p.lastPositiveIntensity) ||
        p.lastPositiveIntensity < 1 ||
        p.lastPositiveIntensity > 100
      )
        return false;
      latest.lightIntensityPercent = p.lightIntensityPercent;
      latest.ledState = p.ledState;
      latest.lastPositiveIntensity = p.lastPositiveIntensity;
    } else {
      if (
        p.type !== "triage-ack" ||
        p.action !== expected.value ||
        p.rgbControlVersion !== 2 ||
        p.triageColor !== expected.value ||
        JSON.stringify(p.pins) !== "[16,17,18]"
      )
        return false;
      latest.triageColor = p.triageColor;
    }
    finish({
      status: 200,
      body: { confirmation: "firmware_ack", wireCommandId: p.commandId },
    });
    return true;
  }
  function telemetry() {
    if (!latest) return null;
    const sampleAgeMs = Math.max(0, clock() - received);
    const sensorAge = (key) =>
      typeof latest[key] === "number" ? latest[key] + sampleAgeMs : Infinity;
    const temperatureValid =
      latest.dhtVersion === 1 &&
      latest.dhtPin === 4 &&
      latest.temperatureValid === true &&
      ageValid(sensorAge("dhtSampleAgeMs"), 8000) &&
      finite(latest.temperatureC) &&
      latest.temperatureC >= -40 &&
      latest.temperatureC <= 80;
    const humidityValid =
      latest.dhtVersion === 1 &&
      latest.dhtPin === 4 &&
      latest.humidityValid === true &&
      ageValid(sensorAge("dhtSampleAgeMs"), 8000) &&
      finite(latest.humidityPercent) &&
      latest.humidityPercent >= 0 &&
      latest.humidityPercent <= 100;
    const gasConfigured =
      latest.gasVersion === 1 &&
      latest.gasPin === 34 &&
      latest.gasAdcBits === 12 &&
      latest.gasSensor === "MQ-2" &&
      latest.gasThresholdConfigured === true &&
      latest.gasAlarmVersion === 1 &&
      typeof latest.gasAlarmActive === "boolean" &&
      typeof latest.gasAlarmFault === "boolean" &&
      Number.isInteger(latest.gasThresholdAdc) &&
      latest.gasThresholdAdc > 0 &&
      latest.gasThresholdAdc < 4095 &&
      Number.isInteger(latest.gasClearThresholdAdc) &&
      latest.gasClearThresholdAdc > 0 &&
      latest.gasClearThresholdAdc < latest.gasThresholdAdc;
    const gasFault =
      latest.gasAlarmFault !== false ||
      !ageValid(sensorAge("gasSampleAgeMs"), 4000) ||
      !Number.isInteger(latest.gasRawAdc) ||
      latest.gasRawAdc < 0 ||
      latest.gasRawAdc >= 4095;
    const alarm = gasConfigured && latest.gasAlarmActive === true;
    const gasStatus = alarm
      ? "detected"
      : !gasConfigured || gasFault
        ? "unavailable"
        : "clear";
    return {
      type: "telemetry",
      protocolVersion: 1,
      source: "esp32-physical",
      deviceId,
      roomId,
      sequence: latest.sequence,
      uptimeMs: latest.uptimeMs,
      sampledAt: new Date(received).toISOString(),
      sampleAgeMs,
      temperatureC: temperatureValid ? latest.temperatureC : null,
      temperatureValid,
      humidityPercent: humidityValid ? latest.humidityPercent : null,
      humidityValid,
      gasRawAdc:
        Number.isInteger(latest.gasRawAdc) &&
        latest.gasRawAdc >= 0 &&
        latest.gasRawAdc <= 4095
          ? latest.gasRawAdc
          : null,
      gasThresholdAdc: gasConfigured ? latest.gasThresholdAdc : null,
      gasClearThresholdAdc: gasConfigured ? latest.gasClearThresholdAdc : null,
      gasStatus,
      gasAlarmActive: alarm,
      gasAlarmFault: gasFault,
      gasMonitoringConfigured: gasConfigured,
      gasAcknowledged: alarm && acknowledged,
      buzzerOn: false,
      lightOn: latest.lightIntensityPercent > 0,
      lightIntensityPercent: latest.lightIntensityPercent,
      lastPositiveIntensity: latest.lastPositiveIntensity,
      lightMode: settings.mode,
      lightingSchedule: { ...settings.schedule },
      lightingPeriod:
        settings.mode === "scheduled"
          ? lightingPeriod(settings.schedule, clock())
          : null,
      lightingScheduleError: scheduleError,
      indicatorColor: latest.triageColor,
      rgbVisibleColor: latest.rgbVisibleColor || latest.triageColor,
      rgbBlinking: latest.rgbBlinking === true,
      rgbAlarmFallback: latest.rgbAlarmFallback === true,
      firmwareVersion: latest.firmwareVersion || null,
      capabilities: {
        hardware: true,
        network: true,
        pwm: latest.pwm,
        manchester: latest.rgbReady === true,
        manchesterSimulatedOnly: false,
        scheduledLighting: true,
        buzzer: false,
      },
    };
  }
  function issue(kind, value) {
    if (closed || !sender)
      return Promise.resolve(
        fail(503, "Ponte UDP fisica ainda nao disponivel."),
      );
    if (!fresh())
      return Promise.resolve(
        fail(409, "ESP sem telemetria recente; comando nao enviado."),
      );
    if (kind === "light" && latest.pwm !== true)
      return Promise.resolve(fail(409, "PWM da luz indisponivel no ESP."));
    if (kind === "indicator" && latest.rgbReady !== true)
      return Promise.resolve(fail(409, "Saida RGB indisponivel no ESP."));
    if (pending)
      return Promise.resolve(fail(409, "Outro comando aguarda ACK do ESP."));
    const wireId = "p-" + randomBytes(12).toString("hex");
    return new Promise((resolve) => {
      pending = {
        kind,
        value,
        wireId,
        ip: peer,
        resolve,
        timer: setTimeout(
          () => finish(fail(504, "ESP nao confirmou o comando em 3 segundos.")),
          timeout,
        ),
      };
      try {
        sender({
          ip: peer,
          port: 4211,
          payload:
            kind === "light"
              ? `led:${wireId}:level:${value}`
              : `triage:${wireId}:${value}`,
        });
      } catch {
        finish(fail(503, "Falha ao enviar comando ao ESP."));
      }
    });
  }
  const cache = new Map();
  async function handle(action, room, body = {}) {
    if (room !== roomId)
      return fail(404, "Ambiente nao configurado na ponte fisica.");
    if (action === "telemetry")
      return latest
        ? { status: 200, body: telemetry() }
        : fail(503, "Aguardando telemetria do ESP fisico.");
    if (action !== "commands")
      return fail(405, "Simulacao/reset nao disponiveis no modo fisico.");
    if (
      !body ||
      typeof body.commandId !== "string" ||
      !/^[A-Za-z0-9_-]{1,80}$/.test(body.commandId)
    )
      return fail(400, "commandId invalido.");
    const c = body.command;
    if (!c || typeof c !== "object") return fail(400, "Comando obrigatorio.");
    if (!fresh())
      return fail(409, "ESP sem telemetria recente; comando nao enviado.");
    const request = JSON.stringify(c),
      old = cache.get(body.commandId);
    if (old)
      return old.request === request
        ? old.reply
        : fail(409, "Identificador ja utilizado por outro comando.");
    let result;
    if (c.kind === "acknowledgeGas") {
      if (telemetry().gasStatus !== "detected")
        return fail(409, "Nao ha alerta ativo para reconhecer.");
      acknowledged = true;
      result = {
        status: 200,
        body: {
          type: "command_result",
          commandId: body.commandId,
          status: "acknowledged_in_gateway",
          confirmationScope: "app-only",
          telemetry: telemetry(),
        },
      };
    } else {
      if (c.kind === "light") {
        if (
          typeof c.on !== "boolean" ||
          !level(c.intensity) ||
          c.on !== c.intensity > 0
        )
          return fail(400, "Intensidade invalida.");
        result = await issue("light", c.intensity);
        if (result.status === 200) {
          try {
            save({ ...settings, mode: "manual" });
            scheduleError = null;
          } catch {
            scheduleError =
              "Luz confirmada, mas nao foi possivel salvar o modo manual.";
            return fail(503, scheduleError);
          }
        }
      } else if (c.kind === "indicator") {
        if (!colors.includes(c.color))
          return fail(400, "Cor nao disponivel no indicador fisico.");
        result = await issue("indicator", c.color);
      } else if (c.kind === "lightingSchedule") {
        if (
          typeof c.enabled !== "boolean" ||
          !validLightingSchedule(c.schedule)
        )
          return fail(400, "Programacao de luz invalida.");
        const period = lightingPeriod(c.schedule, clock());
        const target = c.enabled
          ? c.schedule[period === "day" ? "dayIntensity" : "nightIntensity"]
          : latest.lightIntensityPercent;
        result = await issue("light", target);
        if (result.status === 200) {
          try {
            save({
              mode: c.enabled ? "scheduled" : "manual",
              schedule: { ...c.schedule },
            });
            scheduleError = null;
          } catch {
            scheduleError =
              "Luz confirmada, mas nao foi possivel salvar a programacao.";
            return fail(503, scheduleError);
          }
        }
      } else return fail(400, "Funcao nao suportada pelo equipamento.");
      if (result.status !== 200) return result;
      result = {
        status: 200,
        body: {
          type: "command_result",
          commandId: body.commandId,
          status: "applied_in_hardware",
          confirmationScope: "firmware_ack",
          wireCommandId: result.body.wireCommandId,
          telemetry: telemetry(),
        },
      };
    }
    cache.set(body.commandId, { request, reply: result });
    if (cache.size > 100) cache.delete(cache.keys().next().value);
    return result;
  }
  async function tick() {
    if (closed || pending || settings.mode !== "scheduled" || !fresh()) return;
    const period = lightingPeriod(settings.schedule, clock());
    const target =
      settings.schedule[period === "day" ? "dayIntensity" : "nightIntensity"];
    if (latest.lightIntensityPercent === target) {
      scheduleError = null;
      return;
    }
    const result = await issue("light", target);
    scheduleError = result.status === 200 ? null : result.body.error;
  }
  return {
    ingest,
    telemetry,
    handle,
    tick,
    setSender(fn) {
      sender = fn;
    },
    close() {
      closed = true;
      sender = null;
      finish(fail(503, "Ponte fisica encerrada antes do ACK."));
    },
  };
}
module.exports = { createPhysicalGateway };
