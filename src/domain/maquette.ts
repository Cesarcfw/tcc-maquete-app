export type IndicatorColor =
  "red" | "orange" | "yellow" | "green" | "blue" | "off";
export type Scenario = "normal" | "offline" | "stale" | "timeout";
export type Command =
  | { kind: "light"; on: boolean; intensity: number }
  | { kind: "indicator"; color: IndicatorColor };
export type DeviceState = {
  temperature: number;
  humidity: number;
  receivedAt: number;
  lightOn: boolean;
  intensity: number;
  lastPositiveIntensity: number;
  indicator: IndicatorColor;
};
export function initialState(now = Date.now()): DeviceState {
  return {
    temperature: 24.6,
    humidity: 58,
    receivedAt: now,
    lightOn: true,
    intensity: 65,
    lastPositiveIntensity: 65,
    indicator: "blue",
  };
}
export function connectionState(
  scenario: Scenario,
  receivedAt: number,
  now: number,
): "online" | "offline" | "stale" {
  if (scenario === "offline") return "offline";
  return now - receivedAt >= 10000 ? "stale" : "online";
}
export function applyCommand(
  state: DeviceState,
  command: Command,
): DeviceState {
  if (command.kind === "indicator")
    return { ...state, indicator: command.color };
  if (
    !Number.isInteger(command.intensity) ||
    command.intensity < 0 ||
    command.intensity > 100
  )
    throw new Error("Intensidade inválida.");
  const intensity = command.on ? command.intensity : 0;
  return {
    ...state,
    lightOn: intensity > 0,
    intensity,
    lastPositiveIntensity:
      intensity > 0 ? intensity : state.lastPositiveIntensity,
  };
}
export function toggleLight(state: DeviceState): Command {
  return {
    kind: "light",
    on: !state.lightOn,
    intensity: state.lightOn ? 0 : state.lastPositiveIntensity || 100,
  };
}
export const colorNames: Record<IndicatorColor, string> = {
  blue: "Azul",
  green: "Verde",
  red: "Vermelho",
  orange: "Laranja",
  yellow: "Amarelo",
  off: "Desligado",
};
export const indicatorPriorities: Record<IndicatorColor, string> = {
  red: "Emergente",
  orange: "Muito urgente",
  yellow: "Urgente",
  green: "Pouco urgente",
  blue: "Não urgente",
  off: "Indicador apagado · sem classificação exibida",
};
export function describeCommand(command: Command): string {
  return command.kind === "light"
    ? `Luz ${command.on && command.intensity > 0 ? `em ${command.intensity}%` : "desligada"}`
    : `Indicador: ${colorNames[command.color]}`;
}
