// Equipamento virtual. Estado em memoria; nenhuma ligacao com ESP fisico.
function createSimulator(clock = Date.now) {
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
      lightMode: "automatic",
      indicator: "blue",
      scenario: "normal",
      gasUnavailable: false,
      acknowledged: false,
    };
  };
  reset();
  function sample() {
    if (["offline", "stale"].includes(s.scenario)) return;
    s.sequence++;
    s.sampledAt = clock();
    if (s.lightMode === "automatic")
      s.intensity = s.ldrRawAdc >= 1500 ? s.lastPositive : 0;
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
      reset();
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
        s.lightMode = "manual";
        s.intensity = c.on ? c.intensity : 0;
        if (s.intensity > 0) s.lastPositive = s.intensity;
      } else if (c.kind === "automatic") s.lightMode = "automatic";
      else if (
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
module.exports = { createSimulator, instance: createSimulator() };
