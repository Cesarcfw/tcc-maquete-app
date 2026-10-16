import express from "express";
import cors from "cors";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { pathToFileURL } from "node:url";
import { createCore, fail, text, roomInput, groups, levels } from "./core.mjs";

export async function createApp(options = {}) {
  const core = await createCore(options);
  const { auth, db, record, allowed } = core;
  const app = express();
  app.disable("x-powered-by");
  // Cabeçalho sobrescrito pelo servidor: o cliente não escolhe a chave do limitador.
  app.use((req, res, next) => {
    req.headers["x-samahi-client-ip"] = req.socket.remoteAddress || "127.0.0.1";
    next();
  });
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });
  app.use(
    cors({
      origin: (origin, done) =>
        done(null, !origin || core.origins.includes(origin)),
      credentials: true,
      exposedHeaders: ["set-auth-token"],
    }),
  );
  app.use((req, res, next) => {
    if (req.headers.origin && !core.origins.includes(req.headers.origin))
      return res.status(403).json({ error: "Origem não autorizada." });
    next();
  });
  // Administração passa pelas rotas com validação/auditoria abaixo, nunca pelo handler público.
  app.use("/api/auth/admin", (req, res) =>
    res.status(404).json({ error: "Rota não disponível." }),
  );
  app.all("/api/auth/*splat", toNodeHandler(auth));
  app.use(express.json({ limit: "32kb" }));
  app.get("/health", (req, res) =>
    res.json({ status: "ok", service: "samahi-backend", schemaVersion: 1 }),
  );
  app.use("/api", async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session) throw fail(401, "Entre na sua conta.");
      const user = db
        .prepare("SELECT id,name,email,role,banned FROM user WHERE id=?")
        .get(session.user.id);
      if (!user || user.banned) throw fail(401, "Conta indisponível.");
      req.actor = user;
      next();
    } catch (error) {
      next(error);
    }
  });
  const adminOnly = (req, res, next) =>
    req.actor.role === "admin"
      ? next()
      : next(fail(403, "Apenas administrador."));
  const grantsFor = (user) =>
    Object.fromEntries(
      db
        .prepare("SELECT room_id,group_name,level FROM grants WHERE user_id=?")
        .all(user)
        .reduce((m, r) => {
          const value = m.get(r.room_id) || {};
          value[r.group_name] = r.level;
          m.set(r.room_id, value);
          return m;
        }, new Map()),
    );
  app.get("/api/me", (req, res) =>
    res.json({ ...req.actor, grants: grantsFor(req.actor.id) }),
  );
  app.get("/api/users", adminOnly, (req, res) =>
    res.json(
      db
        .prepare("SELECT id,name,email,role,banned FROM user ORDER BY name")
        .all()
        .map((user) => ({ ...user, grants: grantsFor(user.id) })),
    ),
  );
  app.post("/api/users", adminOnly, async (req, res) => {
    const name = text(req.body.name, "nome");
    const email = text(req.body.email, "email");
    const password = req.body.password;
    if (
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 128 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    )
      throw fail(400, "Use email válido e senha de 12 a 128 caracteres.");
    const result = await auth.api.createUser({
      headers: fromNodeHeaders(req.headers),
      body: { name, email, password, role: "user" },
    });
    record(req.actor.id, null, "user_created", { userId: result.user.id });
    res.status(201).json({ id: result.user.id, name, email, role: "user" });
  });
  app.put("/api/users/:userId/grants/:roomId", adminOnly, (req, res) => {
    if (
      !db.prepare("SELECT id FROM user WHERE id=?").get(req.params.userId) ||
      !db.prepare("SELECT id FROM rooms WHERE id=?").get(req.params.roomId)
    )
      throw fail(404, "Usuário ou quarto não encontrado.");
    if (!req.body || Object.keys(req.body).length !== groups.length)
      throw fail(400, "Informe os quatro grupos.");
    for (const group of groups)
      if (
        !levels.includes(req.body[group]) ||
        (["sensors", "history"].includes(group) &&
          req.body[group] === "control")
      )
        throw fail(400, "Permissões inválidas.");
    db.exec("BEGIN");
    try {
      for (const group of groups)
        db.prepare("INSERT OR REPLACE INTO grants VALUES(?,?,?,?)").run(
          req.params.userId,
          req.params.roomId,
          group,
          req.body[group],
        );
      record(req.actor.id, req.params.roomId, "grants_updated", {
        userId: req.params.userId,
        grants: req.body,
      });
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    res.json({ ok: true });
  });
  app.post("/api/users/:userId/disable", adminOnly, async (req, res) => {
    const user = db
      .prepare("SELECT id,role FROM user WHERE id=?")
      .get(req.params.userId);
    if (!user) throw fail(404, "Usuário não encontrado.");
    if (user.id === req.actor.id || user.role === "admin")
      throw fail(
        400,
        "Não é permitido desativar o administrador por esta rota.",
      );
    db.prepare("UPDATE user SET banned=1 WHERE id=?").run(user.id);
    db.prepare("DELETE FROM session WHERE userId=?").run(user.id);
    record(req.actor.id, null, "user_disabled", { userId: user.id });
    res.json({ ok: true });
  });
  app.post("/api/users/:userId/password", adminOnly, async (req, res) => {
    const user = db
      .prepare("SELECT id,role FROM user WHERE id=?")
      .get(req.params.userId);
    if (!user) throw fail(404, "Usuário não encontrado.");
    if (user.role === "admin")
      throw fail(400, "Administrador deve alterar a própria senha pela conta.");
    const newPassword = req.body.newPassword;
    if (
      typeof newPassword !== "string" ||
      newPassword.length < 12 ||
      newPassword.length > 128
    )
      throw fail(400, "Use de 12 a 128 caracteres.");
    await auth.api.setUserPassword({
      headers: fromNodeHeaders(req.headers),
      body: { userId: user.id, newPassword },
    });
    db.prepare("DELETE FROM session WHERE userId=?").run(user.id);
    record(req.actor.id, null, "password_reset_by_admin", { userId: user.id });
    res.json({ ok: true });
  });
  app.post("/api/users/:userId/enable", adminOnly, (req, res) => {
    if (!db.prepare("SELECT id FROM user WHERE id=?").get(req.params.userId))
      throw fail(404, "Usuário não encontrado.");
    db.prepare("UPDATE user SET banned=0 WHERE id=?").run(req.params.userId);
    record(req.actor.id, null, "user_enabled", { userId: req.params.userId });
    res.json({ ok: true });
  });
  app.get("/api/rooms", (req, res) =>
    res.json(
      db
        .prepare("SELECT * FROM rooms ORDER BY name")
        .all()
        .filter(
          (r) =>
            req.actor.role === "admin" ||
            groups.some((g) => allowed(req.actor.id, r.id, g)),
        )
        .map((r) => ({ ...r, grants: grantsFor(req.actor.id)[r.id] || {} })),
    ),
  );
  app.post("/api/rooms", adminOnly, (req, res) => {
    const r = roomInput(req.body);
    db.prepare("INSERT INTO rooms VALUES(?,?,?,?,?,?)").run(
      r.id,
      r.name,
      r.bed,
      r.wing,
      r.device,
      r.active,
    );
    record(req.actor.id, r.id, "room_created");
    res.status(201).json(r);
  });
  app.put("/api/rooms/:roomId", adminOnly, (req, res) => {
    const r = roomInput({ ...req.body, id: req.params.roomId });
    if (!db.prepare("SELECT id FROM rooms WHERE id=?").get(r.id))
      throw fail(404, "Quarto não encontrado.");
    db.prepare(
      "UPDATE rooms SET name=?,bed=?,wing=?,device=?,active=? WHERE id=?",
    ).run(r.name, r.bed, r.wing, r.device, r.active, r.id);
    record(req.actor.id, r.id, "room_updated");
    res.json(r);
  });
  app.param("roomId", (req, res, next, id) => {
    req.room = db.prepare("SELECT * FROM rooms WHERE id=?").get(id);
    // Sem revelar existência do quarto para quem não tem acesso.
    if (
      !req.room ||
      (req.actor?.role !== "admin" &&
        !groups.some((g) => allowed(req.actor.id, id, g)))
    )
      return next(fail(404, "Quarto não encontrado."));
    next();
  });
  async function upstream(roomId, action, body) {
    const base =
      options.nodeRedURL ||
      process.env.SAMAHI_NODE_RED_URL ||
      "http://127.0.0.1:1880";
    let response;
    try {
      response = await fetch(
        `${base}/api/v1/rooms/${encodeURIComponent(roomId)}/${action}`,
        {
          method: body ? "POST" : "GET",
          headers: body ? { "Content-Type": "application/json" } : {},
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(5000),
          redirect: "error",
        },
      );
    } catch {
      throw fail(503, "Node-RED indisponível ou sem confirmação.");
    }
    const payload = await response.json();
    if (!response.ok)
      throw fail(
        response.status >= 400 && response.status < 600 ? response.status : 502,
        payload.error || "Falha do Node-RED.",
      );
    const t = body ? payload.telemetry : payload;
    if (
      !t ||
      t.roomId !== roomId ||
      t.deviceId !==
        db.prepare("SELECT device FROM rooms WHERE id=?").get(roomId)?.device ||
      t.source !== "node-red-simulator"
    )
      throw fail(502, "Telemetria incompatível com o dispositivo cadastrado.");
    return payload;
  }
  const requireRoom = (req, group, control = false) => {
    if (!req.room.active) throw fail(409, "Quarto inativo.");
    if (!allowed(req.actor.id, req.room.id, group, control))
      throw fail(403, "Sem permissão para esta função neste quarto.");
  };
  const redact = (req, t) => {
    const result = {
      roomId: t.roomId,
      deviceId: t.deviceId,
      source: t.source,
      sampledAt: t.sampledAt,
      sampleAgeMs: t.sampleAgeMs,
      sequence: t.sequence,
    };
    const fields = {
      sensors: [
        "temperatureC",
        "temperatureValid",
        "humidityPercent",
        "humidityValid",
        "gasRawAdc",
        "gasStatus",
        "gasAcknowledged",
        "buzzerOn",
        "ldrRawAdc",
        "dark",
      ],
      light: [
        "lightOn",
        "lightIntensityPercent",
        "lastPositiveIntensity",
        "lightMode",
      ],
      indicator: ["indicatorColor"],
    };
    for (const [group, keys] of Object.entries(fields))
      if (allowed(req.actor.id, t.roomId, group))
        for (const key of keys) result[key] = t[key];
    return result;
  };
  app.get("/api/rooms/:roomId/telemetry", async (req, res) => {
    if (!req.room.active) throw fail(409, "Quarto inativo.");
    if (
      !["light", "sensors", "indicator"].some((g) =>
        allowed(req.actor.id, req.room.id, g),
      )
    )
      throw fail(403, "Sem acesso à telemetria.");
    const t = await upstream(req.room.id, "telemetry");
    const previous = db
      .prepare("SELECT payload FROM latest_readings WHERE room_id=?")
      .get(req.room.id);
    const previousGas = previous
      ? JSON.parse(previous.payload).gasStatus
      : undefined;
    if (typeof t.gasStatus === "string" && previousGas !== t.gasStatus)
      record(req.actor.id, req.room.id, "gas_status_changed", {
        previous: previousGas || "unknown",
        current: t.gasStatus,
        source: t.source,
      });
    db.prepare("INSERT OR REPLACE INTO latest_readings VALUES(?,?,?)").run(
      req.room.id,
      new Date().toISOString(),
      JSON.stringify(t),
    );
    res.json(redact(req, t));
  });
  app.post("/api/rooms/:roomId/commands", async (req, res) => {
    const { command, commandId } = req.body || {};
    if (
      typeof commandId !== "string" ||
      !/^[A-Za-z0-9_-]{1,80}$/.test(commandId)
    )
      throw fail(400, "Identificador de comando inválido.");
    const kind = command?.kind;
    if (["light", "automatic"].includes(kind)) requireRoom(req, "light", true);
    else if (kind === "indicator") requireRoom(req, "indicator", true);
    else if (kind === "acknowledgeGas") requireRoom(req, "sensors");
    else throw fail(400, "Comando inválido.");
    if (
      kind === "light" &&
      (typeof command.on !== "boolean" ||
        !Number.isInteger(command.intensity) ||
        command.intensity < 0 ||
        command.intensity > 100 ||
        command.on !== command.intensity > 0)
    )
      throw fail(400, "Intensidade inválida.");
    if (
      kind === "indicator" &&
      !["red", "orange", "yellow", "green", "blue", "off"].includes(
        command.color,
      )
    )
      throw fail(400, "Cor inválida.");
    const request = JSON.stringify(command);
    const old = db
      .prepare(
        "SELECT * FROM commands WHERE actor=? AND room_id=? AND command_id=?",
      )
      .get(req.actor.id, req.room.id, commandId);
    if (old) {
      if (old.request !== request || old.status !== "confirmed")
        throw fail(
          409,
          "Comando já registrado; confira o estado antes de tentar novamente.",
        );
      const cached = JSON.parse(old.response);
      return res.json({ ...cached, telemetry: redact(req, cached.telemetry) });
    }
    db.prepare("INSERT INTO commands VALUES(?,?,?,?,?,NULL)").run(
      req.actor.id,
      req.room.id,
      commandId,
      request,
      "pending",
    );
    try {
      const reply = await upstream(req.room.id, "commands", {
        commandId,
        command,
      });
      if (
        reply.commandId !== commandId ||
        reply.status !== "applied_in_simulator"
      )
        throw fail(502, "Confirmação incompatível.");
      db.prepare(
        "UPDATE commands SET status=?,response=? WHERE actor=? AND room_id=? AND command_id=?",
      ).run(
        "confirmed",
        JSON.stringify(reply),
        req.actor.id,
        req.room.id,
        commandId,
      );
      record(req.actor.id, req.room.id, "command_confirmed_simulator", {
        commandId,
        command,
        status: reply.status,
      });
      res.json({ ...reply, telemetry: redact(req, reply.telemetry) });
    } catch (error) {
      db.prepare(
        "UPDATE commands SET status=? WHERE actor=? AND room_id=? AND command_id=?",
      ).run("unconfirmed", req.actor.id, req.room.id, commandId);
      record(req.actor.id, req.room.id, "command_unconfirmed", {
        commandId,
        command,
      });
      throw error;
    }
  });
  app.get("/api/rooms/:roomId/history", (req, res) => {
    requireRoom(req, "history");
    res.json(
      db
        .prepare(
          "SELECT id,at,actor,action,detail FROM audit WHERE room_id=? ORDER BY id DESC LIMIT 100",
        )
        .all(req.room.id)
        .map((r) => ({ ...r, detail: JSON.parse(r.detail) })),
    );
  });
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const duplicate = String(error.message).includes("UNIQUE constraint");
    const status = duplicate
      ? 409
      : Number(error.status || error.statusCode) || 500;
    res.status(status >= 400 && status <= 599 ? status : 500).json({
      error: duplicate
        ? "Leito ou dispositivo já cadastrado."
        : status >= 500
          ? "Serviço indisponível. Confira o backend e o Node-RED."
          : error.message || "Requisição inválida.",
    });
  });
  return { app, ...core };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const core = await createApp();
  const host = process.env.SAMAHI_HOST || "127.0.0.1";
  const server = core.app.listen(
    Number(process.env.SAMAHI_PORT || 3001),
    host,
    () =>
      console.log(
        `SAMAHI backend: ${host}:${process.env.SAMAHI_PORT || 3001}. Banco local persistente. Node-RED continua separado.`,
      ),
  );
  const close = () =>
    server.close(() => {
      core.db.close();
      process.exit(0);
    });
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}
