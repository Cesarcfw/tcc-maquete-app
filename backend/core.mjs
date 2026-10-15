import { DatabaseSync } from "node:sqlite";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins/bearer";
import { admin } from "better-auth/plugins/admin";
import { getMigrations } from "better-auth/db/migration";

export const groups = ["light", "sensors", "indicator", "history"];
export const levels = ["none", "read", "control"];
export const fail = (status, message) =>
  Object.assign(new Error(message), { status });
export function text(value, name, max = 160) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw fail(400, `Campo inválido: ${name}.`);
  return value.trim();
}
export function roomInput(body) {
  const room = Object.fromEntries(
    ["id", "name", "bed", "wing", "device"].map((key) => [
      key,
      text(body[key], key),
    ]),
  );
  if (!/^[a-z0-9-]{1,64}$/.test(room.id))
    throw fail(400, "ID deve conter letras minúsculas, números ou hífen.");
  if (typeof body.active !== "boolean")
    throw fail(400, "Informe se o quarto está ativo.");
  return { ...room, active: body.active ? 1 : 0 };
}
export async function createCore(options = {}) {
  const dataDir = resolve(
    options.dataDir || process.env.SAMAHI_DATA_DIR || "data",
  );
  mkdirSync(dataDir, { recursive: true });
  const secretPath = resolve(dataDir, "auth-secret");
  if (!existsSync(secretPath))
    writeFileSync(secretPath, randomBytes(48).toString("base64url"), {
      mode: 0o600,
      flag: "wx",
    });
  const secret = readFileSync(secretPath, "utf8");
  const db = new DatabaseSync(resolve(dataDir, "samahi.sqlite"));
  db.exec(
    "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;",
  );
  const baseURL =
    options.baseURL || process.env.SAMAHI_PUBLIC_URL || "http://127.0.0.1:3001";
  const origins =
    options.origins ||
    (
      process.env.SAMAHI_ORIGINS ||
      "http://localhost:8081,http://localhost:8082,http://127.0.0.1:8081,http://127.0.0.1:8082"
    )
      .split(",")
      .map((s) => s.trim());
  const authOptions = (allowSignUp = false) => ({
    database: db,
    secret,
    baseURL,
    trustedOrigins: origins,
    emailAndPassword: {
      enabled: true,
      disableSignUp: !allowSignUp,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 30 },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: { "/sign-in/email": { window: 60, max: 5 } },
    },
    plugins: [bearer(), admin()],
    advanced: {
      useSecureCookies: baseURL.startsWith("https://"),
      ipAddress: { ipAddressHeaders: ["x-samahi-client-ip"] },
    },
  });
  await (await getMigrations(authOptions())).runMigrations();
  const auth = betterAuth(authOptions());
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, bed TEXT NOT NULL COLLATE NOCASE UNIQUE,
      wing TEXT NOT NULL, device TEXT NOT NULL COLLATE NOCASE UNIQUE, active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
    );
    CREATE TABLE IF NOT EXISTS grants (
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      group_name TEXT NOT NULL CHECK(group_name IN ('light','sensors','indicator','history')),
      level TEXT NOT NULL CHECK(level IN ('none','read','control')),
      CHECK(group_name NOT IN ('sensors','history') OR level != 'control'),
      PRIMARY KEY(user_id,room_id,group_name)
    );
    CREATE TABLE IF NOT EXISTS audit (
      id INTEGER PRIMARY KEY, at TEXT NOT NULL, actor TEXT NOT NULL, room_id TEXT,
      action TEXT NOT NULL, detail TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS latest_readings (
      room_id TEXT PRIMARY KEY REFERENCES rooms(id) ON DELETE CASCADE, received_at TEXT NOT NULL, payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS commands (
      actor TEXT NOT NULL, room_id TEXT NOT NULL, command_id TEXT NOT NULL, request TEXT NOT NULL,
      status TEXT NOT NULL, response TEXT, PRIMARY KEY(actor,room_id,command_id)
    );
    PRAGMA user_version=1;
  `);
  const record = (actor, room, action, detail = {}) =>
    db
      .prepare(
        "INSERT INTO audit(at,actor,room_id,action,detail) VALUES(?,?,?,?,?)",
      )
      .run(
        new Date().toISOString(),
        actor,
        room,
        action,
        JSON.stringify(detail),
      );
  const level = (userId, roomId, group) =>
    db
      .prepare(
        "SELECT level FROM grants WHERE user_id=? AND room_id=? AND group_name=?",
      )
      .get(userId, roomId, group)?.level || "none";
  const allowed = (userId, roomId, group, control = false) =>
    control
      ? level(userId, roomId, group) === "control"
      : level(userId, roomId, group) !== "none";
  const grantAll = (userId, roomId) => {
    for (const group of groups)
      db.prepare("INSERT OR REPLACE INTO grants VALUES(?,?,?,?)").run(
        userId,
        roomId,
        group,
        ["light", "indicator"].includes(group) ? "control" : "read",
      );
  };
  async function bootstrap({ name, email, password }) {
    if (db.prepare("SELECT count(*) AS n FROM user").get().n)
      throw fail(409, "Instalação já possui usuários.");
    const setupAuth = betterAuth(authOptions(true));
    const created = await setupAuth.api.signUpEmail({
      body: { name, email, password },
    });
    db.prepare("UPDATE user SET role=? WHERE id=?").run(
      "admin",
      created.user.id,
    );
    // A sessão de cadastro não é usada como sessão administrativa.
    db.prepare("DELETE FROM session WHERE userId=?").run(created.user.id);
    db.prepare("INSERT INTO rooms VALUES(?,?,?,?,?,?)").run(
      "quarto-01",
      "Quarto 01",
      "L-01",
      "Maquete experimental",
      "ESP32-quarto-01",
      1,
    );
    grantAll(created.user.id, "quarto-01");
    record(created.user.id, null, "installation_initialized");
    return created.user.id;
  }
  return {
    auth,
    db,
    origins,
    baseURL,
    dataDir,
    bootstrap,
    record,
    level,
    allowed,
    grantAll,
  };
}
