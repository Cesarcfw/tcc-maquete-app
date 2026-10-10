const fs = require("node:fs");
const path = require("node:path");
const z = "samahi-local";
const nodes = [
  {
    id: z,
    type: "tab",
    label: "SAMAHI — ESP virtual e API",
    disabled: false,
    info: "Sensores virtuais. Comandos HTTP do app. Sem hardware conectado.",
  },
];
nodes.push({
  id: "samahi-note",
  type: "comment",
  z,
  name: "SIMULAÇÃO · sensores a cada 2 s · controle pelo app local",
  x: 350,
  y: 40,
  wires: [],
});
nodes.push({
  id: "samahi-tick",
  type: "inject",
  z,
  name: "Atualizar sensores (2 s)",
  props: [],
  repeat: "2",
  once: true,
  onceDelay: "0.1",
  x: 180,
  y: 100,
  wires: [["samahi-sample"]],
});
nodes.push({
  id: "samahi-sample",
  type: "function",
  z,
  name: "Leitura do ESP virtual",
  func: "const sim = global.get('samahi'); sim.sample(); msg.payload = sim.telemetry(); return msg;",
  outputs: 1,
  x: 460,
  y: 100,
  wires: [["samahi-debug"]],
});
nodes.push({
  id: "samahi-debug",
  type: "debug",
  z,
  name: "Telemetria simulada",
  active: false,
  tosidebar: true,
  complete: "payload",
  targetType: "msg",
  x: 760,
  y: 100,
  wires: [],
});
for (const [index, action, method] of [
  [0, "telemetry", "get"],
  [1, "commands", "post"],
  [2, "simulation", "post"],
  [3, "reset", "post"],
]) {
  const prefix = "samahi-" + action;
  nodes.push({
    id: prefix + "-http",
    type: "http in",
    z,
    name: method.toUpperCase() + " " + action,
    url: "/api/v1/rooms/:roomId/" + action,
    method,
    upload: false,
    x: 170,
    y: 220 + index * 100,
    wires: [[prefix + "-fn"]],
  });
  nodes.push({
    id: prefix + "-fn",
    type: "function",
    z,
    name:
      action === "commands"
        ? "Validar → aplicar → confirmar"
        : action === "simulation"
          ? "Validar cenário/sensores"
          : action === "reset"
            ? "Reiniciar ESP virtual"
            : "Consultar última leitura",
    func: `const result = global.get('samahi').handle('${action}', msg.req.params.roomId, msg.payload); msg.statusCode = result.status; msg.headers = {'Content-Type':'application/json', 'Cache-Control':'no-store'}; msg.payload = result.body; return msg;`,
    outputs: 1,
    x: 460,
    y: 220 + index * 100,
    wires: [[prefix + "-response"]],
  });
  nodes.push({
    id: prefix + "-response",
    type: "http response",
    z,
    name: "Resposta JSON",
    statusCode: "",
    headers: {},
    x: 760,
    y: 220 + index * 100,
    wires: [],
  });
}
const sensorTests = [
  [
    "Normal",
    {
      scenario: "normal",
      temperatureC: 24,
      humidityPercent: 40,
      gasRawAdc: 843,
      gasUnavailable: false,
      ldrRawAdc: 1001,
    },
  ],
  ["Gás detectado", { gasRawAdc: 3628, gasUnavailable: false }],
  ["Retirar detecção de gás", { gasRawAdc: 843, gasUnavailable: false }],
  [
    "Temperatura 30 °C / umidade 70%",
    { temperatureC: 30, humidityPercent: 70 },
  ],
  ["Ambiente escuro", { ldrRawAdc: 4063 }],
  ["Ambiente claro", { ldrRawAdc: 1001 }],
];
sensorTests.forEach(([name, payload], i) =>
  nodes.push({
    id: "samahi-sensor-" + i,
    type: "inject",
    z,
    name,
    props: [{ p: "payload" }],
    payload: JSON.stringify(payload),
    payloadType: "json",
    x: 1030,
    y: 220 + i * 70,
    wires: [["samahi-sensors"]],
  }),
);
nodes.push({
  id: "samahi-sensors",
  type: "function",
  z,
  name: "Mudar entradas simuladas",
  func: "const result = global.get('samahi').handle('simulation','quarto-01',msg.payload); msg.payload=result.body; return msg;",
  outputs: 1,
  x: 1300,
  y: 320,
  wires: [["samahi-debug"]],
});
for (const node of nodes) {
  if (node.type === "inject") {
    node.repeat ??= "";
    node.crontab ??= "";
    node.once ??= false;
    node.onceDelay ??= 0.1;
    node.topic ??= "";
    node.payload ??= "";
    node.payloadType ??= "date";
  }
}
fs.writeFileSync(
  path.join(__dirname, "flows.json"),
  JSON.stringify(nodes, null, 2) + "\n",
);
