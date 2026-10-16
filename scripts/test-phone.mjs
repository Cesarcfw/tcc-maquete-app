import { networkInterfaces } from "node:os";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const privateIP = (ip) =>
  /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
const addresses = Object.entries(networkInterfaces()).flatMap(
  ([name, values]) =>
    (values || [])
      .filter((v) => v.family === "IPv4" && !v.internal && privateIP(v.address))
      .map((v) => ({ name, ip: v.address })),
);
addresses.sort(
  (a, b) =>
    Number(/wi-?fi|wireless|wlan/i.test(b.name)) -
    Number(/wi-?fi|wireless|wlan/i.test(a.name)),
);
const hostArg = process.argv.indexOf("--host");
let selected =
  hostArg >= 0
    ? addresses.find((v) => v.ip === process.argv[hostArg + 1])
    : null;
if (hostArg >= 0 && !selected)
  throw new Error(
    "O IP informado precisa pertencer a uma interface privada deste computador.",
  );
if (!selected) {
  if (!addresses.length)
    throw new Error(
      "Conecte o computador ao Wi-Fi ou hotspot antes de iniciar.",
    );
  if (addresses.length === 1) selected = addresses[0];
  else {
    console.log("Escolha a rede que o telefone tambem esta usando:");
    addresses.forEach((v, i) => console.log(`${i + 1}. ${v.name}: ${v.ip}`));
    const input = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const value = await input.question("Numero da rede [1]: ");
    input.close();
    selected = addresses[Number(value.trim() || "1") - 1];
    if (!selected)
      throw new Error(
        "Rede invalida. Execute novamente e escolha uma opcao da lista.",
      );
  }
}
const host = selected.ip;
const backendURL = `http://${host}:3002`;
const directory = resolve(root, "entregas/teste-app");
mkdirSync(directory, { recursive: true });
writeFileSync(
  resolve(directory, "rede.json"),
  JSON.stringify(
    {
      host,
      interfaceName: selected.name,
      backendURL,
      backendPort: 3002,
      expoPort: 8082,
      node: process.execPath,
    },
    null,
    2,
  ),
);
console.log(`\nRede: ${selected.name} (${host})`);
console.log(`Servidor do app: ${backendURL}`);
console.log(`Teste no navegador do telefone: ${backendURL}/health`);
console.log(
  "Ensaio local HTTP: use rede confiavel e dados de demonstracao. Nao encaminhe portas do roteador.",
);
if (process.argv.includes("--prepare")) process.exit(0);

async function freePort(port, address) {
  await new Promise((ok, fail) => {
    const socket = createServer();
    socket.once("error", () =>
      fail(
        new Error(
          `A porta ${port} ja esta em uso ou indisponivel. A instancia existente nao sera encerrada.`,
        ),
      ),
    );
    socket.listen(port, address, () => socket.close(ok));
  });
}
await freePort(3002, host);
await freePort(8082, "0.0.0.0");
if (!existsSync(resolve(root, "backend/data/samahi.sqlite")))
  throw new Error(
    "Configure o administrador primeiro com Configurar-Administrador.cmd.",
  );
const children = new Set();
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  process.exitCode = code;
}
function start(args, cwd, env = {}) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: "inherit",
    windowsHide: true,
  });
  children.add(child);
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => {
    children.delete(child);
    if (!stopping) {
      console.error(
        `Um servico do teste encerrou (${code}). Encerrando somente os processos deste iniciador.`,
      );
      stop(code || 1);
    }
  });
  return child;
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
async function waitFor(url, service, tries = 20) {
  for (let attempt = 0; attempt < tries && !stopping; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1200) });
      const data = await response.json();
      if (response.ok && data.service === service) return;
    } catch {
      /* Aguarda a inicializacao local. */
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error(
    `O servico nao respondeu em ${url}. Confira a mensagem acima.`,
  );
}
try {
  let nodeRedRunning = false;
  try {
    const r = await fetch(
      "http://127.0.0.1:1880/api/v1/rooms/quarto-01/telemetry",
      { signal: AbortSignal.timeout(2000) },
    );
    if (r.ok) {
      const data = await r.json();
      nodeRedRunning =
        data.source === "node-red-simulator" && data.roomId === "quarto-01";
    } else if (r.status === 503) {
      console.log(
        "Node-RED ativo, mas o simulador esta offline. Use o cenario normal no editor para validar controles.",
      );
      nodeRedRunning = true;
    }
  } catch {
    /* Inicia a instalacao existente se a porta estiver livre. */
  }
  if (!nodeRedRunning) {
    await freePort(1880, "127.0.0.1");
    const nr = resolve(root, "../samahi-node-red");
    const bin = resolve(nr, "node_modules/node-red/red.js");
    if (!existsSync(bin) || !existsSync(resolve(nr, "settings.js")))
      throw new Error(
        "Inicie o Node-RED configurado com o fluxo SAMAHI antes de executar este arquivo.",
      );
    start([bin, "--userDir", "./data", "--settings", "./settings.js"], nr);
  } else
    console.log(
      "Node-RED existente reutilizado; ele permanecera ligado ao encerrar este teste.",
    );
  start(["server.mjs"], resolve(root, "backend"), {
    SAMAHI_HOST: host,
    SAMAHI_PORT: "3002",
    SAMAHI_PUBLIC_URL: backendURL,
    SAMAHI_DATA_DIR: resolve(root, "backend/data"),
    SAMAHI_NODE_RED_URL: "http://127.0.0.1:1880",
    SAMAHI_ORIGINS: [
      `http://localhost:8081`,
      `http://localhost:8082`,
      `http://127.0.0.1:8081`,
      `http://127.0.0.1:8082`,
      `http://${host}:8081`,
      `http://${host}:8082`,
      `exp://${host}:8082`,
    ].join(","),
  });
  await waitFor(`${backendURL}/health`, "samahi-backend");
  console.log(
    "\nBackend pronto. No telefone, entre com a sua conta real; nao escolha Explorar demonstracao.",
  );
  console.log(`Se necessario, Configurar conexao: ${backendURL}`);
  console.log(
    "Se /health nao abrir no telefone, execute Liberar-Acesso-App.cmd como administrador.",
  );
  console.log(
    "O editor do Node-RED permanece somente no computador. Ctrl+C encerra os servicos abertos por este iniciador.\n",
  );
  start(
    [
      resolve(root, "node_modules/expo/bin/cli"),
      "start",
      "--go",
      "--lan",
      "--port",
      "8082",
    ],
    root,
    {
      REACT_NATIVE_PACKAGER_HOSTNAME: host,
      EXPO_PUBLIC_BACKEND_URL: backendURL,
    },
  );
} catch (error) {
  console.error(error.message);
  stop(1);
}
