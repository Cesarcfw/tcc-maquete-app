// Ambiente descartável para evidências. Nunca usa backend/data nem contas da equipe.
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { createApp } from "../server.mjs";
const require = createRequire(import.meta.url);
const { createSimulator } = require("../../integration/node-red/simulator.cjs");
const simulator = createSimulator();
const upstream = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  const match = /^\/api\/v1\/rooms\/([^/]+)\/(\w+)$/.exec(req.url || "");
  const result = match
    ? simulator.handle(match[2], match[1], body ? JSON.parse(body) : {})
    : { status: 404, body: { error: "Rota não encontrada" } };
  res.writeHead(result.status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(result.body));
});
upstream.listen(3802, "127.0.0.1");
const tick = setInterval(() => simulator.sample(), 2000);
const core = await createApp({
  dataDir: "../entregas/auth-browser",
  baseURL: "http://127.0.0.1:3801",
  origins: ["http://localhost:8083", "http://127.0.0.1:8083"],
  nodeRedURL: "http://127.0.0.1:3802",
});
if (!core.db.prepare("SELECT id FROM user LIMIT 1").get())
  await core.bootstrap({
    name: "Administrador de teste",
    email: "admin@test.invalid",
    password: "Teste-Temporario-123456!",
  });
const server = core.app.listen(3801, "127.0.0.1", () =>
  console.log(
    "Prévia com contas e simulador descartáveis: backend 3801, upstream 3802.",
  ),
);
const close = () => {
  clearInterval(tick);
  server.close(() =>
    upstream.close(() => {
      core.db.close();
      process.exit(0);
    }),
  );
};
process.on("SIGINT", close);
process.on("SIGTERM", close);
