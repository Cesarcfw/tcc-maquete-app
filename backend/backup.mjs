import { DatabaseSync } from "node:sqlite";
import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root = resolve(process.env.SAMAHI_DATA_DIR || "data");
const target = resolve(
  "backups",
  new Date().toISOString().replace(/[:.]/g, "-"),
);
mkdirSync(target, { recursive: true });
const db = new DatabaseSync(resolve(root, "samahi.sqlite"));
try {
  // VACUUM INTO produz uma cópia consistente mesmo com WAL ativo.
  db.prepare("VACUUM INTO ?").run(resolve(target, "samahi.sqlite"));
  copyFileSync(resolve(root, "auth-secret"), resolve(target, "auth-secret"));
  const lightingFile =
    process.env.SAMAHI_NODE_RED_STATE_FILE ||
    fileURLToPath(new URL("./data/node-red-lighting.json", import.meta.url));
  if (existsSync(lightingFile))
    copyFileSync(lightingFile, resolve(target, "node-red-lighting.json"));
  console.log(
    `Backup criado em ${target}. Contém dados de contas e segredo: guarde em local privado.`,
  );
} finally {
  db.close();
}
