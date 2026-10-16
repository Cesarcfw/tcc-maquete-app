import { DatabaseSync } from "node:sqlite";
import { mkdirSync, copyFileSync } from "node:fs";
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
  console.log(
    `Backup criado em ${target}. Contém dados de contas e segredo: guarde em local privado.`,
  );
} finally {
  db.close();
}
