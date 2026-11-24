// Gera uma entrega PRIVADA. Nunca usar a saida como anexo de PR/release publico.
import {
  cpSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { resolve, dirname, relative, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const parent = resolve(repo, "..");
function option(name) {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1])
    throw new Error(`Informe ${name}.`);
  return resolve(process.argv[index + 1]);
}
const output = option("--out"),
  runtime = option("--runtime"),
  archive = option("--node-zip"),
  sums = option("--node-shasums");
if (output === repo || output.startsWith(repo + sep))
  throw new Error("A entrega privada deve ficar fora do repositorio Git.");
if (process.platform !== "win32" || process.arch !== "x64")
  throw new Error("Preparar em Windows x64.");
if (existsSync(output))
  throw new Error(
    "A pasta de entrega deve ser nova; nao sobrescrevemos pacotes/dados existentes.",
  );
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const archiveHash = sha(readFileSync(archive));
const archiveName = archive.split(/[\\/]/).at(-1);
if (
  !readFileSync(sums, "utf8")
    .split(/\r?\n/)
    .some((line) => line.trim() === `${archiveHash}  ${archiveName}`)
)
  throw new Error(
    "Arquivo Node nao confere com o manifesto oficial fornecido.",
  );
const runtimeVersion = execFileSync(
  join(runtime, "node.exe"),
  ["-p", "process.version"],
  { encoding: "utf8", windowsHide: true },
).trim();
if (
  !/^v24\./.test(runtimeVersion) ||
  archiveName !== `node-${runtimeVersion}-win-x64.zip`
)
  throw new Error(
    "Runtime e arquivo ZIP oficial devem ser da mesma versao Node 24 x64.",
  );
const nr = resolve(parent, "samahi-node-red");
const captureFiles = [
  join(nr, "data/flows.json"),
  join(nr, "data/physical-lighting.json"),
  join(repo, "backend/data/node-red-lighting.json"),
  join(repo, "backend/data/auth-secret"),
];
const capture = captureFiles
  .filter(existsSync)
  .map((path) => ({ path, bytes: readFileSync(path) }));
const flows = JSON.parse(
  capture
    .find((item) => item.path.endsWith("flows.json"))
    .bytes.toString("utf8")
    .replace(/^\uFEFF/, ""),
);
if (
  !flows.some((n) => n.id === "samahi-physical-bridge") ||
  flows.some((n) => n.credentials)
)
  throw new Error("Conferir fluxo fisico/credenciais antes de empacotar.");
const takenAt = new Date().toISOString();
mkdirSync(dirname(output), { recursive: true });
mkdirSync(output, { recursive: false });
const appOut = join(output, "tcc-maquete-app"),
  nrOut = join(output, "samahi-node-red");
function copy(source, target) {
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}
for (const file of [
  "package.json",
  "LICENSE",
  "backend/package.json",
  "backend/package-lock.json",
  "scripts/test-phone.mjs",
  "scripts/connection-summary.mjs",
  "scripts/firewall-phone.ps1",
])
  copy(join(repo, file), join(appOut, file));
for (const entry of readdirSync(join(repo, "backend")))
  if (entry.endsWith(".mjs"))
    copy(join(repo, "backend", entry), join(appOut, "backend", entry));
for (const folder of ["shared", "integration/node-red", "backend/test"])
  cpSync(join(repo, folder), join(appOut, folder), { recursive: true });
for (const file of [
  "rede-esp-notebook.md",
  "rede-esp-notebook-validacao.md",
  "instalacao-configuracao.md",
  "operacao.md",
  "integracao-esp-fisico.md",
])
  copy(join(repo, "docs", file), join(appOut, "docs", file));
for (const file of ["package.json", "package-lock.json", "settings.js"])
  copy(join(nr, file), join(nrOut, file));
for (const folder of ["lib", "nodes", "scripts"])
  cpSync(join(nr, folder), join(nrOut, folder), { recursive: true });
copy(join(nr, "data/package.json"), join(nrOut, "data/package.json"));
for (const item of capture) {
  const target = item.path.startsWith(nr)
    ? join(nrOut, relative(nr, item.path))
    : join(appOut, relative(repo, item.path));
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, item.bytes);
}
const snapshots = [];
for (const [source, target] of [
  [
    join(repo, "backend/data/samahi.sqlite"),
    join(appOut, "backend/data/samahi.sqlite"),
  ],
  [
    join(nr, "data/bench-history/samahi-bancada.sqlite"),
    join(nrOut, "data/bench-history/samahi-bancada.sqlite"),
  ],
]) {
  mkdirSync(dirname(target), { recursive: true });
  const db = new DatabaseSync(source, { readOnly: true });
  try {
    db.prepare("VACUUM INTO ?").run(target);
  } finally {
    db.close();
  }
  const check = new DatabaseSync(target, { readOnly: true });
  try {
    if (check.prepare("PRAGMA integrity_check").get().integrity_check !== "ok")
      throw new Error("Snapshot SQLite inconsistente.");
  } finally {
    check.close();
  }
  snapshots.push({
    path: relative(output, target).replaceAll("\\", "/"),
    capturedAt: new Date().toISOString(),
    method: "SQLite VACUUM INTO",
  });
}
for (const item of capture)
  if (sha(readFileSync(item.path)) !== sha(item.bytes))
    throw new Error(
      "Configuracao mudou durante captura. Refazer em uma pasta nova.",
    );
cpSync(runtime, join(output, "runtime"), { recursive: true });
copy(sums, join(output, "NODE-SHASUMS256.txt"));
const template = join(repo, "scripts/notebook-package");
for (const entry of readdirSync(template)) {
  let body = readFileSync(join(template, entry), "utf8");
  const target =
    entry === "check-package.mjs"
      ? join(output, "scripts", entry)
      : join(output, entry);
  mkdirSync(dirname(target), { recursive: true });
  if (entry.endsWith(".cmd")) body = body.replace(/\r?\n/g, "\r\n");
  writeFileSync(target, body);
}
const apConfig = join(repo, "integration/esp32/samahi_esp32/network_config.h");
if (existsSync(apConfig)) {
  const content = readFileSync(apConfig, "utf8");
  const value = (key) =>
    content.match(new RegExp(`${key}\\s*=\\s*"([^"\\r\\n]+)"`))?.[1];
  if (value("AP_NOME") && value("AP_SENHA")) {
    mkdirSync(join(output, "PRIVADO"));
    writeFileSync(
      join(output, "PRIVADO/REDE-DO-ESP.txt"),
      `ACESSO PRIVADO — NAO PUBLICAR\nRede: ${value("AP_NOME")}\nSenha: ${value("AP_SENHA")}\nPortal inicial: http://192.168.4.1/\nUsuario do portal: admin\nSenha do portal: a mesma da rede acima.\nDados do firmware AP+STA preparado; exigem essa versao gravada no ESP.\n`,
    );
  }
}
const npmCLI = join(output, "runtime/node_modules/npm/bin/npm-cli.js");
async function dependencies(cwd) {
  console.log(`Preparando dependencias em ${relative(output, cwd)}...`);
  await new Promise((ok, fail) => {
    const child = spawn(
      join(output, "runtime/node.exe"),
      [
        npmCLI,
        "ci",
        "--omit=dev",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
      ],
      {
        cwd,
        windowsHide: true,
        stdio: "inherit",
        env: {
          ...process.env,
          PATH: join(output, "runtime") + ";" + process.env.PATH,
          npm_config_cache: join(parent, "tmp/pacote-notebook-cache/npm-cache"),
        },
      },
    );
    child.on("error", fail);
    child.on("exit", (code) =>
      code === 0 ? ok() : fail(new Error(`npm ci terminou com ${code}.`)),
    );
  });
}
await dependencies(join(appOut, "backend"));
await dependencies(nrOut);
function listFiles(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isSymbolicLink())
      throw new Error("Pacote nao deve depender de links externos.");
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}
const files = listFiles(output).map((path) => {
  const name = relative(output, path).replaceAll("\\", "/");
  return {
    path: name,
    bytes: statSync(path).size,
    sha256: sha(readFileSync(path)),
    mutable:
      name.startsWith("tcc-maquete-app/backend/data/") ||
      name.startsWith("samahi-node-red/data/"),
  };
});
const manifest = {
  private: true,
  platform: "Windows x64",
  appVersion: JSON.parse(readFileSync(join(repo, "package.json"))).version,
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repo,
    encoding: "utf8",
    windowsHide: true,
  }).trim(),
  capturedAt: takenAt,
  runtime: {
    version: runtimeVersion,
    archive: archiveName,
    archiveSha256: archiveHash,
    source: `https://nodejs.org/download/release/${runtimeVersion}/`,
  },
  dependencies: "npm ci --omit=dev --ignore-scripts a partir dos lockfiles",
  snapshots,
  files,
};
writeFileSync(join(output, "PACOTE.json"), JSON.stringify(manifest, null, 2));
console.log(
  `Pacote privado preparado em ${output}. ${files.length} arquivos. Validar antes de compactar.`,
);
