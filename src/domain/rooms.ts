import { DemoUser, emptyGrants, environmentId } from "./access";
export type RoomDefinition = {
  id: string;
  name: string;
  bed: string;
  wing: string;
  device: string;
  endpoint: string;
  active: boolean;
};
export const initialRooms = (): RoomDefinition[] => [
  {
    id: environmentId,
    name: "Quarto 01 · Leito clínico",
    bed: "L-01",
    wing: "Maquete experimental",
    device: "ESP32-quarto-01",
    endpoint: "https://servico.exemplo",
    active: true,
  },
];
export const roomVisible = (user: DemoUser | null, room: RoomDefinition) =>
  !!user &&
  (user.admin ||
    Object.values(user.grants[room.id] ?? emptyGrants()).some(
      (level) => level !== "none",
    ));
export function roomError(
  draft: RoomDefinition,
  rooms: RoomDefinition[],
): string {
  if (
    !draft.name.trim() ||
    !draft.bed.trim() ||
    !draft.wing.trim() ||
    !draft.device.trim()
  )
    return "Preencha nome, código do leito, ala e identificador do dispositivo.";
  const norm = (s: string) => s.trim().toLocaleLowerCase("pt-BR");
  const others = rooms.filter((room) => room.id !== draft.id);
  if (others.some((room) => norm(room.bed) === norm(draft.bed)))
    return "Já existe um ambiente com esse código de leito.";
  if (others.some((room) => norm(room.device) === norm(draft.device)))
    return "Esse dispositivo já está vinculado a outro ambiente.";
  try {
    const url = new URL(draft.endpoint.trim());
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error();
  } catch {
    return "Use um endereço http/https sem credenciais na URL.";
  }
  return "";
}
