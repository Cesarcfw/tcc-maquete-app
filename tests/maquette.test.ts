import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyCommand,
  connectionState,
  initialState,
  toggleLight,
  selectableIndicatorColors,
} from "../src/domain/maquette";
test("indicador do protótipo oferece quatro cores e rejeita laranja como novo comando", () => {
  assert.deepEqual(selectableIndicatorColors, [
    "red",
    "yellow",
    "green",
    "blue",
  ]);
  assert.equal(
    applyCommand(initialState(0), { kind: "indicator", color: "yellow" })
      .indicator,
    "yellow",
  );
  // Entrada externa invalida: a verificacao em execucao protege tambem o modo local.
  assert.throws(() =>
    applyCommand(initialState(0), {
      kind: "indicator",
      color: "orange",
    } as never),
  );
});
test("desligar e religar restaura a última intensidade positiva", () => {
  const off = applyCommand(initialState(0), toggleLight(initialState(0)));
  assert.equal(off.intensity, 0);
  assert.equal(off.lightOn, false);
  const on = applyCommand(off, toggleLight(off));
  assert.equal(on.intensity, 65);
  assert.equal(on.lightOn, true);
});
test("zero desliga; intensidade positiva liga; valores inválidos são rejeitados", () => {
  const off = applyCommand(initialState(0), {
    kind: "light",
    on: true,
    intensity: 0,
  });
  assert.equal(off.lightOn, false);
  const on = applyCommand(off, { kind: "light", on: true, intensity: 25 });
  assert.equal(on.intensity, 25);
  for (const intensity of [-1, 101, 2.5, NaN])
    assert.throws(() =>
      applyCommand(on, { kind: "light", on: true, intensity }),
    );
});
test("leitura antiga e desconexão não são apresentadas como conexão atual", () => {
  assert.equal(connectionState("normal", 0, 9999), "online");
  assert.equal(connectionState("stale", 0, 10000), "stale");
  assert.equal(connectionState("offline", 9999, 10000), "offline");
});
test("alterar indicador preserva sensores e iluminação", () => {
  const state = initialState(42);
  assert.deepEqual(applyCommand(state, { kind: "indicator", color: "red" }), {
    ...state,
    indicator: "red",
  });
});
