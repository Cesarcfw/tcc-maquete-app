export function backendAddress(value: string) {
  const url = new URL(value.trim());
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error(
      "Use somente http(s)://endereço:porta, sem caminho ou credenciais.",
    );
  return url.origin;
}
