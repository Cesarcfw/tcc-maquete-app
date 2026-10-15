import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  PaperProvider,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  backendAddress,
  backendRequest,
  BackendError,
  Account,
  SavedRoom,
  Reading,
  Audit,
  Grants,
  AccessLevel,
} from "../services/backend";
import { appTheme } from "./theme";
import { groupLabels, groups } from "../domain/access";
import DemoApp from "./DemoApp";
import { GasAlarm } from "./GasAlarm";

const emptyGrants: Grants = {
  light: "none",
  sensors: "none",
  indicator: "none",
  history: "none",
};
const initialRoom = {
  id: "",
  name: "",
  bed: "",
  wing: "",
  device: "",
  active: true,
};
const colorLabels: Record<string, string> = {
  red: "Vermelho",
  orange: "Laranja",
  yellow: "Amarelo",
  green: "Verde",
  blue: "Azul",
  off: "Desligado",
};
const eventLabels: Record<string, string> = {
  command_confirmed_simulator: "Comando confirmado no simulador",
  command_unconfirmed: "Comando sem confirmação",
  room_created: "Quarto cadastrado",
  room_updated: "Quarto atualizado",
  grants_updated: "Permissões atualizadas",
  gas_status_changed: "Estado do sensor de gás alterado",
};
export default function ConnectedApp() {
  const [demo, setDemo] = useState(false);
  const [dark, setDark] = useState(false);
  const theme = appTheme(dark, false);
  const [address, setAddress] = useState(
    process.env.EXPO_PUBLIC_BACKEND_URL || "http://127.0.0.1:3001",
  );
  const [base, setBase] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [rooms, setRooms] = useState<SavedRoom[]>([]);
  const [roomId, setRoomId] = useState("");
  const [reading, setReading] = useState<Reading | null>(null);
  const [history, setHistory] = useState<Audit[]>([]);
  const [users, setUsers] = useState<Account[]>([]);
  const [targetUser, setTargetUser] = useState("");
  const [permissions, setPermissions] = useState<Grants>(emptyGrants);
  const [userDraft, setUserDraft] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [roomDraft, setRoomDraft] = useState(initialRoom);
  const [editing, setEditing] = useState(false);
  const [intensity, setIntensity] = useState("65");
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(false);
  const [alarmClosed, setAlarmClosed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const generation = useRef(0);
  const room = rooms.find((r) => r.id === roomId);
  const request = <T,>(path: string, body?: unknown, method?: string) =>
    backendRequest<T>(base, path, token, body, method);
  const forget = () => {
    generation.current++;
    setToken(null);
    setAccount(null);
    setRooms([]);
    setRoomId("");
    setReading(null);
    setHistory([]);
    setUsers([]);
    setTargetUser("");
    setPermissions(emptyGrants);
    setPassword("");
    setCurrentPassword("");
    setNewPassword("");
    setUserDraft({ name: "", email: "", password: "" });
    setOnline(false);
  };
  const act = async (fn: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (error) {
      if (error instanceof BackendError && error.status === 401 && account)
        forget();
      setMessage(error instanceof Error ? error.message : "Falha de conexão.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const refresh = async () => {
    const list = (await request<SavedRoom[]>("/api/rooms")).data;
    setRooms(list);
    if (!list.some((r) => r.id === roomId)) {
      setRoomId("");
      setReading(null);
      setHistory([]);
    }
    if (account?.role === "admin")
      setUsers((await request<Account[]>("/api/users")).data);
  };
  useEffect(() => {
    if (!account || !roomId || !base) return;
    const current = generation.current;
    let stopped = false;
    let flight = false;
    const poll = async () => {
      if (flight || lock.current) return;
      flight = true;
      try {
        const list = (
          await backendRequest<SavedRoom[]>(base, "/api/rooms", token)
        ).data;
        const updated = list.find((r) => r.id === roomId);
        if (!updated) throw new BackendError("Acesso ao quarto removido.", 403);
        const canRead = ["light", "sensors", "indicator"].some(
          (g) =>
            (updated.grants as Record<string, string>)[g] &&
            (updated.grants as Record<string, string>)[g] !== "none",
        );
        const value = canRead
          ? (
              await backendRequest<Reading>(
                base,
                `/api/rooms/${roomId}/telemetry`,
                token,
              )
            ).data
          : null;
        const events =
          updated.grants.history && updated.grants.history !== "none"
            ? (
                await backendRequest<Audit[]>(
                  base,
                  `/api/rooms/${roomId}/history`,
                  token,
                )
              ).data
            : [];
        if (!stopped && generation.current === current) {
          setRooms(list);
          setReading(value);
          setHistory(events);
          setOnline(!!value && value.sampleAgeMs < 6000);
        }
      } catch (error) {
        if (!stopped && generation.current === current) {
          setOnline(false);
          setReading(null);
          setHistory([]);
          setMessage(
            error instanceof Error ? error.message : "Backend indisponível.",
          );
          if (error instanceof BackendError && error.status === 401) forget();
        }
      } finally {
        flight = false;
      }
    };
    const start = setTimeout(poll, 0);
    const timer = setInterval(poll, 2000);
    return () => {
      stopped = true;
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [account, roomId, base, token]);
  const selectRoom = (value: string) => {
    generation.current++;
    setRoomId(value);
    setReading(null);
    setHistory([]);
    setOnline(false);
    setMessage("");
    setPermissions(emptyGrants);
    setTargetUser("");
    setAlarmClosed(false);
  };
  const command = (value: object) =>
    act(async () => {
      generation.current++; // Impede que uma consulta anterior sobrescreva a confirmação.
      const current = generation.current;
      try {
        const reply = await request<{
          status: string;
          commandId: string;
          telemetry: Reading;
        }>(`/api/rooms/${roomId}/commands`, {
          commandId: `app-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          command: value,
        });
        if (current === generation.current) {
          setReading(reply.data.telemetry);
          setOnline(true);
          setMessage("Comando confirmado pelo simulador Node-RED.");
        }
      } finally {
        // Reinicia a consulta mesmo quando a API não confirma o comando.
        setAccount((a) => (a ? { ...a } : null));
      }
    });
  if (demo)
    return (
      <View style={{ flex: 1 }}>
        <Button onPress={() => setDemo(false)}>Voltar ao login real</Button>
        <DemoApp isolated />
      </View>
    );
  const field = (
    label: string,
    value: string,
    onChangeText: (v: string) => void,
    secure = false,
    readOnly = false,
  ) => (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure}
      autoCapitalize="none"
      disabled={busy || readOnly}
      mode="outlined"
    />
  );
  const box = (title: string, children: React.ReactNode) => (
    <Card style={styles.card}>
      <Card.Content style={styles.stack}>
        <Text variant="titleLarge">{title}</Text>
        {children}
      </Card.Content>
    </Card>
  );
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
        >
          <ScrollView
            contentContainerStyle={styles.page}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.row}>
              <Text variant="headlineMedium">SAMAHI</Text>
              <Button onPress={() => setDark((v) => !v)}>
                {dark ? "Tema claro" : "Tema escuro"}
              </Button>
            </View>
            <Text>Sistema local · contas e cadastros persistentes</Text>
            <View style={styles.row}>
              <Text>Reduzir animações</Text>
              <Switch value={reducedMotion} onValueChange={setReducedMotion} />
            </View>
            {!!message && (
              <Text
                accessibilityRole="alert"
                selectable
                style={{ color: theme.colors.primary }}
              >
                {message}
              </Text>
            )}
            {!account ? (
              box(
                "Entrar na sua conta",
                <>
                  {field("Endereço do backend", address, setAddress)}
                  <Text>
                    No telefone, use o IP do notebook e a porta 3001. O Node-RED
                    não é o servidor de login.
                  </Text>
                  {field("Email", email, setEmail)}
                  {field("Senha", password, setPassword, true)}
                  <Button
                    mode="contained"
                    loading={busy}
                    disabled={busy}
                    onPress={() =>
                      act(async () => {
                        const url = backendAddress(address);
                        const login = await backendRequest<{ user: Account }>(
                          url,
                          "/api/auth/sign-in/email",
                          null,
                          { email: email.trim(), password },
                        );
                        if (!login.token)
                          throw new Error(
                            "Servidor não retornou a sessão do aplicativo.",
                          );
                        const me = (
                          await backendRequest<Account>(
                            url,
                            "/api/me",
                            login.token,
                          )
                        ).data;
                        const list = (
                          await backendRequest<SavedRoom[]>(
                            url,
                            "/api/rooms",
                            login.token,
                          )
                        ).data;
                        const people =
                          me.role === "admin"
                            ? (
                                await backendRequest<Account[]>(
                                  url,
                                  "/api/users",
                                  login.token,
                                )
                              ).data
                            : [];
                        setBase(url);
                        setToken(login.token);
                        setAccount(me);
                        setRooms(list);
                        setUsers(people);
                        setPassword("");
                        setMessage("");
                      })
                    }
                  >
                    Entrar
                  </Button>
                  <Text>
                    A conta inicial é criada no computador com
                    Configurar-Administrador.cmd. Não existe cadastro público.
                    Esqueceu a senha? Solicite redefinição ao administrador.
                  </Text>
                  <Button disabled={busy} onPress={() => setDemo(true)}>
                    Abrir demonstração sem conta real
                  </Button>
                </>,
              )
            ) : (
              <>
                {box(
                  "Conta",
                  <>
                    <Text>
                      {account.name} · {account.email}
                    </Text>
                    <Text>
                      {account.role === "admin"
                        ? "Administrador de cadastros"
                        : "Usuário"}{" "}
                      · sessão somente nesta execução
                    </Text>
                    <Button
                      disabled={busy}
                      onPress={() =>
                        act(async () => {
                          await request("/api/auth/sign-out", {});
                          forget();
                        })
                      }
                    >
                      Sair e encerrar sessão
                    </Button>
                    <Button disabled={busy} onPress={() => act(refresh)}>
                      Atualizar quartos e permissões
                    </Button>
                  </>,
                )}
                {box(
                  "Alterar minha senha",
                  <>
                    {field(
                      "Senha atual",
                      currentPassword,
                      setCurrentPassword,
                      true,
                    )}
                    {field(
                      "Nova senha (mínimo 12 caracteres)",
                      newPassword,
                      setNewPassword,
                      true,
                    )}
                    <Button
                      disabled={busy}
                      onPress={() =>
                        act(async () => {
                          await request("/api/auth/change-password", {
                            currentPassword,
                            newPassword,
                            revokeOtherSessions: true,
                          });
                          setCurrentPassword("");
                          setNewPassword("");
                          setMessage(
                            "Senha alterada; outras sessões encerradas.",
                          );
                        })
                      }
                    >
                      Alterar senha
                    </Button>
                  </>,
                )}
                {box(
                  "Quartos",
                  <>
                    {!rooms.length && (
                      <Text>
                        Nenhum quarto autorizado. Solicite acesso ao
                        administrador.
                      </Text>
                    )}
                    {rooms.map((r) => (
                      <Button
                        disabled={busy}
                        key={r.id}
                        mode={roomId === r.id ? "contained" : "outlined"}
                        onPress={() => selectRoom(r.id)}
                      >
                        {r.name} · {r.bed}
                        {!r.active ? " · inativo" : ""}
                      </Button>
                    ))}
                  </>,
                )}
                {room &&
                  box(
                    room.name,
                    <>
                      <Text>
                        {room.wing} · {room.device}
                      </Text>
                      <Chip>
                        {online
                          ? "Node-RED simulado conectado"
                          : "Sem leitura atual confirmada"}
                      </Chip>
                      {reading && (
                        <Text>
                          Fonte: {reading.source} · idade da amostra:{" "}
                          {Math.round(reading.sampleAgeMs / 1000)} s
                        </Text>
                      )}
                      {room.grants.sensors &&
                        room.grants.sensors !== "none" && (
                          <>
                            <Text>
                              Temperatura: {reading?.temperatureC ?? "—"} °C ·
                              Umidade: {reading?.humidityPercent ?? "—"}%
                            </Text>
                            <Text>
                              Gás:{" "}
                              {reading?.gasStatus === "detected"
                                ? "DETECÇÃO DE GÁS — alerta ambiental"
                                : reading?.gasStatus === "clear"
                                  ? "Sem detecção"
                                  : "Sem informação"}
                            </Text>
                            {reading?.gasStatus === "detected" && (
                              <Button
                                disabled={busy || !online}
                                onPress={() =>
                                  command({ kind: "acknowledgeGas" })
                                }
                              >
                                Reconhecer alerta de gás
                              </Button>
                            )}
                          </>
                        )}
                      {reading?.gasStatus === "detected" && alarmClosed && (
                        <Button onPress={() => setAlarmClosed(false)}>
                          Reabrir alerta ambiental
                        </Button>
                      )}
                      {room.grants.light && room.grants.light !== "none" && (
                        <>
                          <Text>
                            Luz:{" "}
                            {reading?.lightOn === undefined
                              ? "—"
                              : reading.lightOn
                                ? "ligada"
                                : "desligada"}{" "}
                            · {reading?.lightIntensityPercent ?? "—"}%
                          </Text>
                          {room.grants.light === "control" && (
                            <>
                              {field(
                                "Intensidade (0–100)",
                                intensity,
                                setIntensity,
                              )}
                              <Button
                                disabled={busy || !online}
                                onPress={() => {
                                  const n = Number(intensity);
                                  if (!/^\d{1,3}$/.test(intensity) || n > 100) {
                                    setMessage(
                                      "Informe uma intensidade inteira de 0 a 100.",
                                    );
                                    return;
                                  }
                                  command({
                                    kind: "light",
                                    on: n > 0,
                                    intensity: n,
                                  });
                                }}
                              >
                                Aplicar intensidade
                              </Button>
                              <View style={styles.row}>
                                <Button
                                  disabled={busy || !online}
                                  onPress={() =>
                                    command({
                                      kind: "light",
                                      on: false,
                                      intensity: 0,
                                    })
                                  }
                                >
                                  Desligar
                                </Button>
                                <Button
                                  disabled={busy || !online}
                                  onPress={() =>
                                    command({
                                      kind: "light",
                                      on: true,
                                      intensity:
                                        reading?.lastPositiveIntensity || 65,
                                    })
                                  }
                                >
                                  Ligar
                                </Button>
                              </View>
                              <Button
                                disabled={busy || !online}
                                onPress={() => command({ kind: "automatic" })}
                              >
                                Automático pelo LDR
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      {room.grants.indicator &&
                        room.grants.indicator !== "none" && (
                          <>
                            <Text>
                              Manchester:{" "}
                              {colorLabels[reading?.indicatorColor || ""] ||
                                "—"}{" "}
                              · seleção manual, independente de gás
                            </Text>
                            {room.grants.indicator === "control" && (
                              <View style={styles.row}>
                                {[
                                  ["red", "Vermelho"],
                                  ["orange", "Laranja"],
                                  ["yellow", "Amarelo"],
                                  ["green", "Verde"],
                                  ["blue", "Azul"],
                                ].map(([color, label]) => (
                                  <Button
                                    key={color}
                                    disabled={busy || !online}
                                    onPress={() =>
                                      command({ kind: "indicator", color })
                                    }
                                  >
                                    {label}
                                  </Button>
                                ))}
                              </View>
                            )}
                          </>
                        )}
                      {room.grants.history &&
                        room.grants.history !== "none" && (
                          <>
                            <Text variant="titleMedium">
                              Últimos registros persistentes
                            </Text>
                            {history.slice(0, 20).map((event) => (
                              <Text key={event.id}>
                                {new Date(event.at).toLocaleString("pt-BR")} ·{" "}
                                {eventLabels[event.action] ||
                                  "Registro do sistema"}
                              </Text>
                            ))}
                          </>
                        )}
                    </>,
                  )}
                {account.role === "admin" && (
                  <>
                    {box(
                      "Cadastrar usuário",
                      <>
                        {field("Nome do usuário", userDraft.name, (v) =>
                          setUserDraft((s) => ({ ...s, name: v })),
                        )}
                        {field("Email do usuário", userDraft.email, (v) =>
                          setUserDraft((s) => ({ ...s, email: v })),
                        )}
                        {field(
                          "Senha inicial (mínimo 12 caracteres)",
                          userDraft.password,
                          (v) => setUserDraft((s) => ({ ...s, password: v })),
                          true,
                        )}
                        <Button
                          disabled={busy}
                          onPress={() =>
                            act(async () => {
                              await request("/api/users", userDraft);
                              setUserDraft({
                                name: "",
                                email: "",
                                password: "",
                              });
                              await refresh();
                              setMessage(
                                "Usuário criado sem acesso automático a quartos.",
                              );
                            })
                          }
                        >
                          Criar usuário
                        </Button>
                      </>,
                    )}
                    {box(
                      "Permissões por quarto",
                      <>
                        <Text>
                          Selecione um quarto acima. Administradores também
                          precisam de concessões para operar os equipamentos.
                        </Text>
                        {users.map((u) => (
                          <Button
                            disabled={busy}
                            key={u.id}
                            mode={
                              targetUser === u.id ? "contained" : "outlined"
                            }
                            onPress={() => {
                              setTargetUser(u.id);
                              setPermissions({
                                ...emptyGrants,
                                ...u.grants?.[roomId],
                              });
                            }}
                          >
                            {u.name}
                            {u.banned ? " · desativado" : ""}
                          </Button>
                        ))}
                        <Text>
                          Este formulário substitui as quatro concessões do
                          usuário selecionado no quarto. Carrega os níveis
                          atuais; escolha explicitamente cada nível.
                        </Text>
                        {groups.map((g) => (
                          <View style={styles.stack} key={g}>
                            <Text>{groupLabels[g]}</Text>
                            <SegmentedButtons
                              value={permissions[g]}
                              onValueChange={(v) =>
                                setPermissions((s) => ({
                                  ...s,
                                  [g]: v as AccessLevel,
                                }))
                              }
                              buttons={[
                                { value: "none", label: "Nenhum" },
                                { value: "read", label: "Leitura" },
                                ...(["light", "indicator"].includes(g)
                                  ? [{ value: "control", label: "Controle" }]
                                  : []),
                              ]}
                            />
                          </View>
                        ))}
                        <Button
                          disabled={busy || !roomId || !targetUser}
                          onPress={() =>
                            act(async () => {
                              await request(
                                `/api/users/${targetUser}/grants/${roomId}`,
                                permissions,
                                "PUT",
                              );
                              await refresh();
                              setReading(null);
                              setMessage("Permissões salvas no servidor.");
                            })
                          }
                        >
                          Salvar permissões
                        </Button>
                        <Button
                          disabled={
                            busy || !targetUser || targetUser === account.id
                          }
                          onPress={() =>
                            act(async () => {
                              await request(
                                `/api/users/${targetUser}/disable`,
                                {},
                              );
                              await refresh();
                              setMessage(
                                "Usuário desativado e sessões encerradas.",
                              );
                            })
                          }
                        >
                          Desativar usuário selecionado
                        </Button>
                        <Button
                          disabled={busy || !targetUser}
                          onPress={() =>
                            act(async () => {
                              await request(
                                `/api/users/${targetUser}/enable`,
                                {},
                              );
                              await refresh();
                              setMessage("Usuário reativado. Faça novo login.");
                            })
                          }
                        >
                          Reativar usuário selecionado
                        </Button>
                        {field(
                          "Nova senha do usuário selecionado",
                          userDraft.password,
                          (v) => setUserDraft((s) => ({ ...s, password: v })),
                          true,
                        )}
                        <Button
                          disabled={
                            busy || !targetUser || targetUser === account.id
                          }
                          onPress={() =>
                            act(async () => {
                              await request(
                                `/api/users/${targetUser}/password`,
                                { newPassword: userDraft.password },
                              );
                              setUserDraft((s) => ({ ...s, password: "" }));
                              setMessage(
                                "Senha redefinida e sessões do usuário encerradas.",
                              );
                            })
                          }
                        >
                          Redefinir senha do usuário
                        </Button>
                      </>,
                    )}
                    {box(
                      editing ? "Editar quarto" : "Cadastrar quarto",
                      <>
                        {room && (
                          <Button
                            disabled={busy}
                            onPress={() => {
                              setRoomDraft({ ...room, active: !!room.active });
                              setEditing(true);
                            }}
                          >
                            Carregar quarto selecionado para edição
                          </Button>
                        )}
                        {(["id", "name", "bed", "wing", "device"] as const).map(
                          (key) => (
                            <View key={key}>
                              {field(
                                {
                                  id: "Identificador (ex.: quarto-02)",
                                  name: "Nome do quarto",
                                  bed: "Código do leito",
                                  wing: "Ala",
                                  device: "Identificador do ESP",
                                }[key],
                                roomDraft[key],
                                (v) =>
                                  setRoomDraft((s) => ({ ...s, [key]: v })),
                                false,
                                editing && key === "id",
                              )}
                            </View>
                          ),
                        )}
                        <View style={styles.row}>
                          <Text>Ativo</Text>
                          <Switch
                            disabled={busy}
                            value={roomDraft.active}
                            onValueChange={(active) =>
                              setRoomDraft((s) => ({ ...s, active }))
                            }
                          />
                        </View>
                        <Button
                          disabled={busy}
                          onPress={() =>
                            act(async () => {
                              await request(
                                editing
                                  ? `/api/rooms/${roomDraft.id}`
                                  : "/api/rooms",
                                roomDraft,
                                editing ? "PUT" : "POST",
                              );
                              setRoomDraft(initialRoom);
                              setEditing(false);
                              await refresh();
                              setMessage(
                                "Quarto salvo. Configure as permissões antes de operar.",
                              );
                            })
                          }
                        >
                          Salvar quarto
                        </Button>
                        <Button
                          disabled={busy}
                          onPress={() => {
                            setEditing(false);
                            setRoomDraft(initialRoom);
                          }}
                        >
                          Limpar formulário
                        </Button>
                      </>,
                    )}
                  </>
                )}
              </>
            )}
          </ScrollView>
          {account &&
            room &&
            reading?.gasStatus === "detected" &&
            (!alarmClosed || !reading.gasAcknowledged) && (
              <GasAlarm
                room={room.name}
                acknowledged={!!reading.gasAcknowledged}
                stale={!online || busy}
                reduced={reducedMotion}
                onAcknowledge={() => command({ kind: "acknowledgeGas" })}
                onClose={() => setAlarmClosed(true)}
              />
            )}
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  page: {
    padding: 20,
    gap: 16,
    maxWidth: 1000,
    width: "100%",
    alignSelf: "center",
  },
  card: { marginVertical: 4 },
  stack: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
});
