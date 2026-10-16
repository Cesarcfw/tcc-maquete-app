import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPreferenceStore, Preferences } from "../services/preferences";

export function usePreferences(defaults: Preferences) {
  const [store] = useState(() => createPreferenceStore(AsyncStorage, defaults));
  const [preferences, setPreferences] = useState(defaults);
  const current = useRef(defaults);
  const revision = useRef(0);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [warning, setWarning] = useState("");
  useEffect(() => {
    let active = true;
    store
      .load()
      .then((saved) => {
        if (!active) return;
        current.current = saved;
        setPreferences(saved);
      })
      .catch(() => {
        if (active)
          setWarning(
            "Não foi possível carregar as preferências deste aparelho. Confira o endereço antes de entrar.",
          );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [store]);

  const update = useCallback(
    (patch: Partial<Omit<Preferences, "version">>) => {
      if (!ready) return;
      const next = { ...current.current, ...patch };
      current.current = next;
      setPreferences(next);
      const id = ++revision.current;
      setStatus("saving");
      void store
        .save(next)
        .then(() => {
          if (id !== revision.current) return;
          setStatus("saved");
          setWarning("");
        })
        .catch(() => {
          if (id !== revision.current) return;
          setStatus("error");
          setWarning(
            "Não foi possível salvar as preferências neste aparelho. A alteração vale nesta abertura; tente novamente para mantê-la ao reabrir.",
          );
        });
    },
    [ready, store],
  );
  return { preferences, ready, status, warning, update };
}
