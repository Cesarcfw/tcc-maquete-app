import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  Divider,
  HelperText,
  Portal,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  Account,
  AccessLevel,
  Grants,
  SavedRoom,
  Reading,
  backendRequest,
  BackendError,
} from "../services/backend";
import { groups, groupLabels } from "../domain/access";
import { Panel, Note } from "./SharedPanels";

export type ManagementScreen = "Usuários" | "Conexões" | "Cadastro" | "Conta";
export type ManagementContext = {
  screen: ManagementScreen;
  roomId: string;
  editingRoomId: string | null;
  navigate: (screen: ManagementScreen) => void;
  editRoom: (id: string | null) => void;
};
export type ManagementProps = ManagementContext & {
  base: string;
  token: string;
  account: Account;
  onExpired: () => void;
};
const noGrants: Grants = {
  light: "none",
  sensors: "none",
  indicator: "none",
  history: "none",
};
const blankRoom = {
  id: "",
  name: "",
  bed: "",
  wing: "",
  device: "",
  active: true,
};
const labels = {
  id: "Identificador do quarto",
  name: "Nome do quarto",
  bed: "Código do leito",
  wing: "Ala",
  device: "Identificador do ESP",
};

export function AccountManagement(props: ManagementProps) {
  const { screen, base, token, account, onExpired } = props;
  const { colors } = useTheme();
  const wide = useWindowDimensions().width >= 1000;
  const [rooms, setRooms] = useState<SavedRoom[]>([]);
  const [users, setUsers] = useState<Account[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const lock = useRef(false);
  const request = async <T,>(path: string, body?: unknown, method?: string) =>
    (await backendRequest<T>(base, path, token, body, method)).data;
  const refresh = async () => {
    const [roomList, people] = await Promise.all([
      request<SavedRoom[]>("/api/rooms"),
      account.role === "admin"
        ? request<Account[]>("/api/users")
        : Promise.resolve([]),
    ]);
    setRooms(roomList);
    setUsers(people);
  };
  const act = async (action: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      await action();
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : "Não foi possível concluir.",
      );
      if (error instanceof BackendError && error.status === 401) onExpired();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  useEffect(() => {
    let live = true;
    Promise.all([
      backendRequest<SavedRoom[]>(base, "/api/rooms", token),
      account.role === "admin"
        ? backendRequest<Account[]>(base, "/api/users", token)
        : Promise.resolve({ data: [] as Account[] }),
    ])
      .then(([r, u]) => {
        if (live) {
          setRooms(r.data);
          setUsers(u.data);
        }
      })
      .catch((error: unknown) => {
        if (live) {
          setFailed(true);
          setMessage(
            error instanceof Error
              ? error.message
              : "Falha ao carregar cadastros.",
          );
        }
      });
    return () => {
      live = false;
    };
  }, [base, token, account.role]);
  const tools = { request, refresh, act, busy, setMessage, message, failed };
  return (
    <View style={styles.stack}>
      {!!message && (
        <View accessibilityRole="alert">
          <Note
            title={
              failed ? "Não foi possível concluir" : "Atualização confirmada"
            }
            text={message}
            warning={failed}
          />
        </View>
      )}
      {screen === "Conta" ? (
        <PasswordPanel {...tools} />
      ) : account.role !== "admin" ? (
        <Note
          title="Acesso restrito"
          text="A administração de cadastros exige uma conta administradora."
        />
      ) : (
        <>
          <View style={styles.actions}>
            <Chip icon="account-group-outline">
              {users.length} {users.length === 1 ? "pessoa" : "pessoas"}
            </Chip>
            <Chip icon="bed-outline">
              {rooms.length} {rooms.length === 1 ? "ambiente" : "ambientes"}
            </Chip>
            <Button
              icon="refresh"
              disabled={busy}
              onPress={() =>
                act(async () => {
                  await refresh();
                  setMessage("Cadastros atualizados.");
                })
              }
            >
              Atualizar
            </Button>
          </View>
          {screen === "Usuários" && (
            <UsersPanel
              {...tools}
              rooms={rooms}
              users={users}
              account={account}
              initialRoomId={props.roomId}
              wide={wide}
            />
          )}
          {screen === "Conexões" && (
            <>
              <View style={styles.spread}>
                <Text variant="titleMedium">Ambientes e dispositivos</Text>
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={() => props.editRoom(null)}
                >
                  Novo ambiente
                </Button>
              </View>
              {!rooms.length && (
                <Note
                  title="Nenhum ambiente cadastrado"
                  text="Cadastre o primeiro quarto e depois configure as permissões da equipe."
                />
              )}
              <View style={styles.cards}>
                {rooms.map((room) => (
                  <View
                    key={room.id}
                    style={[styles.roomCard, wide && styles.half]}
                  >
                    <Panel
                      title={room.name}
                      icon="lan-connect"
                      subtitle={`${room.wing} · ${room.bed}`}
                    >
                      <Chip icon="chip">{room.device}</Chip>
                      <Text style={{ color: colors.onSurfaceVariant }}>
                        {room.active
                          ? "Ambiente habilitado"
                          : "Ambiente desativado"}
                      </Text>
                      <Text variant="bodySmall">
                        A leitura é consultada pelo servidor. O cadastro não
                        confirma que o equipamento está conectado.
                      </Text>
                      <View style={styles.actions}>
                        <Button
                          mode="outlined"
                          icon="pencil-outline"
                          onPress={() => props.editRoom(room.id)}
                        >
                          Editar ambiente
                        </Button>
                        <Button
                          disabled={busy || !room.active}
                          icon="access-point"
                          onPress={() =>
                            act(async () => {
                              const reading = await request<Reading>(
                                `/api/rooms/${room.id}/telemetry`,
                              );
                              setMessage(
                                `${room.name}: leitura ${reading.sampleAgeMs < 10000 ? "atual" : "antiga"}, recebida há ${Math.round(reading.sampleAgeMs / 1000)} s.`,
                              );
                            })
                          }
                        >
                          Consultar leitura
                        </Button>
                      </View>
                    </Panel>
                  </View>
                ))}
              </View>
            </>
          )}
          {screen === "Cadastro" && (
            <RoomForm
              key={props.editingRoomId || "new"}
              {...tools}
              rooms={rooms}
              editingRoomId={props.editingRoomId}
              navigate={props.navigate}
            />
          )}
        </>
      )}
    </View>
  );
}
type Tools = {
  request: <T>(path: string, body?: unknown, method?: string) => Promise<T>;
  refresh: () => Promise<void>;
  act: (fn: () => Promise<void>) => Promise<void>;
  busy: boolean;
  setMessage: (v: string) => void;
  message: string;
  failed: boolean;
};

function PasswordPanel({ request, act, busy, setMessage }: Tools) {
  const [current, setCurrent] = useState(""),
    [next, setNext] = useState("");
  return (
    <Panel
      title="Segurança da conta"
      icon="shield-key-outline"
      subtitle="Altere sua senha informando a senha atual."
    >
      <TextInput
        mode="outlined"
        label="Senha atual"
        secureTextEntry
        value={current}
        onChangeText={setCurrent}
        disabled={busy}
      />
      <TextInput
        mode="outlined"
        label="Nova senha"
        secureTextEntry
        value={next}
        onChangeText={setNext}
        disabled={busy}
      />
      <HelperText type="info">
        Use de 12 a 128 caracteres. A alteração encerra as outras sessões.
      </HelperText>
      <Button
        style={styles.start}
        mode="contained"
        icon="lock-reset"
        loading={busy}
        disabled={busy || !current || next.length < 12 || next.length > 128}
        onPress={() =>
          act(async () => {
            await request("/api/auth/change-password", {
              currentPassword: current,
              newPassword: next,
              revokeOtherSessions: true,
            });
            setCurrent("");
            setNext("");
            setMessage("Senha alterada; outras sessões encerradas.");
          })
        }
      >
        Alterar senha
      </Button>
    </Panel>
  );
}

function UsersPanel({
  rooms,
  users,
  account,
  initialRoomId,
  wide,
  ...tools
}: Tools & {
  rooms: SavedRoom[];
  users: Account[];
  account: Account;
  initialRoomId: string;
  wide: boolean;
}) {
  const { colors } = useTheme();
  const [search, setSearch] = useState(""),
    [selected, setSelected] = useState("");
  const [roomId, setRoomId] = useState(initialRoomId);
  const [grants, setGrants] = useState<Grants>(noGrants);
  const [dirty, setDirty] = useState(false);
  const [create, setCreate] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", password: "" });
  const [resetPassword, setResetPassword] = useState("");
  const user = users.find((u) => u.id === selected);
  const { act, request, refresh, busy, setMessage } = tools;
  const pick = (id: string, room: string) => {
    setSelected(id);
    setRoomId(room);
    setGrants({
      ...noGrants,
      ...users.find((u) => u.id === id)?.grants?.[room],
    });
    setDirty(false);
    setResetPassword("");
  };
  const filtered = users.filter((u) =>
    `${u.name} ${u.email}`
      .toLocaleLowerCase("pt-BR")
      .includes(search.toLocaleLowerCase("pt-BR")),
  );
  return (
    <>
      <View style={[styles.columns, !wide && styles.vertical]}>
        <View style={[styles.column, !wide && styles.mobileColumn]}>
          <Panel
            title="Pessoas da equipe"
            icon="account-group-outline"
            subtitle="Selecione uma pessoa para gerenciar seu acesso."
          >
            <TextInput
              mode="outlined"
              label="Buscar pessoa"
              value={search}
              onChangeText={setSearch}
              left={<TextInput.Icon icon="magnify" />}
            />
            <Button
              mode="contained"
              icon="account-plus-outline"
              disabled={busy}
              onPress={() => {
                setMessage("");
                setCreate(true);
              }}
            >
              Adicionar usuário
            </Button>
            {!filtered.length && <Text>Nenhuma pessoa encontrada.</Text>}
            {filtered.map((u) => (
              <View
                key={u.id}
                style={[
                  styles.person,
                  {
                    borderColor:
                      selected === u.id
                        ? colors.primary
                        : colors.outlineVariant,
                    backgroundColor:
                      selected === u.id
                        ? colors.primaryContainer
                        : colors.surface,
                  },
                ]}
              >
                <View style={styles.row}>
                  <Avatar.Text
                    size={38}
                    label={u.name.slice(0, 1).toUpperCase()}
                  />
                  <View style={styles.column}>
                    <Text variant="titleSmall">{u.name}</Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: colors.onSurfaceVariant }}
                    >
                      {u.email}
                    </Text>
                  </View>
                </View>
                <View style={styles.spread}>
                  <Text variant="labelSmall">
                    {u.banned
                      ? "Desativado"
                      : u.role === "admin"
                        ? "Administrador"
                        : "Usuário"}
                  </Text>
                  <Button
                    disabled={busy}
                    onPress={() => pick(u.id, roomId)}
                    accessibilityLabel={`Gerenciar ${u.name}`}
                  >
                    Gerenciar
                  </Button>
                </View>
              </View>
            ))}
          </Panel>
        </View>
        <View
          style={[styles.column, wide ? { flex: 1.4 } : styles.mobileColumn]}
        >
          {!user ? (
            <Panel title="Permissões por ambiente" icon="account-key-outline">
              <Note
                title="Selecione uma pessoa"
                text="Depois, escolha o quarto e defina quais funções ela pode consultar ou controlar."
              />
            </Panel>
          ) : (
            <>
              <Panel
                title={user.name}
                icon="account-key-outline"
                subtitle="O acesso é definido separadamente para cada ambiente."
              >
                <Text variant="labelLarge">1. Escolha o ambiente</Text>
                <View style={styles.actions}>
                  {rooms.map((r) => (
                    <Chip
                      key={r.id}
                      selected={roomId === r.id}
                      disabled={busy}
                      onPress={() => pick(user.id, r.id)}
                    >
                      {r.name} · {r.bed}
                    </Chip>
                  ))}
                </View>
                {!rooms.some((r) => r.id === roomId) ? (
                  <Note
                    title="Escolha um quarto"
                    text="Cadastre um ambiente se a lista estiver vazia."
                  />
                ) : (
                  <>
                    <Divider />
                    <Text variant="labelLarge">2. Defina as permissões</Text>
                    {groups.map((group) => (
                      <View key={group} style={styles.permission}>
                        <Text variant="titleSmall">{groupLabels[group]}</Text>
                        <SegmentedButtons
                          density="small"
                          value={grants[group]}
                          onValueChange={(level) => {
                            setGrants((v) => ({
                              ...v,
                              [group]: level as AccessLevel,
                            }));
                            setDirty(true);
                          }}
                          buttons={[
                            {
                              value: "none",
                              label: "Nenhum",
                              disabled: busy,
                              labelStyle: { fontSize: 12 },
                            },
                            {
                              value: "read",
                              label: "Leitura",
                              disabled: busy,
                              labelStyle: { fontSize: 12 },
                            },
                            ...(["light", "indicator"].includes(group)
                              ? [
                                  {
                                    value: "control",
                                    label: "Controle",
                                    labelStyle: { fontSize: 12 },
                                    disabled: busy,
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </View>
                    ))}
                    <Text
                      variant="bodySmall"
                      style={{ color: colors.onSurfaceVariant }}
                    >
                      Sensores e histórico permitem leitura. Administradores
                      também precisam de concessões para operar o quarto.
                    </Text>
                    <Button
                      mode="contained"
                      icon="content-save-outline"
                      loading={busy}
                      disabled={busy || !dirty}
                      onPress={() =>
                        act(async () => {
                          await request(
                            `/api/users/${user.id}/grants/${roomId}`,
                            grants,
                            "PUT",
                          );
                          await refresh();
                          setDirty(false);
                          setMessage("Permissões salvas no servidor.");
                        })
                      }
                    >
                      Salvar permissões
                    </Button>
                    {dirty && (
                      <Text variant="labelSmall">
                        Alterações ainda não salvas.
                      </Text>
                    )}
                  </>
                )}
              </Panel>
              {user.role !== "admin" && (
                <Panel
                  title="Acesso à conta"
                  icon="shield-account-outline"
                  subtitle="Desativar encerra as sessões; reativar permite um novo login."
                >
                  <Button
                    mode="outlined"
                    disabled={busy || user.id === account.id}
                    icon={
                      user.banned
                        ? "account-check-outline"
                        : "account-cancel-outline"
                    }
                    onPress={() =>
                      act(async () => {
                        await request(
                          `/api/users/${user.id}/${user.banned ? "enable" : "disable"}`,
                          {},
                        );
                        await refresh();
                        setMessage(
                          user.banned
                            ? "Usuário reativado."
                            : "Usuário desativado e sessões encerradas.",
                        );
                      })
                    }
                  >
                    {user.banned ? "Reativar usuário" : "Desativar usuário"}
                  </Button>
                  <Divider />
                  <TextInput
                    label="Nova senha do usuário"
                    mode="outlined"
                    secureTextEntry
                    value={resetPassword}
                    onChangeText={setResetPassword}
                    disabled={busy}
                  />
                  <Text variant="bodySmall">
                    De 12 a 128 caracteres. A redefinição encerra as sessões
                    desse usuário.
                  </Text>
                  <Button
                    disabled={
                      busy ||
                      resetPassword.length < 12 ||
                      resetPassword.length > 128
                    }
                    icon="lock-reset"
                    onPress={() =>
                      act(async () => {
                        await request(`/api/users/${user.id}/password`, {
                          newPassword: resetPassword,
                        });
                        setResetPassword("");
                        setMessage("Senha redefinida e sessões encerradas.");
                      })
                    }
                  >
                    Redefinir senha
                  </Button>
                </Panel>
              )}
            </>
          )}
        </View>
      </View>
      <Portal>
        <Dialog
          visible={create}
          dismissable={!busy}
          onDismiss={() => {
            setCreate(false);
            setDraft({ name: "", email: "", password: "" });
          }}
          style={styles.dialog}
        >
          <Dialog.Title>Adicionar usuário</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView
              contentContainerStyle={styles.dialogFields}
              keyboardShouldPersistTaps="handled"
            >
              <Text>
                O acesso aos quartos será configurado após o cadastro.
              </Text>
              <TextInput
                mode="outlined"
                label="Nome do usuário"
                value={draft.name}
                disabled={busy}
                onChangeText={(name) => setDraft((v) => ({ ...v, name }))}
              />
              <TextInput
                mode="outlined"
                label="Email do usuário"
                keyboardType="email-address"
                autoCapitalize="none"
                value={draft.email}
                disabled={busy}
                onChangeText={(email) => setDraft((v) => ({ ...v, email }))}
              />
              <TextInput
                mode="outlined"
                label="Senha inicial"
                secureTextEntry
                value={draft.password}
                disabled={busy}
                onChangeText={(password) =>
                  setDraft((v) => ({ ...v, password }))
                }
              />
              <HelperText type="info">De 12 a 128 caracteres.</HelperText>
              {tools.failed && !!tools.message && (
                <HelperText type="error" accessibilityRole="alert">
                  {tools.message}
                </HelperText>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button
              disabled={busy}
              onPress={() => {
                setCreate(false);
                setDraft({ name: "", email: "", password: "" });
              }}
            >
              Cancelar
            </Button>
            <Button
              loading={busy}
              disabled={
                busy ||
                !draft.name.trim() ||
                !draft.email.trim() ||
                draft.password.length < 12 ||
                draft.password.length > 128
              }
              onPress={() =>
                act(async () => {
                  await request("/api/users", draft);
                  setCreate(false);
                  setDraft({ name: "", email: "", password: "" });
                  await refresh();
                  setMessage(
                    "Usuário criado. Selecione a pessoa e configure suas permissões.",
                  );
                })
              }
            >
              Criar usuário
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

function RoomForm({
  rooms,
  editingRoomId,
  navigate,
  request,
  act,
  refresh,
  busy,
  setMessage,
}: Tools & {
  rooms: SavedRoom[];
  editingRoomId: string | null;
  navigate: ManagementContext["navigate"];
}) {
  const existing = rooms.find((r) => r.id === editingRoomId);
  const [changes, setChanges] = useState<Partial<typeof blankRoom>>({});
  const loaded = !editingRoomId || !!existing;
  const draft = {
    ...blankRoom,
    ...(existing
      ? {
          id: existing.id,
          name: existing.name,
          bed: existing.bed,
          wing: existing.wing,
          device: existing.device,
          active: !!existing.active,
        }
      : {}),
    ...changes,
  };
  return (
    <Panel
      title={editingRoomId ? "Editar ambiente" : "Novo ambiente"}
      icon="bed-outline"
      subtitle="Identifique o quarto, o leito e o dispositivo associado."
    >
      {!!editingRoomId && !loaded && <Text>Carregando ambiente…</Text>}
      <View style={styles.cards}>
        {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => (
          <View key={key} style={styles.field}>
            <TextInput
              mode="outlined"
              label={labels[key]}
              value={draft[key]}
              disabled={busy || !loaded || (!!editingRoomId && key === "id")}
              autoCapitalize={
                key === "id" || key === "device" ? "none" : "sentences"
              }
              onChangeText={(value) =>
                setChanges((v) => ({ ...v, [key]: value }))
              }
            />
          </View>
        ))}
      </View>
      <View style={styles.spread}>
        <View style={styles.column}>
          <Text variant="titleSmall">Ambiente habilitado</Text>
          <Text variant="bodySmall">
            Desative para impedir a operação deste ambiente.
          </Text>
        </View>
        <Switch
          accessibilityLabel="Ambiente habilitado"
          value={draft.active}
          disabled={busy || !loaded}
          onValueChange={(active) => setChanges((v) => ({ ...v, active }))}
        />
      </View>
      <Note
        title="Permissões e dispositivo"
        text="Um novo ambiente exige concessões de acesso. O identificador do ESP deve corresponder ao equipamento configurado no servidor; cadastrar não conecta um dispositivo automaticamente."
      />
      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="content-save-outline"
          loading={busy}
          disabled={
            busy ||
            !loaded ||
            Object.keys(labels).some(
              (k) => !draft[k as keyof typeof labels].trim(),
            )
          }
          onPress={() =>
            act(async () => {
              await request(
                editingRoomId ? `/api/rooms/${editingRoomId}` : "/api/rooms",
                draft,
                editingRoomId ? "PUT" : "POST",
              );
              await refresh();
              setMessage("Ambiente salvo no servidor.");
              navigate("Conexões");
            })
          }
        >
          Salvar ambiente
        </Button>
        <Button disabled={busy} onPress={() => navigate("Conexões")}>
          Cancelar
        </Button>
      </View>
    </Panel>
  );
}
const styles = StyleSheet.create({
  stack: { gap: 22 },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },
  columns: { flexDirection: "row", gap: 24, alignItems: "flex-start" },
  vertical: { flexDirection: "column", alignItems: "stretch" },
  column: { flex: 1, minWidth: 0, gap: 16 },
  mobileColumn: {
    flexBasis: "auto",
    flexGrow: 0,
    flexShrink: 0,
    width: "100%",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  spread: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  person: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  permission: { gap: 10, paddingVertical: 6 },
  cards: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  roomCard: { width: "100%" },
  half: { width: "48%" },
  field: { flexGrow: 1, flexBasis: 280, minWidth: 0, maxWidth: "100%" },
  start: { alignSelf: "flex-start" },
  dialog: {
    width: "92%",
    maxWidth: 520,
    maxHeight: "90%",
    alignSelf: "center",
  },
  dialogFields: { gap: 12, paddingVertical: 16 },
});
