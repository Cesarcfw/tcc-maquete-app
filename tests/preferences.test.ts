import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createPreferenceStore,
  decodePreferences,
  preferencesKey,
  type Preferences,
} from "../src/services/preferences";

const defaults: Preferences = {
  version: 1,
  backendUrl: "http://127.0.0.1:3001",
  dark: true,
  reduceMotion: false,
};

test("reabrir restaura endereço, tema e animações; dados de sessão não são gravados", async () => {
  const disk = new Map<string, string>();
  const storage = {
    getItem: async (key: string) => disk.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      disk.set(key, value);
    },
  };
  const first = createPreferenceStore(storage, defaults);
  assert.deepEqual(await first.load(), defaults);
  const saved = {
    ...defaults,
    backendUrl: " http://192.168.1.9:3002/ ",
    dark: false,
    reduceMotion: true,
    token: "nao-gravar",
    password: "nao-gravar",
  };
  await first.save(saved);
  const reopened = createPreferenceStore(storage, defaults);
  assert.deepEqual(await reopened.load(), {
    version: 1,
    backendUrl: "http://192.168.1.9:3002",
    dark: false,
    reduceMotion: true,
  });
  assert.equal(disk.size, 1);
  assert.doesNotMatch(disk.get(preferencesKey)!, /token|password|nao-gravar/);
});

test("conteúdo inválido ou versão desconhecida usa padrões sem derrubar a entrada", () => {
  for (const raw of [
    null,
    "{",
    "null",
    "[]",
    "1",
    '{"version":2,"dark":false}',
  ])
    assert.deepEqual(decodePreferences(raw, defaults), defaults);
  assert.deepEqual(
    decodePreferences(
      JSON.stringify({
        version: 1,
        backendUrl: "https://user:secret@example.com",
        dark: false,
        reduceMotion: "true",
      }),
      defaults,
    ),
    { ...defaults, dark: false },
  );
});

test("endereço inválido não sobrescreve a configuração válida", async () => {
  let value: string | null = null;
  const store = createPreferenceStore(
    {
      getItem: async () => value,
      setItem: async (_, raw) => {
        value = raw;
      },
    },
    defaults,
  );
  await store.save({ ...defaults, backendUrl: "https://samahi.example" });
  for (const backendUrl of [
    "",
    "http:",
    "ftp://example.com",
    "http://example.com/path",
    "http://user:secret@example.com",
  ])
    assert.throws(() => store.save({ ...defaults, backendUrl }));
  assert.equal((await store.load()).backendUrl, "https://samahi.example");
});

test("gravações rápidas são serializadas para a última configuração vencer", async () => {
  let disk: string | null = null;
  let release!: () => void;
  let writes = 0;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const store = createPreferenceStore(
    {
      getItem: async () => disk,
      setItem: async (_, raw) => {
        writes++;
        if (writes === 1) await gate;
        disk = raw;
      },
    },
    defaults,
  );
  const a = store.save({ ...defaults, backendUrl: "http://192.168.1.9:3002" });
  const b = store.save({
    ...defaults,
    backendUrl: "http://192.168.1.10:3002",
    dark: false,
  });
  await Promise.resolve();
  assert.equal(writes, 1);
  release();
  await Promise.all([a, b]);
  assert.equal(writes, 2);
  assert.deepEqual(await store.load(), {
    ...defaults,
    backendUrl: "http://192.168.1.10:3002",
    dark: false,
  });
});

test("falha de gravação é reportada e próxima tentativa ainda funciona", async () => {
  let disk: string | null = null;
  let fail = false;
  const store = createPreferenceStore(
    {
      getItem: async () => disk,
      setItem: async (_, raw) => {
        if (fail) throw Error("storage unavailable");
        disk = raw;
      },
    },
    defaults,
  );
  await store.save(defaults);
  fail = true;
  await assert.rejects(store.save({ ...defaults, dark: false }));
  assert.equal((await store.load()).dark, true);
  fail = false;
  await store.save({ ...defaults, dark: false });
  assert.equal((await store.load()).dark, false);
});

test("falha de leitura não é confundida com ausência de configuração", async () => {
  const store = createPreferenceStore(
    {
      getItem: async () => {
        throw Error("storage unavailable");
      },
      setItem: async () => {},
    },
    defaults,
  );
  await assert.rejects(store.load());
});
