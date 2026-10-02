export const environmentId = "quarto-01";
export const groups = ["light", "sensors", "indicator", "history"] as const;
export type Group = (typeof groups)[number];
export type Level = "none" | "read" | "control";
export type DemoUser = {
  id: string;
  name: string;
  email: string;
  admin: boolean;
  grants: Record<string, Record<Group, Level>>;
};
export const groupLabels: Record<Group, string> = {
  light: "Iluminação",
  sensors: "Sensores",
  indicator: "Manchester",
  history: "Histórico",
};
export function emptyGrants(): Record<Group, Level> {
  return { light: "none", sensors: "none", indicator: "none", history: "none" };
}
export function canAccess(
  user: DemoUser | null,
  environment: string,
  group: Group,
  action: "read" | "control",
) {
  const level = user?.grants[environment]?.[group] ?? "none";
  if (action === "control" && (group === "sensors" || group === "history"))
    return false;
  return action === "read" ? level !== "none" : level === "control";
}
export function initialUsers(): DemoUser[] {
  return [
    {
      id: "cesar",
      name: "César",
      email: "cesar@exemplo.com",
      admin: true,
      grants: {
        [environmentId]: {
          light: "control",
          sensors: "read",
          indicator: "control",
          history: "read",
        },
      },
    },
    {
      id: "gabriel",
      name: "Gabriel",
      email: "gabriel@exemplo.com",
      admin: false,
      grants: {
        [environmentId]: {
          light: "control",
          sensors: "read",
          indicator: "control",
          history: "read",
        },
      },
    },
    {
      id: "matheus",
      name: "Matheus",
      email: "matheus@exemplo.com",
      admin: false,
      grants: {
        [environmentId]: {
          light: "read",
          sensors: "read",
          indicator: "none",
          history: "read",
        },
      },
    },
  ];
}
