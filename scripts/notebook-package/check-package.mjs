import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
try {
  if (process.platform !== "win32" || process.arch !== "x64")
    throw new Error("Este pacote foi preparado para Windows de 64 bits.");
  const manifest = JSON.parse(
    readFileSync(resolve(root, "PACOTE.json"), "utf8"),
  );
  if (process.version !== manifest.runtime.version)
    throw new Error("Use o Node portatil deste pacote pelos arquivos .cmd.");
  console.log("Conferindo os arquivos do pacote e os bancos. Aguarde...");
  let checked = 0;
  for (const entry of manifest.files) {
    const path = resolve(root, entry.path);
    if (!path.startsWith(root + sep))
      throw new Error("Caminho invalido no manifesto.");
    if (!existsSync(path)) throw new Error(`Arquivo ausente: ${entry.path}`);
    if (entry.mutable) continue;
    const hash = createHash("sha256").update(readFileSync(path)).digest("hex");
    if (hash !== entry.sha256)
      throw new Error(`Arquivo alterado/incompleto: ${entry.path}`);
    checked++;
  }
  for (const relative of [
    "tcc-maquete-app/backend/data/samahi.sqlite",
    "samahi-node-red/data/bench-history/samahi-bancada.sqlite",
  ]) {
    const db = new DatabaseSync(resolve(root, relative), { readOnly: true });
    try {
      if (db.prepare("PRAGMA integrity_check").get().integrity_check !== "ok")
        throw new Error(`Banco inconsistente: ${relative}`);
    } finally {
      db.close();
    }
  }
  const backendRequire = createRequire(
    resolve(root, "tcc-maquete-app/backend/package.json"),
  );
  for (const module of ["express", "cors", "better-auth/node"])
    backendRequire.resolve(module);
  const nodeRedRequire = createRequire(
    resolve(root, "samahi-node-red/package.json"),
  );
  nodeRedRequire.resolve("node-red/red.js");
  const flow = JSON.parse(
    readFileSync(resolve(root, "samahi-node-red/data/flows.json"), "utf8"),
  );
  if (
    !flow.some((n) => n.id === "samahi-physical-bridge") ||
    !flow.some((n) => n.id === "samahi-physical-api" && !n.disabled)
  )
    throw new Error("Fluxo fisico do SAMAHI nao encontrado.");
  console.log(
    `PACOTE CONFERIDO: ${checked} arquivos fixos integros, dependencias presentes e dois bancos consistentes.`,
  );
  console.log("Nenhum download necessario. Agora abra 02-INICIAR-SAMAHI.cmd.");
  console.log(
    "Esta conferencia nao comprova a conexao com o ESP/telefone; siga LEIA-ME-PRIMEIRO.txt.",
  );
} catch (error) {
  console.error(`FALHA: ${error.message}`);
  process.exitCode = 1;
}
