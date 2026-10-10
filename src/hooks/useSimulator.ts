import { useEffect, useRef, useState } from "react";
import { useNodeRed } from "./useNodeRed";
import {
  applyCommand,
  Command,
  connectionState,
  describeCommand,
  initialState,
  Scenario,
  GasStatus,
  gasStatusLabels,
  applyGasReading,
  acknowledgeGas,
} from "../domain/maquette";
export type LogEntry = {
  id: number;
  time: string;
  message: string;
  type: "info" | "success" | "error";
};
const initialSession = () => ({
  device: initialState(),
  scenario: "normal" as Scenario,
  pending: false,
  notice: "Simulação pronta. Nenhum equipamento físico conectado.",
  logs: [] as LogEntry[],
});
type Session = ReturnType<typeof initialSession>;
export function useSimulator(
  environment = "quarto-01",
  endpoint = "https://servico.exemplo",
) {
  const local = useLocalSimulator(environment);
  const remote = useNodeRed(
    environment,
    endpoint === "https://servico.exemplo" ? "" : endpoint,
  );
  return {
    ...(endpoint === "https://servico.exemplo" ? local : remote),
    setAutomatic() {
      if (endpoint !== "https://servico.exemplo")
        void remote.send({ kind: "automatic" });
    },
  };
}
function useLocalSimulator(environment = "quarto-01") {
  const [sessions, setSessions] = useState<Record<string, Session>>(() => ({
    [environment]: initialSession(),
  }));
  const sessionsRef = useRef(sessions),
    active = useRef(environment);
  const [now, setNow] = useState(() => Date.now());
  const generation = useRef(0),
    sequence = useRef(0),
    busy = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  function update(id: string, action: (current: Session) => Session) {
    const next = {
      ...sessionsRef.current,
      [id]: action(sessionsRef.current[id] ?? initialSession()),
    };
    sessionsRef.current = next;
    setSessions(next);
  }
  function log(
    current: Session,
    message: string,
    type: LogEntry["type"] = "info",
  ): Session {
    return {
      ...current,
      logs: [
        {
          id: ++sequence.current,
          time: new Date().toLocaleTimeString("pt-BR"),
          message,
          type,
        },
        ...current.logs,
      ].slice(0, 30),
    };
  }
  function cancelPending() {
    generation.current++;
    busy.current = false;
    if (timeout.current) clearTimeout(timeout.current);
    update(active.current, (current) => {
      const next = {
        ...current,
        pending: false,
        notice: current.pending
          ? "Comando pendente cancelado; último estado preservado."
          : current.notice,
      };
      return current.pending ? log(next, next.notice) : next;
    });
  }
  useEffect(() => {
    if (active.current !== environment) {
      generation.current++;
      busy.current = false;
      if (timeout.current) clearTimeout(timeout.current);
      update(active.current, (current) => {
        const next = {
          ...current,
          pending: false,
          notice: current.pending
            ? "Troca de ambiente: comando pendente cancelado."
            : current.notice,
        };
        return current.pending ? log(next, next.notice) : next;
      });
      active.current = environment;
    }
    if (!sessionsRef.current[environment])
      update(environment, (current) => current);
  }, [environment]);
  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now();
      setNow(time);
      const next = Object.fromEntries(
        Object.entries(sessionsRef.current).map(([id, current]) => [
          id,
          current.scenario === "normal" || current.scenario === "timeout"
            ? { ...current, device: { ...current.device, receivedAt: time } }
            : current,
        ]),
      );
      sessionsRef.current = next;
      setSessions(next);
    }, 1000);
    return () => {
      clearInterval(interval);
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);
  const session = sessions[environment] ?? initialSession();
  function selectScenario(next: Scenario) {
    cancelPending();
    const time = Date.now();
    setNow(time);
    const message = {
      normal:
        "Comunicação simulada restabelecida. Comandos cancelados não serão reaplicados.",
      offline:
        "Sem comunicação. Controles pausados; última leitura preservada.",
      stale:
        "Leitura desatualizada. Controles pausados até receber novos dados.",
      timeout: "Cenário de teste: comandos não recebem confirmação.",
    }[next];
    update(environment, (current) =>
      log(
        {
          ...current,
          scenario: next,
          pending: false,
          device:
            next === "offline"
              ? current.device
              : {
                  ...current.device,
                  receivedAt: next === "stale" ? time - 18000 : time,
                },
          notice: message,
        },
        message,
      ),
    );
  }
  function send(command: Command, actor?: string) {
    const current = sessionsRef.current[environment];
    if (
      !current ||
      active.current !== environment ||
      busy.current ||
      connectionState(
        current.scenario,
        current.device.receivedAt,
        Date.now(),
      ) !== "online"
    )
      return;
    busy.current = true;
    const revision = generation.current;
    const label = `${actor ? `${actor}: ` : ""}${describeCommand(command)}`;
    update(environment, (value) =>
      log(
        {
          ...value,
          pending: true,
          notice: `${label}: aguardando confirmação simulada…`,
        },
        `${label}: solicitado.`,
      ),
    );
    const fails = current.scenario === "timeout";
    timeout.current = setTimeout(
      () => {
        if (generation.current !== revision || active.current !== environment)
          return;
        busy.current = false;
        update(environment, (value) =>
          fails
            ? log(
                {
                  ...value,
                  pending: false,
                  notice: "Não confirmado. O estado anterior foi preservado.",
                },
                `${label}: sem confirmação após 5 s.`,
                "error",
              )
            : log(
                {
                  ...value,
                  pending: false,
                  device: applyCommand(value.device, command),
                  notice: `${label}: confirmado na simulação.`,
                },
                `${label}: confirmado na simulação.`,
                "success",
              ),
        );
      },
      fails ? 5000 : 650,
    );
  }
  return {
    ...session,
    now,
    selectScenario,
    send,
    cancelPending,
    connection: connectionState(
      session.scenario,
      session.device.receivedAt,
      now,
    ),
    reset() {
      cancelPending();
      update(environment, () => initialSession());
      setNow(Date.now());
    },
    simulateGas(status: GasStatus) {
      const current = sessionsRef.current[environment];
      if (
        !current ||
        connectionState(
          current.scenario,
          current.device.receivedAt,
          Date.now(),
        ) !== "online"
      )
        return;
      update(environment, (value) =>
        log(
          {
            ...value,
            device: {
              ...applyGasReading(value.device, status),
              receivedAt: Date.now(),
            },
          },
          `Sensor de gás (simulação): ${gasStatusLabels[status]}.`,
          status === "detected" ? "error" : "info",
        ),
      );
    },
    acknowledgeGasAlert(actor: string) {
      update(environment, (value) =>
        value.device.gas !== "detected" || value.device.gasAcknowledged
          ? value
          : log(
              { ...value, device: acknowledgeGas(value.device) },
              `${actor}: alerta de gás reconhecido. Detecção e triagem preservadas.`,
            ),
      );
    },
  };
}
