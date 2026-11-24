import { networkInterfaces } from "node:os";

export function connectionSummary(
  host,
  port,
  interfaces = networkInterfaces(),
) {
  const addresses =
    host === "0.0.0.0"
      ? [
          ...new Set(
            Object.values(interfaces)
              .flat()
              .filter((v) => v && v.family === "IPv4" && !v.internal)
              .map((v) => v.address),
          ),
        ]
      : [host];
  const lines = [
    "",
    "========== CONEXAO SAMAHI ==========",
    ...addresses.map((ip) => `COLOQUE NO APP: http://${ip}:${port}`),
  ];
  if (["127.0.0.1", "localhost", "::1"].includes(host)) {
    lines.push(
      "Acesso somente neste computador. Para o telefone, use Iniciar-SAMAHI-Notebook.cmd.",
    );
  } else {
    lines.push(
      "Telefone e notebook devem usar a mesma rede.",
      "Esse e o endereco do BACKEND; nao informe a porta 1880 nem o IP do ESP no app.",
    );
  }
  return [...lines, "===================================", ""].join("\n");
}
