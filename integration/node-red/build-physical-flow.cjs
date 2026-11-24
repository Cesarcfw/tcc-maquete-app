const fs = require("node:fs");
const path = require("node:path");
const z = "samahi-physical-api";
const nodes = [
  {
    id: z,
    type: "tab",
    label: "SAMAHI — API do ESP fisico",
    disabled: false,
    info: "Backend autenticado -> API local -> UDP e ACK do ESP. Desativar API virtual para evitar rotas duplicadas.",
  },
];
for (const [index, action, method] of [
  [0, "telemetry", "get"],
  [1, "commands", "post"],
  [2, "simulation", "post"],
  [3, "reset", "post"],
]) {
  const prefix = "samahi-physical-" + action;
  nodes.push(
    {
      id: prefix + "-http",
      type: "http in",
      z,
      name: method.toUpperCase() + " " + action,
      url: "/api/v1/rooms/:roomId/" + action,
      method,
      upload: false,
      x: 200,
      y: 100 + index * 120,
      wires: [[prefix + "-fn"]],
    },
    {
      id: prefix + "-fn",
      type: "function",
      z,
      name:
        action === "commands"
          ? "Enviar e aguardar ACK fisico"
          : "Consultar ponte fisica",
      func: `const gateway=global.get('samahiPhysical'); const result=gateway ? await gateway.handle('${action}',msg.req.params.roomId,msg.payload) : {status:503,body:{error:'Ponte fisica nao carregada. Reinicie o Node-RED.'}}; msg.statusCode=result.status; msg.headers={'Content-Type':'application/json','Cache-Control':'no-store'};msg.payload=result.body;return msg;`,
      outputs: 1,
      timeout: 0,
      noerr: 0,
      initialize: "",
      finalize: "",
      libs: [],
      x: 520,
      y: 100 + index * 120,
      wires: [[prefix + "-response"]],
    },
    {
      id: prefix + "-response",
      type: "http response",
      z,
      name: "Resposta fisica JSON",
      statusCode: "",
      headers: {},
      x: 840,
      y: 100 + index * 120,
      wires: [],
    },
  );
}
nodes.push({
  id: "samahi-physical-bridge",
  type: "samahi-physical-gateway",
  z: "esp32wifi12tab",
  name: "Ponte ESP fisico / app",
  roomId: "quarto-01",
  deviceId: "ESP32-bancada",
  x: 650,
  y: 1800,
  wires: [["esp32led14out"]],
});
fs.writeFileSync(
  path.join(__dirname, "physical-flows.json"),
  JSON.stringify(nodes, null, 2) + "\n",
);
