type HistoryPresentation = {
  message: string;
  type: "info" | "success" | "error";
};

export function describeAuditEvent(
  action: string,
  detail: unknown,
): HistoryPresentation {
  const fields =
    detail && typeof detail === "object"
      ? (detail as Record<string, unknown>)
      : {};
  if (action === "gas_status_changed") {
    if (fields.current === "detected")
      return { message: "Gás detectado no ambiente", type: "error" };
    if (fields.current === "unavailable")
      return {
        message: "Leitura do sensor de gás indisponível",
        type: "error",
      };
    if (fields.current === "clear")
      return { message: "Sensor de gás sem detecção", type: "info" };
    return { message: "Estado do sensor de gás atualizado", type: "info" };
  }
  const events: Record<string, HistoryPresentation> = {
    command_confirmed_simulator: {
      message: "Comando confirmado pelo serviço",
      type: "success",
    },
    command_unconfirmed: { message: "Comando sem confirmação", type: "error" },
    communication_lost: {
      message: "Comunicação com o serviço do ambiente perdida",
      type: "error",
    },
    telemetry_stale: {
      message: "Leitura do ambiente desatualizada",
      type: "error",
    },
    communication_restored: {
      message: "Comunicação restabelecida com leitura atualizada",
      type: "info",
    },
    room_created: { message: "Ambiente cadastrado", type: "info" },
    room_updated: { message: "Ambiente atualizado", type: "info" },
    grants_updated: { message: "Permissões atualizadas", type: "info" },
  };
  return events[action] || { message: "Registro do ambiente", type: "info" };
}
