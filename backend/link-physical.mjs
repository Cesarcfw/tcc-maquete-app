import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export function linkPhysicalDevice({
  file,
  backupDir,
  roomId = "quarto-01",
  deviceId = "ESP32-bancada",
}) {
  if (!existsSync(file))
    throw new Error("Banco do app ausente. Execute o setup normal primeiro.");
  const db = new DatabaseSync(file);
  db.exec("PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;");
  try {
    const room = db.prepare("SELECT device FROM rooms WHERE id=?").get(roomId);
    if (!room)
      throw new Error(
        "Quarto 01 nao encontrado; configure o ambiente pela administracao do app.",
      );
    if (room.device === deviceId) return { changed: false, roomId, deviceId };
    if (room.device !== "ESP32-quarto-01")
      throw new Error(
        "Ambiente ja vinculado a outro dispositivo; nenhum vinculo alterado.",
      );
    mkdirSync(backupDir, { recursive: true });
    const backup = resolve(
      backupDir,
      "before-physical-" +
        new Date().toISOString().replace(/[:.]/g, "-") +
        ".sqlite",
    );
    db.prepare("VACUUM INTO ?").run(backup);
    db.exec("BEGIN IMMEDIATE;");
    try {
      const result = db
        .prepare("UPDATE rooms SET device=? WHERE id=? AND device=?")
        .run(deviceId, roomId, room.device);
      if (result.changes !== 1)
        throw new Error("Vinculo mudou durante a operacao.");
      // Somente caches de ultima leitura/conexao; historico, contas e permissoes preservados.
      db.prepare("DELETE FROM latest_readings WHERE room_id=?").run(roomId);
      db.prepare("DELETE FROM room_connection_state WHERE room_id=?").run(
        roomId,
      );
      db.prepare(
        "INSERT INTO audit(at,actor,room_id,action,detail) VALUES(?,?,?,?,?)",
      ).run(
        new Date().toISOString(),
        "local-configuration",
        roomId,
        "room_device_linked",
        JSON.stringify({ previous: room.device, current: deviceId }),
      );
      db.exec("COMMIT;");
    } catch (error) {
      db.exec("ROLLBACK;");
      throw error;
    }
    return { changed: true, roomId, deviceId, backup };
  } finally {
    db.close();
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const root = dirname(fileURLToPath(import.meta.url));
  try {
    console.log(
      JSON.stringify(
        linkPhysicalDevice({
          file: resolve(
            process.env.SAMAHI_DATA_DIR || resolve(root, "data"),
            "samahi.sqlite",
          ),
          backupDir: resolve(root, "backups"),
        }),
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
