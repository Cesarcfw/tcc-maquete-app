import test from "node:test";
import assert from "node:assert/strict";
import { connectionSummary } from "../../scripts/connection-summary.mjs";

test("banner informa IP e porta reais do backend, com distincao do ESP e Node-RED", () => {
  const text = connectionSummary("192.168.4.2", 3002);
  assert.match(text, /COLOQUE NO APP: http:\/\/192\.168\.4\.2:3002/);
  assert.match(text, /BACKEND/);
  assert.doesNotMatch(text, /COLOQUE NO APP:.*:1880/);
});
test("loopback informa que o acesso esta restrito ao computador", () => {
  assert.match(
    connectionSummary("127.0.0.1", 3001),
    /somente neste computador/,
  );
});
test("wildcard lista enderecos acessiveis sem apresentar 0.0.0.0 ao usuario", () => {
  const text = connectionSummary("0.0.0.0", 3002, {
    wifi: [{ family: "IPv4", internal: false, address: "192.168.4.2" }],
    loop: [{ family: "IPv4", internal: true, address: "127.0.0.1" }],
  });
  assert.match(text, /http:\/\/192\.168\.4\.2:3002/);
  assert.doesNotMatch(text, /http:\/\/(0\.0\.0\.0|127\.0\.0\.1)/);
});
