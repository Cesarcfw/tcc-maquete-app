import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { stdin, stdout } from "node:process";
import { createCore, text } from "./core.mjs";
let muted = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) stdout.write(chunk, encoding);
    callback();
  },
});
const rl = createInterface({
  input: stdin,
  output,
  terminal: Boolean(stdin.isTTY),
});
let core;
try {
  core = await createCore();
  if (core.db.prepare("SELECT count(*) AS n FROM user").get().n)
    throw new Error(
      "Instalação já inicializada. Não sobrescrevemos contas ou senhas.",
    );
  const name = text(await rl.question("Nome do administrador: "), "nome");
  const email = text(await rl.question("Email do administrador: "), "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Email inválido.");
  console.log("Defina uma senha de 12 a 128 caracteres (entrada oculta):");
  muted = true;
  const password = await rl.question("");
  muted = false;
  console.log();
  console.log("Repita a senha (entrada oculta):");
  muted = true;
  const repeated = await rl.question("");
  muted = false;
  console.log();
  if (password !== repeated || password.length < 12 || password.length > 128)
    throw new Error("Senhas diferentes ou tamanho inválido.");
  await core.bootstrap({ name, email, password });
  console.log(
    "Administrador criado. Execute npm start nesta pasta e faça login no app.",
  );
} catch (error) {
  muted = false;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  core?.db.close();
}
