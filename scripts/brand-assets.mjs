// Exportações técnicas da arte raster; Sharp é ferramenta local, não dependência do app.
// SAMAHI_SHARP_PATH pode apontar para um pacote Sharp instalado fora do projeto.
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require(process.env.SAMAHI_SHARP_PATH || "sharp");
const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.join(root, "assets/brand");
const evidence = path.join(root, "docs/identidade-visual");
await mkdir(evidence, { recursive: true });
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const surface = "#0B1329";
const canvas = (width, height, background = transparent) =>
  sharp({ create: { width, height, channels: 4, background } });
const svg = (width, height, content) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${content}</svg>`,
  );
const label = (x, y, text, fill = "#17283E", size = 24, weight = 400) =>
  `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${text}</text>`;
const master = await sharp(path.join(out, "source-symbol.png"))
  .trim()
  .png()
  .toBuffer();
const mono = await sharp(path.join(out, "source-monochrome.png"))
  .trim()
  .png()
  .toBuffer();
async function centered(input, box, mark, background = transparent) {
  const image = await sharp(input)
    .resize(mark, mark, { fit: "inside" })
    .png()
    .toBuffer();
  return canvas(box, box, background)
    .composite([{ input: image, gravity: "centre" }])
    .png()
    .toBuffer();
}
async function save(name, input) {
  await writeFile(path.join(out, name), input);
}
const symbol = await centered(master, 1024, 896);
await save("symbol.png", symbol);
await save("symbol-ui.png", await sharp(symbol).resize(256).png().toBuffer());
await save("symbol-monochrome.png", await centered(mono, 1024, 896));
await save("app-icon.png", await centered(master, 1024, 760, surface));
// 560 px também mantém os arcos dentro do círculo seguro central de 66/108.
await save("adaptive-foreground.png", await centered(master, 1024, 560));
await save("adaptive-monochrome.png", await centered(mono, 1024, 560));
await save("favicon.png", await centered(master, 64, 56, surface));

for (const [theme, color] of [
  ["light", "#006398"],
  ["dark", "#EDF3FD"],
]) {
  const name = await sharp(
    svg(1120, 250, label(0, 205, "SAMAHI", color, 244, 700)),
  )
    .trim()
    .png()
    .toBuffer();
  await save(`wordmark-${theme}.png`, name);
  const nameSized = await sharp(name).resize({ width: 900 }).png().toBuffer();
  const nameMeta = await sharp(nameSized).metadata();
  const mark = await sharp(symbol).resize(280).png().toBuffer();
  const lockup = await canvas(1250, 300)
    .composite([
      { input: mark, left: 0, top: 10 },
      {
        input: nameSized,
        left: 320,
        top: Math.floor((300 - nameMeta.height) / 2),
      },
    ])
    .png()
    .toBuffer();
  await save(`logo-horizontal-${theme}.png`, lockup);
  const complete = await canvas(1250, 420)
    .composite([
      { input: lockup, left: 0, top: 0 },
      {
        input: svg(
          1250,
          110,
          label(320, 28, "Sistema de Automação e Monitoramento", color, 34) +
            label(320, 76, "de Ambientes Hospitalares Inteligentes", color, 34),
        ),
        left: 0,
        top: 300,
      },
    ])
    .png()
    .toBuffer();
  await save(`logo-complete-${theme}.png`, complete);
}

// Prancha de conferência: os ícones são os arquivos exportados, não redesenhados.
const layers = [
  {
    input: svg(
      1400,
      1100,
      `<rect width="1400" height="1100" fill="#F8FAFC"/><rect x="700" width="700" height="560" fill="${surface}"/>` +
        label(
          48,
          55,
          "SAMAHI · identidade para o aplicativo",
          "#17283E",
          28,
          700,
        ) +
        label(48, 110, "Fundo claro · assinatura principal") +
        label(748, 110, "Fundo escuro · assinatura principal", "#EDF3FD") +
        label(48, 365, "Símbolo separado") +
        label(748, 365, "Nome separado", "#EDF3FD") +
        label(48, 625, "Ícone do aplicativo", "#17283E", 24, 700) +
        label(420, 625, "Recorte circular Android", "#17283E", 24, 700) +
        label(840, 625, "Camada monocromática", "#17283E", 24, 700) +
        label(48, 1010, "Interface: símbolo + nome. Ícone: somente símbolo.") +
        label(
          48,
          1050,
          "Arquivos PNG · originais preservados · sem texto minúsculo nos cabeçalhos.",
          "#506277",
          22,
        ),
    ),
    left: 0,
    top: 0,
  },
];
for (const [name, left, top, width] of [
  ["logo-horizontal-light.png", 48, 160, 600],
  ["logo-horizontal-dark.png", 748, 160, 600],
  ["symbol.png", 48, 390, 140],
  ["wordmark-dark.png", 748, 420, 360],
  ["app-icon.png", 48, 665, 270],
  ["adaptive-monochrome.png", 840, 665, 270],
]) {
  layers.push({
    input: await sharp(path.join(out, name)).resize({ width }).png().toBuffer(),
    left,
    top,
  });
}
const adaptive = await canvas(270, 270, surface)
  .composite([
    {
      input: await sharp(path.join(out, "adaptive-foreground.png"))
        .resize(270)
        .toBuffer(),
    },
  ])
  .png()
  .toBuffer();
const circle = await sharp(adaptive)
  .composite([
    {
      input: svg(270, 270, '<circle cx="135" cy="135" r="135" fill="white"/>'),
      blend: "dest-in",
    },
  ])
  .png()
  .toBuffer();
layers.push({ input: circle, left: 420, top: 665 });
await canvas(1400, 1100)
  .composite(layers)
  .png()
  .toFile(path.join(evidence, "prancha.png"));
console.log(
  "Identidade exportada em assets/brand; prancha em docs/identidade-visual/prancha.png.",
);
