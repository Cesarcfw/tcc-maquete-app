import assert from "node:assert/strict";
import { test } from "node:test";
import { initialRooms, roomError, roomVisible } from "../src/domain/rooms";
import { initialUsers } from "../src/domain/access";
test("cadastro recusa leito/dispositivo duplicados sem diferenciar espaços e maiúsculas", () => {
  const rooms = initialRooms();
  const draft = { ...rooms[0], id: "new", device: "different", bed: " l-01 " };
  assert.match(roomError(draft, rooms), /código de leito/);
  assert.match(
    roomError({ ...draft, bed: "L-02", device: " esp32-QUARTO-01 " }, rooms),
    /dispositivo/,
  );
  assert.equal(roomError({ ...draft, bed: "L-02" }, rooms), "");
  assert.equal(roomError(rooms[0], rooms), "");
});
test("cadastro recusa campos vazios e URLs com credenciais ou protocolo inválido", () => {
  const room = initialRooms()[0];
  for (const endpoint of [
    "mqtt://broker",
    "https://user:password@example.com",
    "invalid",
  ])
    assert.notEqual(roomError({ ...room, endpoint }, []), "");
  assert.notEqual(roomError({ ...room, name: " " }, []), "");
});
test("ambiente novo não aparece para usuário sem concessão; administrador pode configurar", () => {
  const room = { ...initialRooms()[0], id: "new" };
  const [admin, member] = initialUsers();
  assert.equal(roomVisible(admin, room), true);
  assert.equal(roomVisible(member, room), false);
  assert.equal(roomVisible(null, room), false);
  assert.equal(
    roomVisible(
      {
        ...member,
        grants: {
          new: {
            light: "read",
            sensors: "none",
            indicator: "none",
            history: "none",
          },
        },
      },
      room,
    ),
    true,
  );
});
