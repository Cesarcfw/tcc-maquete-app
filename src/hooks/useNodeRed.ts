import { useEffect, useRef, useState } from "react";
import {
  Command,
  GasStatus,
  Scenario,
  connectionState,
  initialState,
} from "../domain/maquette";
import {
  decodeTelemetry,
  requestNodeRed,
  sendNodeRedCommand,
} from "../services/nodeRed";
import type { LogEntry } from "./useSimulator";
import type { LightingSchedule } from "../../shared/lighting-schedule.cjs";

export function useNodeRed(environment: string, endpoint: string) {
  const [device, setDevice] = useState(() => initialState(0));
  const [pending, setPending] = useState(false);
  const [online, setOnline] = useState(false);
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [notice, setNotice] = useState(
    "Aguardando Node-RED local. Nenhum equipamento físico conectado.",
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const revision = useRef(0),
    busy = useRef(false),
    sequence = useRef(0);
  const reportRevision = useRef(0);
  function log(message: string, type: LogEntry["type"] = "info") {
    setNotice(message);
    setLogs((current) =>
      [
        {
          id: ++sequence.current,
          time: new Date().toLocaleTimeString("pt-BR"),
          message,
          type,
        },
        ...current,
      ].slice(0, 30),
    );
  }
  function cancelPending() {
    revision.current++;
    busy.current = false;
    setPending(false);
  }
  useEffect(() => {
    const lifecycle = revision;
    revision.current++;
    let alive = true,
      reading = false;
    busy.current = false;
    async function poll() {
      if (!endpoint || reading || busy.current) return;
      reading = true;
      const report = reportRevision.current;
      try {
        const result = await requestNodeRed(endpoint, environment, "telemetry");
        const data = decodeTelemetry(result, environment);
        if (alive && report === reportRevision.current) {
          setDevice(data);
          setOnline(true);
        }
      } catch {
        if (alive && report === reportRevision.current) setOnline(false);
      } finally {
        reading = false;
      }
    }
    const start = setTimeout(() => {
      setPending(false);
      setOnline(false);
      setDevice(initialState(0));
      setLogs([]);
      setScenario("normal");
      setNotice(
        "Aguardando Node-RED local. Nenhum equipamento físico conectado.",
      );
      void poll();
    }, 0);
    const interval = setInterval(() => {
      setNow(Date.now());
      void poll();
    }, 2000);
    return () => {
      alive = false;
      clearInterval(interval);
      clearTimeout(start);
      lifecycle.current++;
    };
  }, [environment, endpoint]);
  async function send(
    command:
      | Command
      | { kind: "acknowledgeGas" }
      | {
          kind: "lightingSchedule";
          enabled: boolean;
          schedule: LightingSchedule;
        },
    actor?: string,
  ) {
    if (
      !online ||
      busy.current ||
      connectionState("normal", device.receivedAt, Date.now()) !== "online"
    )
      return;
    busy.current = true;
    setPending(true);
    reportRevision.current++;
    const generation = revision.current;
    const commandId = `app-${Date.now()}-${++sequence.current}`;
    log(
      `${actor ? actor + ": " : ""}comando enviado ao Node-RED; aguardando confirmação.`,
    );
    try {
      const data = await sendNodeRedCommand(
        endpoint,
        environment,
        command,
        commandId,
      );
      if (revision.current === generation) {
        setDevice(data);
        setOnline(true);
        log("Comando confirmado pelo simulador Node-RED.", "success");
      }
    } catch (error) {
      if (revision.current === generation)
        log(
          `Sem confirmação: ${error instanceof Error ? error.message : "falha de comunicação"}. Último estado reportado preservado.`,
          "error",
        );
    } finally {
      if (revision.current === generation) {
        busy.current = false;
        setPending(false);
      }
    }
  }
  async function configure(action: string, body: unknown) {
    cancelPending();
    reportRevision.current++;
    const generation = revision.current;
    try {
      const result = await requestNodeRed(endpoint, environment, action, body);
      const data = decodeTelemetry(result, environment);
      if (revision.current !== generation) return;
      setDevice(data);
      setScenario(result.scenario);
      setOnline(result.scenario !== "offline");
      log("Cenário atualizado no simulador Node-RED.", "success");
    } catch (error) {
      if (revision.current === generation)
        log(
          error instanceof Error
            ? error.message
            : "Falha ao configurar o simulador.",
          "error",
        );
    }
  }
  return {
    device,
    pending,
    notice,
    logs,
    scenario,
    now,
    cancelPending,
    send,
    connection: online
      ? connectionState("normal", device.receivedAt, now)
      : ("offline" as const),
    selectScenario(next: Scenario) {
      void configure("simulation", { scenario: next });
    },
    reset() {
      void configure("reset", {});
    },
    simulateGas(status: GasStatus) {
      void configure("simulation", {
        gasUnavailable: status === "unavailable",
        gasRawAdc: status === "detected" ? 3628 : 843,
      });
    },
    acknowledgeGasAlert(actor: string) {
      void send({ kind: "acknowledgeGas" }, actor);
    },
  };
}
