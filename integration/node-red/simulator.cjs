// Equipamento virtual. Telemetria em memória e configuração de luz persistida na instância.
// Nenhuma ligação com ESP físico.
const {
  defaultLightingSchedule,
  validLightingSchedule,
  lightingPeriod,
} = require("../../shared/lighting-schedule.cjs");
function createSimulator(clock = Date.now, storage) {
  let s;
  const reset = () => {
    s = {
      start: clock(),
      sampledAt: clock(),
      sequence: 0,
      temperatureC: 24,
      humidityPercent: 40,
      gasRawAdc: 843,
      ldrRawAdc: 1001,
      intensity: 0,
      lastPositive: 65,
      lightMode: "manual",
      lightingSchedule: defaultLightingSchedule(),
      indicator: "blue",
      scenario: "normal",
      gasUnavailable: false,
      acknowledged: false,
    };
  };
  reset();
  const saved = storage?.load();
  if (saved) {
    if (
      !validLightingSchedule(saved.schedule) ||
      !["manual", "scheduled"].includes(saved.mode) ||
      !Number.isInteger(saved.intensity) ||
      saved.intensity < 0 ||
      saved.intensity > 100 ||
      !Number.isInteger(saved.lastPositive) ||
      saved.lastPositive < 1 ||
      saved.lastPositive > 100
    )
      throw new Error("Configuração persistida da iluminação inválida.");
    Object.assign(s, {
      lightingSchedule: saved.schedule,
      lightMode: saved.mode,
      intensity: saved.intensity,
      lastPositive: saved.lastPositive,
    });
  }
  function applySchedule(state) {
    if (state.lightMode !== "scheduled") return;
    const period = lightingPeriod(state.lightingSchedule, clock());
    state.intensity =
      period === "day"
        ? state.lightingSchedule.dayIntensity
        : state.lightingSchedule.nightIntensity;
    if (state.intensity > 0) state.lastPositive = state.intensity;
  }
  function commitLighting(next) {
    applySchedule(next);
    try {
      storage?.save({
        schedule: next.lightingSchedule,
        mode: next.lightMode,
        intensity: next.intensity,
        lastPositive: next.lastPositive,
      });
    } catch {
      return false;
    }
    Object.assign(s, next);
    return true;
  }
  applySchedule(s);
  function sample() {
    if (["offline", "stale"].includes(s.scenario)) return;
    s.sequence++;
    s.sampledAt = clock();
    applySchedule(s);
  }
  function telemetry() {
    return {
      type: "telemetry",
      protocolVersion: 1,
      source: "node-red-simulator",
      deviceId: "ESP32-quarto-01",
      roomId: "quarto-01",
      sequence: s.sequence,
      uptimeMs: clock() - s.start,
      sampledAt: new Date(s.sampledAt).toISOString(),
      sampleAgeMs: Math.max(0, clock() - s.sampledAt),
      temperatureC: s.temperatureC,
      temperatureValid: true,
      humidityPercent: s.humidityPercent,
      humidityValid: true,
      adcBits: 12,
      gasRawAdc: s.gasRawAdc,
      gasThresholdAdc: 2000,
      gasStatus: s.gasUnavailable
        ? "unavailable"
        : s.gasRawAdc >= 2000
          ? "detected"
          : "clear",
      gasAcknowledged: s.acknowledged,
      buzzerOn: !s.gasUnavailable && s.gasRawAdc >= 2000,
      ldrRawAdc: s.ldrRawAdc,
      darkThresholdAdc: 1500,
      dark: s.ldrRawAdc >= 1500,
      lightMode: s.lightMode,
      lightingSchedule: { ...s.lightingSchedule },
      lightingPeriod:
        s.lightMode === "scheduled"
          ? lightingPeriod(s.lightingSchedule, s.sampledAt)
          : null,
      lightOn: s.intensity > 0,
      lightIntensityPercent: s.intensity,
      lastPositiveIntensity: s.lastPositive,
      indicatorColor: s.indicator,
      scenario: s.scenario,
      capabilities: {
        network: true,
        pwm: true,
        manchester: true,
        manchesterSimulatedOnly: true,
        hardware: false,
        scheduledLighting: true,
      },
    };
  }
  const fail = (status, error) => ({ status, body: { error } });
  function handle(action, room, body = {}) {
    if (room !== "quarto-01")
      return fail(404, "Ambiente nao cadastrado no simulador.");
    if (action === "telemetry")
      return s.scenario === "offline"
        ? fail(503, "Dispositivo virtual sem comunicacao.")
        : { status: 200, body: telemetry() };
    if (!body || typeof body !== "object" || Array.isArray(body))
      return fail(400, "Corpo JSON invalido.");
    if (action === "reset") {
      const lighting = {
        lightingSchedule: s.lightingSchedule,
        lightMode: s.lightMode,
        intensity: s.intensity,
        lastPositive: s.lastPositive,
      };
      reset();
      if (storage) Object.assign(s, lighting);
      sample();
      return { status: 200, body: telemetry() };
    }
    if (action === "simulation") {
      const ranges = {
        temperatureC: [-40, 80],
        humidityPercent: [0, 100],
        gasRawAdc: [0, 4095],
        ldrRawAdc: [0, 4095],
      };
      for (const [key, value] of Object.entries(body)) {
        if (key in ranges) {
          const [min, max] = ranges[key];
          if (
            typeof value !== "number" ||
            !Number.isFinite(value) ||
            value < min ||
            value > max ||
            (key.endsWith("Adc") && !Number.isInteger(value))
          )
            return fail(400, "Valor de sensor invalido.");
        } else if (key === "scenario") {
          if (!["normal", "offline", "stale", "timeout"].includes(value))
            return fail(400, "Cenario invalido.");
        } else if (key === "gasUnavailable") {
          if (typeof value !== "boolean")
            return fail(400, "Qualidade de gas invalida.");
        } else return fail(400, "Campo de simulacao desconhecido.");
      }
      const oldGas = telemetry().gasStatus;
      Object.assign(s, body);
      if (oldGas !== telemetry().gasStatus) s.acknowledged = false;
      if (s.scenario === "stale") s.sampledAt = clock() - 18000;
      sample();
      return { status: 200, body: telemetry() };
    }
    if (s.scenario === "offline")
      return fail(503, "Dispositivo virtual sem comunicacao.");
    if (action === "telemetry") return { status: 200, body: telemetry() };
    if (action === "commands") {
      if (clock() - s.sampledAt >= 10000)
        return fail(409, "Leitura desatualizada.");
      if (s.scenario === "timeout")
        return fail(504, "Comando nao confirmado no cenario de teste.");
      if (
        typeof body.commandId !== "string" ||
        !/^[a-zA-Z0-9-]{1,80}$/.test(body.commandId)
      )
        return fail(400, "commandId obrigatorio.");
      const c = body.command;
      if (!c || typeof c !== "object") return fail(400, "Comando obrigatorio.");
      if (c.kind === "light") {
        if (
          typeof c.on !== "boolean" ||
          !Number.isInteger(c.intensity) ||
          c.intensity < 0 ||
          c.intensity > 100
        )
          return fail(400, "Intensidade invalida.");
        if (typeof c.on !== "boolean" || c.on !== c.intensity > 0)
          return fail(400, "Estado da luz incompatível com a intensidade.");
        const intensity = c.on ? c.intensity : 0;
        if (
          !commitLighting({
            ...s,
            lightMode: "manual",
            intensity,
            lastPositive: intensity > 0 ? intensity : s.lastPositive,
          })
        )
          return fail(
            503,
            "Não foi possível salvar a configuração de iluminação.",
          );
      } else if (c.kind === "lightingSchedule") {
        if (
          typeof c.enabled !== "boolean" ||
          !validLightingSchedule(c.schedule)
        )
          return fail(400, "Programação de luz inválida.");
        if (
          !commitLighting({
            ...s,
            lightMode: c.enabled ? "scheduled" : "manual",
            lightingSchedule: { ...c.schedule },
          })
        )
          return fail(503, "Não foi possível salvar a programação.");
      } else if (
        c.kind === "indicator" &&
        ["red", "orange", "yellow", "green", "blue", "off"].includes(c.color)
      )
        s.indicator = c.color;
      else if (c.kind === "acknowledgeGas") {
        if (telemetry().gasStatus === "detected") s.acknowledged = true;
      } else return fail(400, "Comando nao suportado.");
      sample();
      return {
        status: 200,
        body: {
          type: "command_result",
          commandId: body.commandId,
          status: "applied_in_simulator",
          telemetry: telemetry(),
        },
      };
    }
    return fail(404, "Acao nao encontrada.");
  }
  return { sample, telemetry, handle };
}
function fileStorage(file) {
  const fs = require("node:fs"),
    path = require("node:path");
  return {
    load() {
      return fs.existsSync(file)
        ? JSON.parse(fs.readFileSync(file, "utf8"))
        : null;
    },
    save(value) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const temp = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(temp, JSON.stringify(value), {
        encoding: "utf8",
        mode: 0o600,
      });
      fs.renameSync(temp, file);
    },
  };
}
const path = require("node:path");
const stateFile =
  process.env.SAMAHI_NODE_RED_STATE_FILE ||
  path.resolve(__dirname, "../../backend/data/node-red-lighting.json");
module.exports = {
  createSimulator,
  fileStorage,
  instance: createSimulator(Date.now, fileStorage(stateFile)),
};
