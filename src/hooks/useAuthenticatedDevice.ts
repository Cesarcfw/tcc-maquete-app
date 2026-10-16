import { useEffect, useRef, useState } from "react";
import { backendRequest, Reading, Audit } from "../services/backend";
import {
  Command,
  GasStatus,
  IndicatorColor,
  Scenario,
  connectionState,
  initialState,
} from "../domain/maquette";
import type { LogEntry } from "./useSimulator";

export type AuthenticatedWorkspace = {
  base: string;
  token: string;
  onLogout: () => void;
  onExpired: () => void;
};
const eventNames: Record<string, string> = {
  command_confirmed_simulator: "Comando confirmado pelo simulador Node-RED",
  command_unconfirmed: "Comando sem confirmação",
  gas_status_changed: "Estado do sensor de gás atualizado",
  room_created: "Ambiente cadastrado",
  room_updated: "Ambiente atualizado",
  grants_updated: "Permissões atualizadas",
};
export function useAuthenticatedDevice(
  roomId: string,
  workspace?: AuthenticatedWorkspace,
) {
  const [device, setDevice] = useState(() => initialState(0));
  const [online, setOnline] = useState(false),
    [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(
    "Aguardando leitura autenticada do backend.",
  );
  const [logs, setLogs] = useState<LogEntry[]>([]),
    [now, setNow] = useState(Date.now);
  const generation = useRef(0),
    report = useRef(0),
    busy = useRef(false);
  const base = workspace?.base,
    token = workspace?.token;
  const decode = (t: Reading) => ({
    temperature: t.temperatureC ?? 0,
    humidity: t.humidityPercent ?? 0,
    gas: (t.gasStatus || "unavailable") as GasStatus,
    gasAcknowledged: !!t.gasAcknowledged,
    receivedAt: Date.now() - t.sampleAgeMs,
    lightOn: !!t.lightOn,
    intensity: t.lightIntensityPercent ?? 0,
    lastPositiveIntensity: t.lastPositiveIntensity ?? 65,
    indicator: (t.indicatorColor || "off") as IndicatorColor,
  });
  useEffect(() => {
    const lifecycle = generation;
    lifecycle.current++;
    let alive = true,
      reading = false;
    const poll = async () => {
      if (!base || !token || !roomId || reading || busy.current) return;
      reading = true;
      const revision = report.current;
      try {
        const t = (
          await backendRequest<Reading>(
            base,
            `/api/rooms/${roomId}/telemetry`,
            token,
          )
        ).data;
        if (alive && revision === report.current) {
          setDevice(decode(t));
          setOnline(true);
        }
      } catch (error) {
        if (alive && revision === report.current) {
          setOnline(false);
          setNotice(
            error instanceof Error ? error.message : "Falha no backend.",
          );
        }
      }
      // Histórico é independente da permissão de telemetria.
      try {
        const events = (
          await backendRequest<Audit[]>(
            base,
            `/api/rooms/${roomId}/history`,
            token,
          )
        ).data;
        if (alive)
          setLogs(
            events.map((e) => ({
              id: e.id,
              time: new Date(e.at).toLocaleTimeString("pt-BR"),
              message: eventNames[e.action] || "Registro do ambiente",
              type:
                e.action === "command_unconfirmed"
                  ? "error"
                  : e.action === "command_confirmed_simulator"
                    ? "success"
                    : "info",
            })),
          );
      } catch {
        if (alive) setLogs([]);
      }
      reading = false;
    };
    const start = setTimeout(() => {
      setDevice(initialState(0));
      setOnline(false);
      setPending(false);
      setLogs([]);
      busy.current = false;
      void poll();
    }, 0);
    const timer = setInterval(() => {
      setNow(Date.now());
      void poll();
    }, 2000);
    return () => {
      alive = false;
      lifecycle.current++;
      clearInterval(timer);
      clearTimeout(start);
    };
  }, [base, token, roomId]);
  function cancelPending() {
    generation.current++;
    busy.current = false;
    setPending(false);
  }
  async function send(
    command: Command | { kind: "automatic" } | { kind: "acknowledgeGas" },
  ) {
    if (
      !base ||
      !token ||
      busy.current ||
      !online ||
      connectionState("normal", device.receivedAt, Date.now()) !== "online"
    )
      return;
    busy.current = true;
    setPending(true);
    report.current++;
    const current = generation.current;
    setNotice("Comando enviado; aguardando confirmação do backend.");
    try {
      const commandId = `app-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const reply = (
        await backendRequest<{
          commandId: string;
          status: string;
          telemetry: Reading;
        }>(base, `/api/rooms/${roomId}/commands`, token, { commandId, command })
      ).data;
      if (
        reply.commandId !== commandId ||
        reply.status !== "applied_in_simulator"
      )
        throw new Error("Confirmação incompatível.");
      if (current === generation.current) {
        setDevice(decode(reply.telemetry));
        setOnline(true);
        setNotice(
          "Comando confirmado pelo simulador Node-RED, via backend autenticado.",
        );
      }
    } catch (error) {
      if (current === generation.current)
        setNotice(
          `Sem confirmação: ${error instanceof Error ? error.message : "falha de rede"}. Último estado preservado.`,
        );
    } finally {
      if (current === generation.current) {
        busy.current = false;
        setPending(false);
      }
    }
  }
  const unavailable = () =>
    setNotice(
      "Altere os cenários no Node-RED. O painel autenticado não simula comandos locais.",
    );
  return {
    device,
    online,
    pending,
    notice,
    logs,
    now,
    scenario: "normal" as Scenario,
    cancelPending,
    send,
    connection: online
      ? connectionState("normal", device.receivedAt, now)
      : ("offline" as const),
    setAutomatic() {
      void send({ kind: "automatic" });
    },
    acknowledgeGasAlert(_actor: string) {
      void send({ kind: "acknowledgeGas" });
    },
    selectScenario(_scenario: Scenario) {
      unavailable();
    },
    simulateGas(_status: GasStatus) {
      unavailable();
    },
    reset: unavailable,
  };
}
