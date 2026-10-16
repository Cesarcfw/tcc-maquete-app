import { backendAddress } from "../domain/backendAddress";

export const preferencesKey = "@samahi/preferences/v1";
export type Preferences = {
  version: 1;
  backendUrl: string;
  dark: boolean;
  reduceMotion: boolean;
};
export type PreferenceStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
};

// Somente campos conhecidos e não secretos entram no armazenamento local.
export function decodePreferences(
  raw: string | null,
  defaults: Preferences,
): Preferences {
  if (!raw) return { ...defaults };
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== "object" ||
      !("version" in value) ||
      value.version !== 1
    )
      return { ...defaults };
    const saved = value as Partial<Preferences>;
    let backendUrl = defaults.backendUrl;
    try {
      if (typeof saved.backendUrl === "string")
        backendUrl = backendAddress(saved.backendUrl);
    } catch {
      /* Endereço inválido não substitui o padrão. */
    }
    return {
      version: 1,
      backendUrl,
      dark: typeof saved.dark === "boolean" ? saved.dark : defaults.dark,
      reduceMotion:
        typeof saved.reduceMotion === "boolean"
          ? saved.reduceMotion
          : defaults.reduceMotion,
    };
  } catch {
    return { ...defaults };
  }
}

export function createPreferenceStore(
  storage: PreferenceStorage,
  defaults: Preferences,
) {
  let queue = Promise.resolve();
  return {
    async load() {
      return decodePreferences(await storage.getItem(preferencesKey), defaults);
    },
    save(preferences: Preferences) {
      const snapshot: Preferences = {
        version: 1,
        backendUrl: backendAddress(preferences.backendUrl),
        dark: preferences.dark,
        reduceMotion: preferences.reduceMotion,
      };
      // Serializar gravações impede que uma alteração antiga termine por último.
      const result = queue.then(() =>
        storage.setItem(preferencesKey, JSON.stringify(snapshot)),
      );
      queue = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    },
  };
}
