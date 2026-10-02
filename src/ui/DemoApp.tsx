import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Slider from "@react-native-community/slider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Avatar,
  BottomNavigation,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  HelperText,
  IconButton,
  List,
  PaperProvider,
  Portal,
  ProgressBar,
  SegmentedButtons,
  Snackbar,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { appTheme } from "./theme";
import {
  canAccess,
  emptyGrants,
  environmentId,
  Group,
  groupLabels,
  groups,
  initialUsers,
  Level,
} from "../domain/access";
import {
  Command,
  colorNames,
  IndicatorColor,
  indicatorPriorities,
  Scenario,
  GasStatus,
  gasStatusLabels,
  toggleLight,
} from "../domain/maquette";
import { useSimulator } from "../hooks/useSimulator";

type Screen =
  "Painel" | "Histórico" | "Conta" | "Conexões" | "Usuários" | "Evidências";
const navIcons: Record<Screen, string> = {
  Painel: "view-dashboard-outline",
  Histórico: "history",
  Conta: "account-circle-outline",
  Conexões: "lan-connect",
  Usuários: "account-key-outline",
  Evidências: "notebook-outline",
};
const indicatorColors: Record<IndicatorColor, string> = {
  red: "#D62D3A",
  orange: "#D97508",
  yellow: "#D5AA00",
  green: "#16854B",
  blue: "#246DDB",
  off: "#708097",
};
const levelLabels: Record<Level, string> = {
  none: "Sem acesso",
  read: "Visualizar",
  control: "Controlar",
};
const mobileRoutes = [
  { key: "Painel", title: "Ambiente", focusedIcon: navIcons.Painel },
  { key: "Histórico", title: "Histórico", focusedIcon: navIcons.Histórico },
  { key: "Conta", title: "Conta", focusedIcon: navIcons.Conta },
];

export default function App() {
  const [dark, setDark] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (live) setSystemReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setSystemReduced,
    );
    return () => {
      live = false;
      subscription.remove();
    };
  }, []);
  const reduced = reduceMotion || systemReduced;
  const theme = useMemo(() => appTheme(dark, reduced), [dark, reduced]);
  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={theme}
        settings={{
          icon: (props) => (
            <MaterialCommunityIcons
              {...props}
              name={
                props.name as React.ComponentProps<
                  typeof MaterialCommunityIcons
                >["name"]
              }
            />
          ),
        }}
      >
        <DemoApp
          dark={dark}
          setDark={setDark}
          reduced={reduced}
          setReduceMotion={setReduceMotion}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function Panel({
  title,
  children,
  subtitle,
}: {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
}) {
  const theme = useTheme();
  return (
    <Card
      mode="contained"
      style={[s.card, { backgroundColor: theme.colors.surface }]}
    >
      <Card.Content style={s.cardContent}>
        <Text variant="titleMedium" style={s.bold}>
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {subtitle}
          </Text>
        )}
        {children}
      </Card.Content>
    </Card>
  );
}
function Note({
  title,
  text,
  warning = false,
}: {
  title: string;
  text?: string;
  warning?: boolean;
}) {
  const { colors, dark } = useTheme();
  return (
    <View
      style={[
        s.note,
        {
          backgroundColor: warning
            ? dark
              ? "#382D22"
              : "#FFF0D8"
            : colors.primaryContainer,
        },
      ]}
    >
      <Text
        variant="labelLarge"
        style={{
          color: warning
            ? dark
              ? "#FFD397"
              : "#76500A"
            : colors.onPrimaryContainer,
        }}
      >
        {title}
      </Text>
      {text && (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {text}
        </Text>
      )}
    </View>
  );
}
function Room({
  intensity,
  indicator,
  reduced,
}: {
  intensity: number | null;
  indicator: IndicatorColor | null;
  reduced: boolean;
}) {
  const { colors } = useTheme();
  const [glow] = useState(() => new Animated.Value((intensity ?? 0) / 100));
  useEffect(() => {
    const animation = Animated.timing(glow, {
      toValue: (intensity ?? 0) / 100,
      duration: reduced ? 0 : 350,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [glow, intensity, reduced]);
  return (
    <View
      accessible
      accessibilityLabel={
        intensity === null
          ? "Ilustração do quarto, iluminação restrita"
          : `Quarto ilustrado com luz em ${intensity}%`
      }
      style={[s.room, { backgroundColor: colors.background }]}
    >
      <View style={[s.roomWall, { borderColor: colors.outlineVariant }]} />
      <Animated.View style={[s.lightGlow, { opacity: glow }]} />
      <View
        style={[
          s.lamp,
          { backgroundColor: intensity ? "#EACB6B" : colors.outline },
        ]}
      />
      <View style={[s.bed, { backgroundColor: colors.surfaceVariant }]}>
        <View
          style={[s.pillow, { backgroundColor: colors.onSurfaceVariant }]}
        />
        <View style={[s.blanket, { backgroundColor: colors.primary }]} />
      </View>
      <View style={[s.door, { borderColor: colors.outlineVariant }]}>
        <View
          style={[
            s.doorLed,
            {
              backgroundColor: indicator
                ? indicatorColors[indicator]
                : colors.outline,
            },
          ]}
        />
      </View>
      <Text
        variant="labelSmall"
        style={[s.roomCaption, { color: colors.onSurfaceVariant }]}
      >
        Ilustração da maquete
      </Text>
    </View>
  );
}

function DemoApp({
  dark,
  setDark,
  reduced,
  setReduceMotion,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
  reduced: boolean;
  setReduceMotion: (v: boolean) => void;
}) {
  const theme = useTheme(),
    { colors } = theme;
  const { width, height } = useWindowDimensions();
  const desktop = width >= 1100,
    wide = width >= 760;
  const sim = useSimulator();
  const [users, setUsers] = useState(initialUsers);
  const [session, setSession] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("Painel");
  const [draft, setDraft] = useState<number | null>(null);
  const [snack, setSnack] = useState("");
  const [editingUser, setEditingUser] = useState("matheus");
  const [dialog, setDialog] = useState<
    "user" | "connection" | "disable" | null
  >(null);
  const [name, setName] = useState(""),
    [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [connection, setConnection] = useState({
    name: "Quarto da maquete",
    device: "ESP32-quarto-01",
    endpoint: "https://servico.exemplo",
    active: true,
  });
  const [connectionDraft, setConnectionDraft] = useState(connection);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "passed" | "failed"
  >("idle");
  const testTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userSequence = useRef(0);
  const scroll = useRef<ScrollView>(null);
  useEffect(
    () => () => {
      if (testTimer.current) clearTimeout(testTimer.current);
    },
    [],
  );
  const user = users.find((u) => u.id === session) ?? null;
  const selected = users.find((u) => u.id === editingUser) ?? users[0];
  const read = (group: Group) => canAccess(user, environmentId, group, "read");
  const control = (group: Group) =>
    canAccess(user, environmentId, group, "control");
  const ready =
    sim.connection === "online" && connection.active && !sim.pending;
  const age = Math.max(0, Math.floor((sim.now - sim.device.receivedAt) / 1000));
  const title: Record<Screen, string> = {
    Painel: connection.name,
    Histórico: "Histórico do ambiente",
    Conta: "Minha conta",
    Conexões: "Conexões e ambientes",
    Usuários: "Usuários e permissões",
    Evidências: "Registro para o TCC",
  };
  function navigate(next: Screen) {
    if ((next === "Conexões" || next === "Usuários") && !user?.admin) return;
    setScreen(next);
    setDraft(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  function closeDialog() {
    if (testTimer.current) clearTimeout(testTimer.current);
    setDialog(null);
    setFormError("");
    setTestStatus("idle");
  }
  function changeSession(id: string | null) {
    sim.cancelPending();
    closeDialog();
    setSession(id);
    setDraft(null);
    setScreen("Painel");
  }
  function send(command: Command) {
    const group = command.kind === "light" ? "light" : "indicator";
    if (!canAccess(user, environmentId, group, "control")) {
      setSnack("Seu perfil não permite este comando.");
      return;
    }
    if (!ready) return;
    setDraft(null);
    sim.send(command, user?.name);
  }
  function setLevel(group: Group, level: Level) {
    if (
      !user?.admin ||
      ((group === "sensors" || group === "history") && level === "control")
    )
      return;
    sim.cancelPending();
    setUsers((previous) =>
      previous.map((u) =>
        u.id === selected.id
          ? {
              ...u,
              grants: {
                ...u.grants,
                [environmentId]: {
                  ...(u.grants[environmentId] ?? emptyGrants()),
                  [group]: level,
                },
              },
            }
          : u,
      ),
    );
    setSnack(
      `${selected.name}: ${groupLabels[group]} → ${levelLabels[level]}.`,
    );
  }
  function addUser() {
    if (!user?.admin) return;
    const normalized = email.trim().toLowerCase();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setFormError("Informe nome e e-mail válido para o perfil fictício.");
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === normalized)) {
      setFormError("Já existe um perfil de demonstração com esse e-mail.");
      return;
    }
    const id = `demo-${++userSequence.current}`;
    setUsers((previous) => [
      ...previous,
      {
        id,
        name: name.trim(),
        email: normalized,
        admin: false,
        grants: { [environmentId]: emptyGrants() },
      },
    ]);
    setEditingUser(id);
    closeDialog();
    setSnack(
      "Perfil fictício criado sem acesso. Configure as permissões. Nenhum convite foi enviado.",
    );
  }
  function testConnection() {
    if (!user?.admin) return;
    try {
      const url = new URL(connectionDraft.endpoint.trim());
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error();
    } catch {
      setFormError("Use um endereço http/https sem credenciais na URL.");
      return;
    }
    if (!connectionDraft.name.trim() || !connectionDraft.device.trim()) {
      setFormError("Informe ambiente e identificador do dispositivo.");
      return;
    }
    setFormError("");
    setTestStatus("testing");
    testTimer.current = setTimeout(
      () => setTestStatus(sim.connection === "online" ? "passed" : "failed"),
      700,
    );
  }
  const themeControl = (
    <IconButton
      icon={dark ? "weather-sunny" : "weather-night"}
      accessibilityLabel={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      onPress={() => setDark(!dark)}
    />
  );
  const brand = (
    <View style={s.row}>
      <Avatar.Text size={40} label="M" />
      <View>
        <Text variant="titleMedium" style={s.bold}>
          Maquete conectada
        </Text>
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          CONTROLE DO AMBIENTE
        </Text>
      </View>
    </View>
  );
  const nav = (item: Screen) => (
    <List.Item
      key={item}
      title={item}
      left={(props) => (
        <List.Icon
          {...props}
          icon={navIcons[item]}
          color={screen === item ? colors.primary : colors.onSurfaceVariant}
        />
      )}
      onPress={() => navigate(item)}
      style={[
        s.navItem,
        screen === item && { backgroundColor: colors.primaryContainer },
      ]}
      titleStyle={{
        color: screen === item ? colors.onPrimaryContainer : colors.onSurface,
      }}
      accessibilityLabel={`Abrir ${item}`}
    />
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.background }]}>
      <StatusBar style={dark ? "light" : "dark"} />
      {!user ? (
        <ScrollView contentContainerStyle={s.loginScroll}>
          <View style={[s.loginPage, wide && s.loginWide]}>
            <View style={s.loginIntro}>
              <View style={s.spread}>
                {brand}
                {themeControl}
              </View>
              <Text variant="displaySmall" style={[s.bold, s.loginTitle]}>
                Seu ambiente. Seu controle.
              </Text>
              <Text
                variant="bodyLarge"
                style={{ color: colors.onSurfaceVariant }}
              >
                Uma interface para acompanhar o quarto e experimentar cada
                função da maquete.
              </Text>
              <Room intensity={65} indicator="blue" reduced={reduced} />
              <Note
                title="Protótipo interativo"
                text="Dados simulados. As alterações respondem na interface, sem equipamento conectado."
              />
            </View>
            <View style={s.loginProfiles}>
              <Panel
                title="Escolha um perfil para testar"
                subtitle="Contas fictícias · sem senha ou autenticação real"
              >
                {users.map((profile) => (
                  <View
                    key={profile.id}
                    style={[s.profile, { borderColor: colors.outlineVariant }]}
                  >
                    <View style={s.row}>
                      <Avatar.Text size={38} label={profile.name.slice(0, 1)} />
                      <View style={s.flex}>
                        <Text variant="titleMedium">{profile.name}</Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: colors.onSurfaceVariant }}
                        >
                          {profile.admin
                            ? "Administrador · conexões e acessos"
                            : "Usuário · permissões específicas"}
                        </Text>
                      </View>
                    </View>
                    <Button
                      mode={profile.admin ? "contained" : "outlined"}
                      onPress={() => changeSession(profile.id)}
                      accessibilityLabel={`Entrar como ${profile.name}`}
                    >
                      Entrar como {profile.name}
                    </Button>
                  </View>
                ))}
                <Text
                  variant="bodySmall"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Perfis, preferências e configurações duram nesta sessão.
                  Recarregar reinicia a demonstração.
                </Text>
              </Panel>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={s.shell}>
          {desktop && (
            <View style={[s.sidebar, { backgroundColor: colors.surface }]}>
              {brand}
              <Divider style={s.divider} />
              <Text
                variant="labelSmall"
                style={{ color: colors.onSurfaceVariant }}
              >
                SEU ESPAÇO
              </Text>
              {(["Painel", "Histórico", "Conta"] as Screen[]).map(nav)}
              {user.admin && (
                <>
                  <Divider style={s.divider} />
                  <Text
                    variant="labelSmall"
                    style={{ color: colors.onSurfaceVariant }}
                  >
                    ADMINISTRAÇÃO
                  </Text>
                  {nav("Conexões")}
                  {nav("Usuários")}
                </>
              )}
              {nav("Evidências")}
              <View style={s.sidebarFooter}>
                <Text variant="titleSmall">{user.name}</Text>
                <Text variant="bodySmall">
                  {user.admin ? "Administrador" : "Usuário"} de demonstração
                </Text>
                <Button
                  mode="text"
                  onPress={() => changeSession(null)}
                  icon="logout"
                >
                  Trocar perfil
                </Button>
                <Text variant="labelSmall">v0.3.0 · Protótipo</Text>
              </View>
            </View>
          )}
          <View style={s.flex}>
            <ScrollView
              ref={scroll}
              contentContainerStyle={[s.pageScroll, !wide && s.mobileScroll]}
            >
              <View style={s.page}>
                <View style={s.spread}>
                  {!desktop ? (
                    brand
                  ) : (
                    <Text
                      variant="labelLarge"
                      style={{ color: colors.primary }}
                    >
                      MAQUETE / {screen.toUpperCase()}
                    </Text>
                  )}
                  <View style={s.row}>
                    {themeControl}
                    {desktop && (
                      <Avatar.Text size={38} label={user.name.slice(0, 1)} />
                    )}
                  </View>
                </View>
                <View style={s.spread}>
                  <View style={s.flex}>
                    <Text
                      variant={wide ? "headlineLarge" : "headlineMedium"}
                      style={s.bold}
                    >
                      {title[screen]}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{ color: colors.onSurfaceVariant }}
                    >
                      {screen === "Painel"
                        ? "Sensores e controles em um único lugar."
                        : "Organize, acompanhe e teste a maquete conectada."}
                    </Text>
                  </View>
                </View>
                <View style={s.chips}>
                  <Chip compact icon="flask-outline">
                    Demonstração simulada
                  </Chip>
                  <Chip compact icon="account-outline">
                    {user.name} · {user.admin ? "admin" : "usuário"}
                  </Chip>
                </View>
                {screen === "Painel" && (
                  <>
                    <View style={[s.grid, !wide && s.stack]}>
                      <View style={s.column}>
                        <Panel
                          title="Um ambiente, várias possibilidades"
                          subtitle="Quarto 01 · Maquete conectada"
                        >
                          <Room
                            intensity={
                              read("light") ? sim.device.intensity : null
                            }
                            indicator={
                              read("indicator") ? sim.device.indicator : null
                            }
                            reduced={reduced}
                          />
                        </Panel>
                      </View>
                      <View style={s.column}>
                        <Panel title="Estado da conexão">
                          <View style={s.row}>
                            <View
                              style={[
                                s.statusDot,
                                {
                                  backgroundColor:
                                    sim.connection === "online" &&
                                    connection.active
                                      ? "#278B63"
                                      : "#D97508",
                                },
                              ]}
                            />
                            <Text variant="titleMedium">
                              {sim.connection === "online" && connection.active
                                ? "Online na simulação"
                                : sim.connection === "stale"
                                  ? "Leitura desatualizada"
                                  : "Sem comunicação"}
                            </Text>
                          </View>
                          <Text
                            variant="bodySmall"
                            style={{ color: colors.onSurfaceVariant }}
                          >
                            Última leitura há {age} s. Nenhum ESP32 real
                            conectado.
                          </Text>
                          <Note
                            title={
                              sim.pending
                                ? "Aguardando confirmação…"
                                : "Retorno da simulação"
                            }
                            text={sim.notice}
                            warning={sim.connection !== "online"}
                          />
                          {sim.pending && <ProgressBar indeterminate />}
                          <Button
                            mode="outlined"
                            onPress={() => navigate("Conta")}
                            icon="tune-variant"
                          >
                            Testar cenários de conexão
                          </Button>
                        </Panel>
                      </View>
                    </View>
                    <View style={[s.grid, !wide && s.stack]}>
                      <View style={s.column}>
                        {read("light") ? (
                          <Panel
                            title="Iluminação do quarto"
                            subtitle={
                              control("light")
                                ? "Ajuste o conforto do ambiente."
                                : "Seu perfil tem acesso somente à leitura."
                            }
                          >
                            <View style={s.spread}>
                              <View style={s.row}>
                                <Avatar.Icon
                                  size={44}
                                  icon={
                                    sim.device.lightOn
                                      ? "lightbulb-on-outline"
                                      : "lightbulb-outline"
                                  }
                                />
                                <Text variant="titleLarge">
                                  {sim.device.lightOn ? "Ligada" : "Desligada"}
                                </Text>
                              </View>
                              <Switch
                                value={sim.device.lightOn}
                                disabled={!ready || !control("light")}
                                onValueChange={() =>
                                  send(toggleLight(sim.device))
                                }
                                accessibilityLabel="Luz do quarto"
                              />
                            </View>
                            <Text
                              variant="displaySmall"
                              style={{ color: colors.primary }}
                            >
                              {sim.device.intensity}
                              <Text variant="titleLarge">%</Text>
                            </Text>
                            <Text
                              variant="bodySmall"
                              style={{ color: colors.onSurfaceVariant }}
                            >
                              {draft !== null
                                ? `Ajuste em edição: ${draft}%. Solte para enviar.`
                                : "Intensidade confirmada na simulação"}
                            </Text>
                            <Slider
                              accessibilityLabel="Intensidade da luz"
                              style={s.slider}
                              minimumValue={0}
                              maximumValue={100}
                              step={1}
                              value={draft ?? sim.device.intensity}
                              disabled={!ready || !control("light")}
                              onValueChange={setDraft}
                              onSlidingComplete={(value) =>
                                send({
                                  kind: "light",
                                  on: value > 0,
                                  intensity: value,
                                })
                              }
                              minimumTrackTintColor={colors.primary}
                              maximumTrackTintColor={colors.outlineVariant}
                              thumbTintColor={colors.primary}
                            />
                            <View style={s.spread}>
                              <Text variant="labelSmall">0%</Text>
                              <Text variant="labelSmall">100%</Text>
                            </View>
                            <View style={s.chips}>
                              {[0, 25, 50, 100].map((value) => (
                                <Button
                                  key={value}
                                  compact
                                  mode="outlined"
                                  disabled={!ready || !control("light")}
                                  onPress={() =>
                                    send({
                                      kind: "light",
                                      on: value > 0,
                                      intensity: value,
                                    })
                                  }
                                  accessibilityLabel={`Luz em ${value}%`}
                                >
                                  {value === 0 ? "Apagar" : `${value}%`}
                                </Button>
                              ))}
                            </View>
                            <Text
                              variant="bodySmall"
                              style={{ color: colors.onSurfaceVariant }}
                            >
                              Zero desliga. Ao religar, restaura a última
                              intensidade positiva.
                            </Text>
                          </Panel>
                        ) : (
                          <Note
                            title="Iluminação restrita"
                            text="Este grupo não foi liberado para seu perfil."
                          />
                        )}
                        <Panel title="Possíveis expansões">
                          <View style={s.chips}>
                            <Chip icon="lock-outline" disabled>
                              Fechadura
                            </Chip>
                          </View>
                          <Text
                            variant="bodyMedium"
                            style={{ color: colors.onSurfaceVariant }}
                          >
                            Recursos em planejamento, sujeitos ao hardware e à
                            validação da equipe.
                          </Text>
                        </Panel>
                      </View>
                      <View style={s.column}>
                        {read("sensors") ? (
                          <View style={s.grid}>
                            <View style={s.column}>
                              <Panel title="Temperatura">
                                <Avatar.Icon size={36} icon="thermometer" />
                                <Text variant="headlineMedium" style={s.bold}>
                                  {sim.device.temperature
                                    .toFixed(1)
                                    .replace(".", ",")}{" "}
                                  °C
                                </Text>
                                <Text variant="bodySmall">
                                  {age > 10
                                    ? "Última leitura · antiga"
                                    : "Leitura simulada"}
                                </Text>
                              </Panel>
                            </View>
                            <View style={s.column}>
                              <Panel title="Umidade">
                                <Avatar.Icon size={36} icon="water-percent" />
                                <Text variant="headlineMedium" style={s.bold}>
                                  {sim.device.humidity}%
                                </Text>
                                <Text variant="bodySmall">
                                  {age > 10
                                    ? "Última leitura · antiga"
                                    : "Leitura simulada"}
                                </Text>
                              </Panel>
                            </View>
                          </View>
                        ) : (
                          <Note
                            title="Sensores restritos"
                            text="As leituras não estão disponíveis para seu perfil."
                          />
                        )}
                        {read("sensors") && (
                          <Panel
                            title="Sensor de gás"
                            subtitle="Detecção simulada · sem leitura em ppm"
                          >
                            <Avatar.Icon size={36} icon="gas-cylinder" />
                            <Note
                              title={gasStatusLabels[sim.device.gas]}
                              warning={sim.device.gas !== "clear"}
                              text={
                                sim.connection !== "online" ||
                                !connection.active
                                  ? "Último estado recebido. Sem leitura atual para confirmar a detecção."
                                  : sim.device.gas === "detected"
                                    ? "Alerta demonstrativo de presença de gás. Verifique o ambiente na integração real."
                                    : sim.device.gas === "unavailable"
                                      ? "Sem dados do sensor de gás. Ausência de leitura não significa ausência de gás."
                                      : "Não há detecção no cenário simulado. Não representa uma medição física."
                              }
                            />
                            <Text variant="bodySmall">
                              O sensor de gás não altera a classificação
                              Manchester do quarto.
                            </Text>
                          </Panel>
                        )}
                        {read("indicator") ? (
                          <Panel
                            title="Indicador externo"
                            subtitle="Protocolo Manchester · seleção manual"
                          >
                            <View style={s.row}>
                              <View
                                style={[
                                  s.indicatorDot,
                                  {
                                    backgroundColor:
                                      indicatorColors[sim.device.indicator],
                                  },
                                ]}
                              />
                              <View style={s.flex}>
                                <Text variant="titleLarge">
                                  {colorNames[sim.device.indicator]}
                                </Text>
                                <Text variant="bodyMedium">
                                  {indicatorPriorities[sim.device.indicator]}
                                </Text>
                              </View>
                            </View>
                            <View style={s.priorityList}>
                              {(
                                [
                                  "red",
                                  "orange",
                                  "yellow",
                                  "green",
                                  "blue",
                                  "off",
                                ] as IndicatorColor[]
                              ).map((color) => (
                                <Button
                                  key={color}
                                  mode={
                                    sim.device.indicator === color
                                      ? "contained-tonal"
                                      : "outlined"
                                  }
                                  disabled={!ready || !control("indicator")}
                                  onPress={() =>
                                    send({ kind: "indicator", color })
                                  }
                                  contentStyle={s.priorityButton}
                                  style={{
                                    borderColor: indicatorColors[color],
                                  }}
                                  icon={() => (
                                    <View
                                      style={[
                                        s.priorityDot,
                                        {
                                          backgroundColor:
                                            indicatorColors[color],
                                        },
                                      ]}
                                    />
                                  )}
                                  accessibilityLabel={`Indicador ${colorNames[color]}`}
                                >
                                  {color === "off"
                                    ? "Apagar indicador"
                                    : `${colorNames[color]} · ${indicatorPriorities[color]}`}
                                </Button>
                              ))}
                            </View>
                            <Text
                              variant="bodySmall"
                              style={{ color: colors.onSurfaceVariant }}
                            >
                              {control("indicator")
                                ? "A cor muda após confirmação simulada. O app não realiza classificação clínica."
                                : "Somente leitura. Alteração não liberada para este perfil."}
                            </Text>
                          </Panel>
                        ) : (
                          <Note
                            title="Indicador restrito"
                            text="O administrador não liberou este grupo para seu perfil."
                          />
                        )}
                      </View>
                    </View>
                  </>
                )}
                {screen === "Histórico" &&
                  (read("history") ? (
                    <Panel
                      title="Atividade deste ambiente"
                      subtitle="Eventos desta sessão · sem persistência"
                    >
                      {sim.logs.length === 0 ? (
                        <Note
                          title="Nenhum evento ainda"
                          text="Altere a iluminação ou o indicador para registrar uma ação."
                        />
                      ) : (
                        sim.logs.map((log) => (
                          <View
                            key={log.id}
                            style={[
                              s.event,
                              { borderColor: colors.outlineVariant },
                            ]}
                          >
                            <View style={s.row}>
                              <Avatar.Icon
                                size={34}
                                icon={
                                  log.type === "error"
                                    ? "alert-circle-outline"
                                    : log.type === "success"
                                      ? "check"
                                      : "clock-outline"
                                }
                              />
                              <View style={s.flex}>
                                <Text
                                  variant="labelSmall"
                                  style={{ color: colors.onSurfaceVariant }}
                                >
                                  {log.time}
                                </Text>
                                <Text variant="bodyMedium">{log.message}</Text>
                              </View>
                            </View>
                          </View>
                        ))
                      )}
                    </Panel>
                  ) : (
                    <Note
                      title="Histórico restrito"
                      text="Seu perfil não pode consultar eventos deste ambiente."
                      warning
                    />
                  ))}
                {screen === "Conta" && (
                  <View style={[s.grid, !wide && s.stack]}>
                    <View style={s.column}>
                      <Panel title="Perfil de demonstração">
                        <View style={s.row}>
                          <Avatar.Text
                            size={52}
                            label={user.name.slice(0, 1)}
                          />
                          <View style={s.flex}>
                            <Text variant="titleLarge">{user.name}</Text>
                            <Text variant="bodyMedium">{user.email}</Text>
                            <Text variant="labelSmall">
                              {user.admin ? "Administrador" : "Usuário"} · conta
                              fictícia
                            </Text>
                          </View>
                        </View>
                        <Divider />
                        {groups.map((group) => (
                          <View key={group} style={s.spread}>
                            <Text variant="bodyMedium">
                              {groupLabels[group]}
                            </Text>
                            <Chip compact>
                              {
                                levelLabels[
                                  user.grants[environmentId]?.[group] ?? "none"
                                ]
                              }
                            </Chip>
                          </View>
                        ))}
                        {user.admin && (
                          <>
                            <Button
                              mode="contained"
                              icon="lan-connect"
                              onPress={() => navigate("Conexões")}
                            >
                              Gerenciar conexões
                            </Button>
                            <Button
                              mode="outlined"
                              icon="account-key-outline"
                              onPress={() => navigate("Usuários")}
                            >
                              Usuários e permissões
                            </Button>
                          </>
                        )}
                        <Button
                          mode="outlined"
                          icon="logout"
                          onPress={() => changeSession(null)}
                        >
                          Trocar perfil
                        </Button>
                      </Panel>
                      <Panel title="Aparência e acessibilidade">
                        <SegmentedButtons
                          value={dark ? "dark" : "light"}
                          onValueChange={(value) => setDark(value === "dark")}
                          buttons={[
                            {
                              value: "light",
                              label: "Claro",
                              icon: "weather-sunny",
                            },
                            {
                              value: "dark",
                              label: "Escuro",
                              icon: "weather-night",
                            },
                          ]}
                        />
                        <View style={s.spread}>
                          <Text variant="bodyMedium" style={s.flex}>
                            Reduzir animações
                          </Text>
                          <Switch
                            accessibilityLabel="Reduzir animações"
                            value={reduced}
                            onValueChange={setReduceMotion}
                          />
                        </View>
                        <Text variant="bodySmall">
                          A preferência do sistema por movimentos reduzidos
                          também é respeitada.
                        </Text>
                      </Panel>
                    </View>
                    <View style={s.column}>
                      <Panel
                        title="Laboratório da simulação"
                        subtitle="Estas ações são locais e não alteram equipamento real."
                      >
                        <View style={s.chips}>
                          {(
                            [
                              ["normal", "Normal"],
                              ["offline", "Offline"],
                              ["stale", "Dados antigos"],
                              ["timeout", "Sem confirmação"],
                            ] as [Scenario, string][]
                          ).map(([value, label]) => (
                            <Chip
                              key={value}
                              selected={sim.scenario === value}
                              onPress={() => {
                                setDraft(null);
                                sim.selectScenario(value);
                              }}
                              accessibilityLabel={`Cenário ${label}`}
                            >
                              {label}
                            </Chip>
                          ))}
                        </View>
                        {read("sensors") && (
                          <>
                            <Text variant="titleSmall">
                              Teste do sensor de gás
                            </Text>
                            <View style={s.chips}>
                              {(
                                [
                                  "clear",
                                  "detected",
                                  "unavailable",
                                ] as GasStatus[]
                              ).map((status) => (
                                <Chip
                                  key={status}
                                  selected={sim.device.gas === status}
                                  disabled={!ready}
                                  accessibilityLabel={`Simular gás: ${gasStatusLabels[status]}`}
                                  onPress={() => {
                                    if (read("sensors") && ready)
                                      sim.simulateGas(status);
                                  }}
                                >
                                  {gasStatusLabels[status]}
                                </Chip>
                              ))}
                            </View>
                            <Text variant="bodySmall">
                              Injeção de dados fictícios para testar o painel,
                              sem comando enviado ao sensor.
                            </Text>
                          </>
                        )}
                        <Note title="Teste o retorno" text={sim.notice} />
                        <Button
                          mode="outlined"
                          disabled={!user.admin}
                          onPress={() => {
                            sim.reset();
                            setConnection((previous) => ({
                              ...previous,
                              active: true,
                            }));
                            setDraft(null);
                            setSnack(
                              "Simulação reiniciada. Perfis e tema mantidos.",
                            );
                          }}
                        >
                          Reiniciar simulação
                        </Button>
                      </Panel>
                      <Panel title="Documentação">
                        <Text variant="bodyMedium">
                          Confira o roteiro de prints e gravações desta versão
                          para a monografia.
                        </Text>
                        <Button
                          mode="outlined"
                          icon="notebook-outline"
                          onPress={() => navigate("Evidências")}
                        >
                          Abrir evidências
                        </Button>
                      </Panel>
                    </View>
                  </View>
                )}
                {screen === "Conexões" && user.admin && (
                  <>
                    <Note
                      title="Administração de demonstração"
                      text="Endereço e dispositivo são exemplos. O teste não faz requisição de rede."
                    />
                    <Panel title={connection.name}>
                      <View style={s.chips}>
                        <Chip icon="chip">{connection.device}</Chip>
                        <Chip>
                          {connection.active
                            ? "Habilitada na simulação"
                            : "Desativada"}
                        </Chip>
                      </View>
                      <Text variant="bodyMedium">
                        Serviço: {connection.endpoint}
                      </Text>
                      <Text variant="bodySmall">
                        Recursos: iluminação, sensores e indicador. Um ambiente
                        demonstrativo nesta versão.
                      </Text>
                      <View style={s.chips}>
                        <Button
                          mode="contained"
                          onPress={() => {
                            setConnectionDraft(connection);
                            setTestStatus("idle");
                            setDialog("connection");
                          }}
                        >
                          Editar e testar
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => {
                            if (connection.active) setDialog("disable");
                            else {
                              setConnection((previous) => ({
                                ...previous,
                                active: true,
                              }));
                              sim.selectScenario("normal");
                              setSnack("Conexão reativada na simulação.");
                            }
                          }}
                        >
                          {connection.active
                            ? "Desativar conexão"
                            : "Reativar conexão"}
                        </Button>
                      </View>
                    </Panel>
                  </>
                )}
                {screen === "Usuários" && user.admin && (
                  <>
                    <Note
                      title="Permissões por ambiente"
                      text="A concessão é aplicada imediatamente à simulação. Sem concessão explícita, sem acesso."
                    />
                    <Panel title="Selecione uma pessoa">
                      <View style={s.chips}>
                        {users.map((u) => (
                          <Chip
                            key={u.id}
                            selected={editingUser === u.id}
                            onPress={() => setEditingUser(u.id)}
                          >
                            {u.name}
                          </Chip>
                        ))}
                      </View>
                      <Text variant="bodyMedium">
                        {selected.email} ·{" "}
                        {selected.admin ? "Administrador" : "Usuário"}
                      </Text>
                      <Text variant="bodySmall">
                        Ambiente: {connection.name}
                      </Text>
                    </Panel>
                    <Panel title={`Acessos de ${selected.name}`}>
                      <View style={s.accessHeader}>
                        <Text variant="labelLarge" style={s.accessLabel}>
                          Grupo de funções · Não: sem acesso / Ver: visualizar /
                          Usar: controlar
                        </Text>
                        {wide && (
                          <Text variant="labelLarge">Permissão concedida</Text>
                        )}
                      </View>
                      {groups.map((group) => (
                        <View
                          key={group}
                          style={[
                            s.accessRow,
                            !wide && s.stack,
                            { borderColor: colors.outlineVariant },
                          ]}
                        >
                          <View style={s.accessLabel}>
                            <Text variant="titleSmall">
                              {groupLabels[group]}
                            </Text>
                            <Text
                              variant="bodySmall"
                              style={{ color: colors.onSurfaceVariant }}
                            >
                              {group === "light"
                                ? "Ligar, desligar e ajustar"
                                : group === "indicator"
                                  ? "Cor e prioridade manual"
                                  : "Consulta de dados"}
                            </Text>
                          </View>
                          <SegmentedButtons
                            style={s.accessOptions}
                            value={
                              selected.grants[environmentId]?.[group] ?? "none"
                            }
                            onValueChange={(value) =>
                              setLevel(group, value as Level)
                            }
                            buttons={(
                              [
                                "none",
                                "read",
                                ...(group === "light" || group === "indicator"
                                  ? ["control"]
                                  : []),
                              ] as Level[]
                            ).map((value) => ({
                              value,
                              label: wide
                                ? levelLabels[value]
                                : (
                                    {
                                      none: "Não",
                                      read: "Ver",
                                      control: "Usar",
                                    } as const
                                  )[value],
                            }))}
                          />
                        </View>
                      ))}
                    </Panel>
                    <Button
                      mode="contained"
                      icon="account-plus-outline"
                      onPress={() => {
                        setName("");
                        setEmail("");
                        setDialog("user");
                      }}
                    >
                      Criar perfil fictício
                    </Button>
                    <Text variant="bodySmall">
                      Teste as permissões trocando de perfil na Conta. Login
                      real e validação no backend ainda não implementados.
                    </Text>
                  </>
                )}
                {screen === "Evidências" && (
                  <>
                    <Panel title="TIRE PRINT DESTA PARTE">
                      <Text variant="bodyMedium">
                        Painel claro e escuro; mobile e desktop; prioridade
                        Manchester; matriz de acesso; conta com controles
                        bloqueados.
                      </Text>
                    </Panel>
                    <Panel title="MOSTRE FUNCIONANDO EM VÍDEO OU GIF">
                      <Text variant="bodyMedium">
                        Altere intensidade, apague e religue a luz. Troque a cor
                        do indicador. Edite permissões e entre com outro perfil.
                        Simule conexão offline e falta de confirmação. Alterne
                        os temas.
                      </Text>
                    </Panel>
                    <Note
                      title="Limites desta versão"
                      text="Perfis e configuração locais, sem autenticação, persistência ou ESP32 conectado. Identifique as evidências como simulação. Histórico só desta sessão."
                    />
                  </>
                )}
                <Text
                  variant="labelSmall"
                  style={[s.footer, { color: colors.onSurfaceVariant }]}
                >
                  v0.3.0 · Protótipo interativo · Dados simulados
                </Text>
              </View>
            </ScrollView>
            {!desktop && (
              <BottomNavigation.Bar
                navigationState={{
                  index: Math.max(
                    0,
                    mobileRoutes.findIndex(
                      (r) =>
                        r.key ===
                        (["Conexões", "Usuários", "Evidências"].includes(screen)
                          ? "Conta"
                          : screen),
                    ),
                  ),
                  routes: mobileRoutes,
                }}
                onTabPress={({ route }) => navigate(route.key as Screen)}
                style={{ backgroundColor: colors.surface }}
              />
            )}
          </View>
        </View>
      )}
      <Portal>
        <Dialog
          visible={dialog === "user" || dialog === "connection"}
          onDismiss={closeDialog}
          style={{ maxWidth: 600, width: "92%", alignSelf: "center" }}
        >
          <Dialog.Title>
            {dialog === "user" ? "Criar perfil fictício" : "Configurar conexão"}
          </Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: Math.min(440, height * 0.5) }}>
            <ScrollView
              contentContainerStyle={s.form}
              keyboardShouldPersistTaps="handled"
            >
              {dialog === "user" ? (
                <>
                  <TextInput
                    mode="outlined"
                    label="Nome"
                    value={name}
                    onChangeText={setName}
                  />
                  <TextInput
                    mode="outlined"
                    label="E-mail fictício"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <Text variant="bodySmall">
                    Começa sem acesso. Nenhuma conta real será criada ou
                    mensagem enviada.
                  </Text>
                </>
              ) : (
                <>
                  <TextInput
                    mode="outlined"
                    label="Nome do ambiente"
                    value={connectionDraft.name}
                    onChangeText={(name) => {
                      setConnectionDraft((previous) => ({ ...previous, name }));
                      setTestStatus("idle");
                    }}
                  />
                  <TextInput
                    mode="outlined"
                    label="Identificador do dispositivo"
                    value={connectionDraft.device}
                    onChangeText={(device) => {
                      setConnectionDraft((previous) => ({
                        ...previous,
                        device,
                      }));
                      setTestStatus("idle");
                    }}
                  />
                  <TextInput
                    mode="outlined"
                    label="Endereço do serviço"
                    value={connectionDraft.endpoint}
                    onChangeText={(endpoint) => {
                      setConnectionDraft((previous) => ({
                        ...previous,
                        endpoint,
                      }));
                      setTestStatus("idle");
                    }}
                    autoCapitalize="none"
                  />
                  <Button
                    mode="outlined"
                    loading={testStatus === "testing"}
                    disabled={testStatus === "testing"}
                    onPress={testConnection}
                  >
                    Testar conexão simulada
                  </Button>
                  {testStatus === "passed" && (
                    <Note
                      title="Teste simulado concluído"
                      text="Recursos demonstrativos identificados. Nenhuma requisição real realizada."
                    />
                  )}
                  {testStatus === "failed" && (
                    <Note
                      title="Teste simulado falhou"
                      text="Restaure o cenário Normal na Conta e tente novamente."
                      warning
                    />
                  )}
                </>
              )}
              {formError && <HelperText type="error">{formError}</HelperText>}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancelar</Button>
            <Button
              disabled={dialog === "connection" && testStatus !== "passed"}
              onPress={() => {
                if (dialog === "user") addUser();
                else if (user?.admin) {
                  setConnection({
                    ...connectionDraft,
                    name: connectionDraft.name.trim(),
                    device: connectionDraft.device.trim(),
                    endpoint: connectionDraft.endpoint.trim(),
                  });
                  closeDialog();
                  setSnack("Configuração salva nesta sessão de demonstração.");
                }
              }}
            >
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={dialog === "disable"}
          onDismiss={closeDialog}
          style={{ maxWidth: 520, width: "92%", alignSelf: "center" }}
        >
          <Dialog.Title>Desativar conexão?</Dialog.Title>
          <Dialog.Content>
            <Text>
              Os controles ficarão bloqueados. O último estado confirmado será
              preservado.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancelar</Button>
            <Button
              onPress={() => {
                if (!user?.admin) return;
                setConnection((previous) => ({ ...previous, active: false }));
                sim.selectScenario("offline");
                closeDialog();
              }}
            >
              Desativar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack("")}
        duration={3500}
        action={{ label: "OK", onPress: () => setSnack("") }}
      >
        {snack}
      </Snackbar>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  shell: { flex: 1, flexDirection: "row" },
  flex: { flex: 1, minWidth: 0 },
  sidebar: { width: 260, padding: 20, gap: 8 },
  sidebarFooter: { marginTop: "auto", gap: 8, paddingTop: 20 },
  navItem: { borderRadius: 16 },
  divider: { marginVertical: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  spread: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  pageScroll: { padding: 32, alignItems: "center" },
  mobileScroll: { padding: 16 },
  page: { width: "100%", maxWidth: 1220, gap: 24 },
  grid: { flexDirection: "row", gap: 20 },
  stack: { flexDirection: "column" },
  column: { flex: 1, minWidth: 0, gap: 20 },
  card: { borderRadius: 24 },
  cardContent: { padding: 20, gap: 16 },
  bold: { fontWeight: "700" },
  note: { padding: 16, borderRadius: 16, gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slider: { width: "100%", height: 44 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  indicatorDot: { width: 24, height: 24, borderRadius: 12 },
  priorityDot: { width: 12, height: 12, borderRadius: 6 },
  priorityList: { gap: 8 },
  priorityButton: { justifyContent: "flex-start", minHeight: 48 },
  footer: { marginTop: 8, paddingBottom: 12 },
  event: { paddingVertical: 12, borderBottomWidth: 1 },
  profile: { padding: 16, borderWidth: 1, borderRadius: 16, gap: 16 },
  loginScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loginPage: { width: "100%", maxWidth: 1140, gap: 40 },
  loginWide: { flexDirection: "row", alignItems: "center" },
  loginIntro: { flex: 1, minWidth: 0, gap: 24 },
  loginProfiles: { flex: 1, minWidth: 0 },
  loginTitle: { marginTop: 20, fontWeight: "700" },
  room: { height: 164, borderRadius: 20, overflow: "hidden" },
  roomWall: {
    position: "absolute",
    top: 24,
    left: "10%",
    right: "10%",
    bottom: 35,
    borderWidth: 2,
    borderRadius: 12,
  },
  bed: {
    position: "absolute",
    bottom: 37,
    left: "18%",
    width: "45%",
    height: 57,
    borderRadius: 10,
    flexDirection: "row",
    padding: 8,
    gap: 6,
  },
  pillow: { width: "25%", borderRadius: 6 },
  blanket: { flex: 1, borderRadius: 6 },
  lightGlow: {
    position: "absolute",
    width: 100,
    height: 110,
    top: 22,
    right: "19%",
    backgroundColor: "#FFE390",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    transform: [{ scaleX: 0.85 }],
  },
  lamp: {
    position: "absolute",
    top: 18,
    right: "27%",
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  door: {
    position: "absolute",
    width: 28,
    height: 78,
    right: "9%",
    bottom: 35,
    borderWidth: 2,
    borderRadius: 5,
  },
  doorLed: {
    position: "absolute",
    width: 8,
    height: 26,
    left: 8,
    top: 12,
    borderRadius: 4,
  },
  roomCaption: { position: "absolute", bottom: 10, left: 16 },
  accessHeader: { flexDirection: "row", gap: 20 },
  accessLabel: { flex: 1, minWidth: 0, gap: 4 },
  accessRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  accessOptions: { flex: 2, minWidth: 0 },
  form: { paddingVertical: 16, gap: 16 },
});
