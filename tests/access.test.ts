import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canAccess,
  emptyGrants,
  environmentId,
  initialUsers,
} from "../src/domain/access";
test("concessões são limitadas ao ambiente e ao grupo; administrador não ignora concessões", () => {
  const [admin, , reader] = initialUsers();
  assert.equal(canAccess(admin, "outro-quarto", "light", "control"), false);
  assert.equal(canAccess(reader, environmentId, "light", "read"), true);
  assert.equal(canAccess(reader, environmentId, "light", "control"), false);
  assert.equal(canAccess(reader, environmentId, "indicator", "read"), false);
  assert.equal(canAccess(null, environmentId, "light", "read"), false);
  assert.equal(
    canAccess(
      { ...admin, grants: { [environmentId]: emptyGrants() } },
      environmentId,
      "light",
      "control",
    ),
    false,
  );
});
test("sensores/histórico não aceitam controle mesmo com concessão inválida", () => {
  const [admin] = initialUsers();
  const invalid = {
    ...admin,
    grants: {
      [environmentId]: {
        ...emptyGrants(),
        sensors: "control" as const,
        history: "control" as const,
      },
    },
  };
  assert.equal(canAccess(invalid, environmentId, "sensors", "control"), false);
  assert.equal(canAccess(invalid, environmentId, "history", "control"), false);
});
