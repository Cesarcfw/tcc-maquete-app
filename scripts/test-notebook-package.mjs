// Ensaio da entrega em portas e dados temporarios: nao comanda o ESP real.
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { createSocket } from "node:dgram";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, cpSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const pack = resolve(process.argv[2]);
const scratch = mkdtempSync(join(tmpdir(), "samahi-package-check-"));
const tcp = async () => {
  const s = createServer();
  s.listen(0, "127.0.0.1");
  await once(s, "listening");
  const port = s.address().port;
  await new Promise((ok) => s.close(ok));
  return port;
};
const socket = createSocket("udp4");
socket.bind(0, "127.0.0.1");
await once(socket, "listening");
const udpPort = socket.address().port;
socket.close();
const nrPort = await tcp(),
  backendPort = await tcp();
const nrData = join(scratch, "node-red");
cpSync(join(pack, "samahi-node-red/data"), nrData, { recursive: true });
const flows = JSON.parse(readFileSync(join(nrData, "flows.json"), "utf8"));
for (const node of flows) {
  if (node.type === "inject") node.d = true;
  if (node.type === "udp in") {
    node.port = String(udpPort);
    node.iface = "127.0.0.1";
  }
  if (node.type === "udp out") {
    node.addr = "127.0.0.1";
    node.iface = "127.0.0.1";
    node.port = "9";
    node.outport = String(udpPort);
  }
}
writeFileSync(join(nrData, "flows.json"), JSON.stringify(flows));
writeFileSync(
  join(scratch, "settings.cjs"),
  `module.exports={...require(${JSON.stringify(join(pack, "samahi-node-red/settings.js"))}),uiPort:${nrPort}};`,
);
let logs = "",
  child,
  server,
  core;
try {
  child = spawn(
    process.execPath,
    [
      join(pack, "samahi-node-red/node_modules/node-red/red.js"),
      "--userDir",
      nrData,
      "--settings",
      join(scratch, "settings.cjs"),
    ],
    { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  child.stdout.on("data", (b) => {
    logs += b;
  });
  child.stderr.on("data", (b) => {
    logs += b;
  });
  let started = false;
  for (let n = 0; n < 80; n++) {
    if (child.exitCode !== null)
      throw new Error("Node-RED encerrou durante ensaio isolado: " + logs);
    if (logs.includes("Started flows")) {
      started = true;
      break;
    }
    await new Promise((ok) => setTimeout(ok, 250));
  }
  assert.ok(started, "Fluxos nao iniciaram: " + logs);
  assert.doesNotMatch(
    logs,
    /missing node types|unknown node|Error loading|Failed to register/i,
  );
  const nrResponse = await fetch(
    `http://127.0.0.1:${nrPort}/api/v1/rooms/quarto-01/telemetry`,
  );
  assert.equal(
    nrResponse.status,
    503,
    "Sem ESP no ensaio, ponte fisica deve ficar indisponivel, sem fallback simulado.",
  );
  const dataDir = join(scratch, "backend");
  cpSync(join(pack, "tcc-maquete-app/backend/data"), dataDir, {
    recursive: true,
  });
  const { createApp } = await import(
    pathToFileURL(join(pack, "tcc-maquete-app/backend/server.mjs")).href
  );
  core = await createApp({
    dataDir,
    baseURL: `http://127.0.0.1:${backendPort}`,
    nodeRedURL: `http://127.0.0.1:${nrPort}`,
  });
  server = core.app.listen(backendPort, "127.0.0.1");
  await once(server, "listening");
  const response = await fetch(`http://127.0.0.1:${backendPort}/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).service, "samahi-backend");
  assert.ok(
    core.db.prepare("SELECT count(*) AS n FROM user").get().n > 0,
    "Snapshot precisa preservar contas.",
  );
  assert.ok(
    core.db.prepare("SELECT count(*) AS n FROM rooms").get().n > 0,
    "Snapshot precisa preservar quartos.",
  );
  console.log(
    "APROVADO: Node-RED completo com tipos locais; API fisica 503 sem ESP; backend restaurado, contas/quartos e health 200.",
  );
  console.log(
    "Todos os dados e portas desse ensaio foram isolados. Nenhum comando foi enviado ao hardware.",
  );
} finally {
  if (server) await new Promise((ok) => server.close(ok));
  core?.db.close();
  if (child && child.exitCode === null) {
    const stopped = once(child, "exit");
    child.kill();
    await stopped;
  }
}
