// Verificação local, sem rede: links para arquivos e referências internas OpenAPI.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory()
      ? markdownFiles(path)
      : entry.name.endsWith(".md")
        ? [path]
        : [];
  });
}
const errors = [];
let links = 0;
const files = [
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "backend/README.md",
].map((path) => resolve(root, path));
files.push(...markdownFiles(resolve(root, "docs")));
for (const file of files) {
  const body = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const match of body.matchAll(/!?\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
    const url = match[1].trim().replace(/^<|>$/g, "");
    if (/^[a-zA-Z][\w+.-]*:/.test(url) || url.startsWith("#")) continue;
    const target = decodeURIComponent(url.split("#")[0]);
    if (!target) continue;
    links++;
    if (!existsSync(resolve(dirname(file), target))) {
      errors.push(`${relative(root, file)}: arquivo ausente ${url}`);
    }
  }
}
for (const file of ["backend.openapi.json", "node-red.openapi.json"]) {
  const spec = JSON.parse(
    readFileSync(resolve(root, "docs/api", file), "utf8"),
  );
  const ids = new Set();
  const walk = (value) => {
    if (!value || typeof value !== "object") return;
    if (value.$ref?.startsWith("#/")) {
      const target = value.$ref
        .slice(2)
        .split("/")
        .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
        .reduce((current, key) => current?.[key], spec);
      if (!target) errors.push(`${file}: $ref ausente ${value.$ref}`);
    }
    if (value.operationId) {
      if (ids.has(value.operationId))
        errors.push(`${file}: operationId repetido ${value.operationId}`);
      ids.add(value.operationId);
    }
    Object.values(value).forEach(walk);
  };
  walk(spec);
  console.log(
    `${file}: ${ids.size} operações, referências internas conferidas.`,
  );
}
console.log(`${files.length} Markdown; ${links} links locais de arquivos.`);
console.log(
  "Não verifica URLs externas, âncoras ou equivalência com o runtime.",
);
if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exitCode = 1;
} else console.log("Documentação: referências locais válidas.");
