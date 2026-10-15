import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Image,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Avatar,
  BottomNavigation,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  HelperText,
  Icon,
  IconButton,
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
import Slider from "./LightSlider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  canAccess,
  emptyGrants,
  Group,
  groupLabels,
  groups,
  initialUsers,
  Level,
} from "../domain/access";
import {
  Command,
  colorNames,
  GasStatus,
  gasStatusLabels,
  IndicatorColor,
  indicatorPriorities,
  Scenario,
  toggleLight,
} from "../domain/maquette";
import {
  initialRooms,
  RoomDefinition,
  roomError,
  roomVisible,
} from "../domain/rooms";
import { useSimulator } from "../hooks/useSimulator";
import { decodeTelemetry, requestNodeRed } from "../services/nodeRed";
import { GasAlarm } from "./GasAlarm";
import { appTheme } from "./theme";

type Screen =
  | "Quartos"
  | "Painel"
  | "Iluminação"
  | "Sensores"
  | "Manchester"
  | "Histórico"
  | "Conta"
  | "Conexões"
  | "Usuários"
  | "Cadastro";
const navIcons: Record<Screen, string> = {
  Quartos: "bed-outline",
  Painel: "view-dashboard-outline",
  Iluminação: "lightbulb-outline",
  Sensores: "access-point",
  Manchester: "medical-bag",
  Histórico: "history",
  Conta: "account-circle-outline",
  Conexões: "lan-connect",
  Usuários: "account-key-outline",
  Cadastro: "plus-box-outline",
};
const navLabels: Partial<Record<Screen, string>> = {
  Painel: "Visão geral",
  Sensores: "Sensores e gás",
  Manchester: "Triagem Manchester",
  Usuários: "Usuários e permissões",
};
const indicatorColors: Record<IndicatorColor, string> = {
  red: "#EF4444",
  orange: "#F97316",
  yellow: "#EAB308",
  green: "#22C55E",
  blue: "#3B82F6",
  off: "#64748B",
};
const levelLabels: Record<Level, string> = {
  none: "Sem acesso",
  read: "Visualizar",
  control: "Controlar",
};
const routes = [
  { key: "Quartos", title: "Quartos", focusedIcon: navIcons.Quartos },
  { key: "Painel", title: "Painel", focusedIcon: navIcons.Painel },
  { key: "Histórico", title: "Histórico", focusedIcon: navIcons.Histórico },
  { key: "Conta", title: "Conta", focusedIcon: navIcons.Conta },
];
const scenarios: [Scenario, string][] = [
  ["normal", "Normal"],
  ["offline", "Sem comunicação"],
  ["stale", "Dado antigo"],
  ["timeout", "Sem confirmação"],
];
type Simulator = ReturnType<typeof useSimulator>;

export default function App({ isolated = false }: { isolated?: boolean }) {
  const [dark, setDark] = useState(true),
    [reduceMotion, setReduceMotion] = useState(false),
    [systemReduced, setSystemReduced] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (live) setSystemReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setSystemReduced,
    );
    return () => {
      live = false;
      sub.remove();
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
          isolated={isolated}
          dark={dark}
          setDark={setDark}
          reduced={reduced}
          setReduceMotion={setReduceMotion}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function Brand({ width = 180 }: { width?: number }) {
  return (
    <Image
      source={require("../../assets/samahi-logo.png")}
      style={[
        s.brand,
        {
          width,
          height: (width * 98) / 420,
          backgroundColor: "#FFFFFF",
          borderRadius: 8,
        },
      ]}
      resizeMode="contain"
      accessibilityLabel="SAMAHI - Sistema de Automação e Monitoramento de Ambientes Hospitalares Inteligentes"
    />
  );
}
function Panel({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string;
  icon?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Card
      mode="outlined"
      style={[
        s.card,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <Card.Content style={s.cardContent}>
        <View style={s.row}>
          {icon && <Icon source={icon} size={22} color={colors.primary} />}
          <Text variant="titleMedium" style={[s.bold, s.flex]}>
            {title}
          </Text>
        </View>
        {subtitle && (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
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
              ? "#332A1A"
              : "#FFF4DA"
            : colors.primaryContainer,
        },
      ]}
    >
      <Text
        variant="labelLarge"
        style={{
          color: warning
            ? dark
              ? "#FFE19D"
              : "#684600"
            : colors.onPrimaryContainer,
        }}
      >
        {title}
      </Text>
      {text && (
        <Text
          variant="bodySmall"
          style={{
            color: warning
              ? dark
                ? "#FFE19D"
                : "#684600"
              : colors.onPrimaryContainer,
          }}
        >
          {text}
        </Text>
      )}
    </View>
  );
}
function Blueprint({
  intensity,
  indicator,
}: {
  intensity: number | null;
  indicator: IndicatorColor | null;
}) {
  const { colors, dark } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`Planta ilustrada: luz ${intensity === null ? "restrita" : `${intensity}%`}, indicador ${indicator === null ? "restrito" : colorNames[indicator]}`}
      style={[
        s.blueprint,
        {
          backgroundColor: dark ? "#0C1425" : "#F5F8FC",
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <View
          key={`v${i}`}
          style={[
            s.gridLine,
            {
              left: `${(i + 1) * 10}%`,
              backgroundColor: colors.outlineVariant,
            },
          ]}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <View
          key={`h${i}`}
          style={[
            s.gridHorizontal,
            { top: `${(i + 1) * 14}%`, backgroundColor: colors.outlineVariant },
          ]}
        />
      ))}
      <View style={[s.floorWall, { borderColor: colors.outline }]}>
        <View style={[s.bathroom, { borderColor: colors.outlineVariant }]}>
          <Icon source="door" size={20} color={colors.onSurfaceVariant} />
          <Text variant="labelSmall">Sanitário</Text>
        </View>
      </View>
      <View style={[s.board, { backgroundColor: colors.primaryContainer }]}>
        <Icon source="chip" size={18} color={colors.primary} />
        <Text variant="labelSmall" style={{ color: colors.primary }}>
          ESP32 ilustrado
        </Text>
      </View>
      <View
        style={[
          s.lightZone,
          {
            backgroundColor: "#EABF58",
            opacity: intensity === null ? 0 : intensity / 500,
          },
        ]}
      />
      <View
        style={[
          s.bed,
          { borderColor: colors.primary, backgroundColor: colors.surface },
        ]}
      >
        <View style={[s.pillow, { backgroundColor: colors.surfaceVariant }]} />
        <View style={[s.blanket, { backgroundColor: colors.primaryContainer }]}>
          <Text
            variant="labelSmall"
            style={{ color: colors.onPrimaryContainer }}
          >
            Leito
          </Text>
        </View>
      </View>
      <View style={s.doorLed}>
        <View
          style={[
            s.indicatorDot,
            {
              backgroundColor:
                indicator === null
                  ? colors.outline
                  : indicatorColors[indicator],
            },
          ]}
        />
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          Indicador externo
        </Text>
      </View>
      <View style={[s.planCaption, { backgroundColor: colors.surface }]}>
        <Icon source="floor-plan" size={15} color={colors.primary} />
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          Esquema da maquete · sem escala
        </Text>
      </View>
    </View>
  );
}
function Metric({
  title,
  value,
  icon,
  detail,
}: {
  title: string;
  value: string;
  icon: string;
  detail: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        s.metric,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <View style={s.spread}>
        <Text variant="labelLarge" style={s.flex}>
          {title}
        </Text>
        <Icon source={icon} size={22} color={colors.primary} />
      </View>
      <Text variant="headlineMedium" style={s.bold}>
        {value}
      </Text>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        {detail}
      </Text>
    </View>
  );
}
function Dashboard({
  sim,
  room,
  read,
  control,
  send,
  screen,
  wide,
  onGas,
}: {
  sim: Simulator;
  room: RoomDefinition;
  read: (group: Group) => boolean;
  control: (group: Group) => boolean;
  send: (command: Command) => void;
  screen: Screen;
  wide: boolean;
  onGas: () => void;
}) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState<number | null>(null);
  const ready = sim.connection === "online" && room.active && !sim.pending;
  const outdated = sim.connection !== "online" || !room.active;
  const detail = outdated
    ? "Último valor · sem leitura atual"
    : "Leitura simulada";
  const showAll = screen === "Painel";
  const light = read("light") ? (
    <Panel
      title="Iluminação do quarto"
      icon="lightbulb-on-outline"
      subtitle={
        control("light")
          ? "Controle da luz e intensidade"
          : "Acesso somente à leitura"
      }
    >
      <View style={s.spread}>
        <Text variant="titleSmall">
          {sim.device.lightOn ? "Ligada" : "Desligada"}
        </Text>
        <Switch
          value={sim.device.lightOn}
          disabled={!ready || !control("light")}
          accessibilityLabel="Luz do quarto"
          onValueChange={() => send(toggleLight(sim.device))}
        />
      </View>
      <View style={s.spread}>
        <View style={s.flex}>
          <Text variant="labelMedium">Intensidade confirmada</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            Na simulação
          </Text>
        </View>
        <Text
          variant="displaySmall"
          style={[s.bold, { color: colors.primary }]}
        >
          {sim.device.intensity}%
        </Text>
      </View>
      <Slider
        style={s.slider}
        accessibilityLabel="Intensidade da luz"
        accessibilityState={{ disabled: !ready || !control("light") }}
        accessibilityValue={{
          min: 0,
          max: 100,
          now: draft ?? sim.device.intensity,
          text: `${draft ?? sim.device.intensity}%`,
        }}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={draft ?? sim.device.intensity}
        disabled={!ready || !control("light")}
        onValueChange={setDraft}
        onSlidingComplete={(value) => {
          setDraft(null);
          send({ kind: "light", on: value > 0, intensity: value });
        }}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.outlineVariant}
        thumbTintColor={colors.primary}
      />
      <View style={s.spread}>
        <Text variant="labelSmall">0% · apagada</Text>
        <Text variant="labelSmall">100% · máxima</Text>
      </View>
      {draft !== null && (
        <Text variant="bodySmall">
          Ajuste em edição: {draft}%. Solte para enviar.
        </Text>
      )}
      <View style={s.chips}>
        {[0, 25, 50, 100].map((value) => (
          <Button
            key={value}
            compact
            mode={
              sim.device.intensity === value ? "contained-tonal" : "outlined"
            }
            disabled={!ready || !control("light")}
            accessibilityLabel={`Luz em ${value}%`}
            onPress={() =>
              send({ kind: "light", on: value > 0, intensity: value })
            }
          >
            {value ? `${value}%` : "Apagar"}
          </Button>
        ))}
      </View>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        Ao religar, restaura a última intensidade positiva.
      </Text>
      {room.endpoint !== "https://servico.exemplo" && (
        <Button
          disabled={!ready || !control("light")}
          onPress={() => sim.setAutomatic()}
          icon="brightness-auto"
        >
          Usar luz automática pelo LDR
        </Button>
      )}
    </Panel>
  ) : (
    <Note
      title="Iluminação restrita"
      text="Seu perfil não possui acesso a este grupo."
    />
  );
  const sensors = read("sensors") ? (
    <View style={s.column}>
      <View style={s.row}>
        <Icon source="access-point" size={22} color={colors.primary} />
        <Text variant="titleMedium" style={s.bold}>
          Telemetria de sensores
        </Text>
      </View>
      <View style={[s.metrics, !wide && s.wrap]}>
        <Metric
          title="Temperatura"
          value={`${sim.device.temperature.toFixed(1).replace(".", ",")} °C`}
          icon="thermometer"
          detail={detail}
        />
        <Metric
          title="Umidade"
          value={`${sim.device.humidity}%`}
          icon="water-percent"
          detail={detail}
        />
      </View>
      <Panel
        title="Sensor de gás"
        icon="molecule"
        subtitle="Estado demonstrativo · sem concentração em ppm"
      >
        <Note
          title={
            outdated
              ? `Último estado: ${gasStatusLabels[sim.device.gas]}`
              : gasStatusLabels[sim.device.gas]
          }
          warning={outdated || sim.device.gas !== "clear"}
          text={
            outdated
              ? "Sem leitura atual. O último estado é preservado."
              : sim.device.gas === "unavailable"
                ? "Ausência de leitura não significa ausência de gás."
                : sim.device.gas === "detected"
                  ? "Possível presença de gás ou fumaça. Tipo de gás não identificado."
                  : "Sem detecção no cenário simulado. Não representa medição física."
          }
        />
        {sim.device.gas === "detected" && (
          <Button mode="outlined" icon="alert-outline" onPress={onGas}>
            Ver alerta de gás
          </Button>
        )}
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          Alerta ambiental independente da triagem do paciente.
        </Text>
      </Panel>
    </View>
  ) : (
    <Note
      title="Sensores restritos"
      text="Seu perfil não possui acesso às leituras."
    />
  );
  const triage = read("indicator") ? (
    <Panel
      title="Triagem Manchester"
      icon="medical-bag"
      subtitle="Indicador externo · seleção manual"
    >
      <View
        style={[
          s.triageState,
          {
            borderLeftColor: indicatorColors[sim.device.indicator],
            backgroundColor: colors.surfaceVariant,
          },
        ]}
      >
        <View style={s.row}>
          <View
            style={[
              s.indicatorDot,
              { backgroundColor: indicatorColors[sim.device.indicator] },
            ]}
          />
          <Text variant="titleMedium" style={[s.bold, s.flex]}>
            {colorNames[sim.device.indicator]}
          </Text>
        </View>
        <Text variant="bodySmall">
          {indicatorPriorities[sim.device.indicator]}
        </Text>
      </View>
      <View style={s.triageOptions}>
        {(["red", "orange", "yellow", "green", "blue"] as IndicatorColor[]).map(
          (color) => (
            <Button
              key={color}
              mode={
                sim.device.indicator === color ? "contained-tonal" : "outlined"
              }
              disabled={!ready || !control("indicator")}
              style={{ borderColor: indicatorColors[color] }}
              contentStyle={s.triageButton}
              accessibilityLabel={`Indicador ${colorNames[color]}`}
              icon={() => (
                <View
                  style={[
                    s.priorityDot,
                    { backgroundColor: indicatorColors[color] },
                  ]}
                />
              )}
              onPress={() => send({ kind: "indicator", color })}
            >
              {colorNames[color]} · {indicatorPriorities[color]}
            </Button>
          ),
        )}
      </View>
      <Button
        mode="outlined"
        icon="power"
        disabled={!ready || !control("indicator")}
        onPress={() => send({ kind: "indicator", color: "off" })}
      >
        Desligar indicador
      </Button>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        A cor muda após confirmação simulada. O aplicativo não realiza
        classificação clínica.
      </Text>
    </Panel>
  ) : (
    <Note
      title="Indicador restrito"
      text="Este grupo não foi liberado para seu perfil."
    />
  );
  return (
    <View style={s.column}>
      {outdated && (
        <Note
          warning
          title={
            sim.connection === "stale" && room.active
              ? "Leitura desatualizada"
              : "Sem comunicação"
          }
          text="Controles bloqueados. Último estado confirmado preservado."
        />
      )}
      {showAll && !wide ? (
        <>
          {light}
          {sensors}
          {triage}
          <Panel
            title="Planta esquemática"
            icon="floor-plan"
            subtitle="Visualização ilustrativa do quarto"
          >
            <Blueprint
              intensity={read("light") ? sim.device.intensity : null}
              indicator={read("indicator") ? sim.device.indicator : null}
            />
          </Panel>
        </>
      ) : showAll ? (
        <>
          <View style={[s.grid, !wide && s.stack]}>
            <View style={[s.column, wide && { flex: 1.35 }]}>
              <Panel
                title="Planta esquemática"
                icon="floor-plan"
                subtitle="Visualização ilustrativa do quarto"
              >
                <Blueprint
                  intensity={read("light") ? sim.device.intensity : null}
                  indicator={read("indicator") ? sim.device.indicator : null}
                />
              </Panel>
              {sensors}
            </View>
            <View style={s.column}>
              {light}
              {triage}
            </View>
          </View>
        </>
      ) : screen === "Iluminação" ? (
        light
      ) : screen === "Sensores" ? (
        sensors
      ) : (
        triage
      )}
      {(read("light") || read("indicator")) && (
        <Note
          title={
            sim.pending ? "Aguardando confirmação…" : "Retorno da simulação"
          }
          text={sim.notice}
          warning={outdated}
        />
      )}
      {sim.pending && <ProgressBar indeterminate />}
    </View>
  );
}

function DemoApp({
  isolated,
  dark,
  setDark,
  reduced,
  setReduceMotion,
}: {
  isolated: boolean;
  dark: boolean;
  setDark: (value: boolean) => void;
  reduced: boolean;
  setReduceMotion: (value: boolean) => void;
}) {
  const { colors } = useTheme(),
    { width, height } = useWindowDimensions();
  const desktop = width >= 1100,
    wide = width >= 760;
  const [users, setUsers] = useState(initialUsers),
    [rooms, setRooms] = useState(() =>
      initialRooms().map((value) =>
        isolated ? { ...value, endpoint: "https://servico.exemplo" } : value,
      ),
    );
  const [session, setSession] = useState<string | null>(null),
    [roomId, setRoomId] = useState("quarto-01");
  const room = rooms.find((value) => value.id === roomId) ?? rooms[0];
  const sim = useSimulator(
    room.id,
    isolated ? "https://servico.exemplo" : room.endpoint,
  );
  const [screen, setScreen] = useState<Screen>("Quartos"),
    [snack, setSnack] = useState("");
  const [editingUser, setEditingUser] = useState("matheus"),
    [gasClosed, setGasClosed] = useState(false);
  const [query, setQuery] = useState(""),
    [roomFilter, setRoomFilter] = useState("all"),
    [logQuery, setLogQuery] = useState(""),
    [logFilter, setLogFilter] = useState("all");
  const [dialog, setDialog] = useState<"user" | "disable" | null>(null),
    [name, setName] = useState(""),
    [email, setEmail] = useState("");
  const [formError, setFormError] = useState(""),
    [roomDraft, setRoomDraft] = useState(room);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "passed" | "failed"
  >("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    testGeneration = useRef(0),
    sequence = useRef(0);
  const scroll = useRef<ScrollView>(null);
  const user = users.find((value) => value.id === session) ?? null;
  const selected = users.find((value) => value.id === editingUser) ?? users[0];
  const read = (group: Group) => canAccess(user, room.id, group, "read"),
    control = (group: Group) => canAccess(user, room.id, group, "control");
  const visibleRooms = rooms.filter((value) => roomVisible(user, value));
  const age = Math.max(0, Math.floor((sim.now - sim.device.receivedAt) / 1000));
  const connected = room.active && sim.connection === "online";
  const status = !room.active
    ? "Desativada"
    : sim.connection === "online"
      ? room.endpoint === "https://servico.exemplo"
        ? "Online simulado"
        : "Node-RED · simulado"
      : sim.connection === "stale"
        ? "Dado antigo"
        : "Sem comunicação";
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function cancelTest() {
    testGeneration.current++;
    if (timer.current) clearTimeout(timer.current);
    setTestStatus("idle");
  }
  function navigate(next: Screen) {
    if (
      ["Painel", "Iluminação", "Sensores", "Manchester", "Histórico"].includes(
        next,
      ) &&
      !roomVisible(user, room)
    ) {
      setSnack("Seu perfil ainda não tem acesso a um ambiente.");
      setScreen("Quartos");
      return;
    }
    if (["Usuários", "Conexões", "Cadastro"].includes(next) && !user?.admin)
      return;
    cancelTest();
    setFormError("");
    setScreen(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  function changeSession(id: string | null) {
    sim.cancelPending();
    cancelTest();
    setGasClosed(false);
    setDialog(null);
    setSession(id);
    setScreen("Quartos");
    setQuery("");
    const next = users.find((value) => value.id === id),
      first = rooms.find((value) => roomVisible(next ?? null, value));
    if (first) setRoomId(first.id);
  }
  function openRoom(id: string) {
    const next = rooms.find((value) => value.id === id);
    if (!next || !roomVisible(user, next)) return;
    sim.cancelPending();
    setRoomId(id);
    setGasClosed(false);
    navigate("Painel");
  }
  function send(command: Command) {
    if (!control(command.kind === "light" ? "light" : "indicator")) {
      setSnack("Seu perfil não permite este comando.");
      return;
    }
    if (connected && !sim.pending) sim.send(command, user?.name);
  }
  function openEditor(value?: RoomDefinition) {
    if (!user?.admin) return;
    setRoomDraft(
      value ?? {
        id: `quarto-demo-${++sequence.current}`,
        name: "",
        bed: "",
        wing: "",
        device: "",
        endpoint: "https://servico.exemplo",
        active: true,
      },
    );
    navigate("Cadastro");
  }
  function editDraft(key: keyof RoomDefinition, value: string) {
    cancelTest();
    setFormError("");
    setRoomDraft((previous) => ({ ...previous, [key]: value }));
  }
  async function testConnection() {
    if (!user?.admin) return;
    const error = roomError(roomDraft, rooms);
    if (error) {
      setFormError(error);
      return;
    }
    cancelTest();
    setTestStatus("testing");
    const revision = testGeneration.current;
    let passes = false;
    try {
      if (isolated || roomDraft.endpoint === "https://servico.exemplo")
        passes =
          roomDraft.active &&
          (roomDraft.id !== room.id || sim.connection === "online");
      else {
        const result = await requestNodeRed(
          roomDraft.endpoint,
          roomDraft.id,
          "telemetry",
        );
        decodeTelemetry(result, roomDraft.id);
        passes = roomDraft.active && result.sampleAgeMs < 10000;
      }
    } catch {
      passes = false;
    }
    if (testGeneration.current === revision)
      setTestStatus(passes ? "passed" : "failed");
  }
  function saveRoom() {
    if (!user?.admin) return;
    const error = roomError(roomDraft, rooms);
    if (error) {
      setFormError(error);
      return;
    }
    const saved = Object.fromEntries(
      Object.entries(roomDraft).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    ) as RoomDefinition;
    if (isolated) saved.endpoint = "https://servico.exemplo";
    const exists = rooms.some((value) => value.id === saved.id);
    sim.cancelPending();
    setRooms((previous) =>
      exists
        ? previous.map((value) => (value.id === saved.id ? saved : value))
        : [...previous, saved],
    );
    if (!exists)
      setUsers((previous) =>
        previous.map((value) =>
          value.id === user.id
            ? {
                ...value,
                grants: {
                  ...value.grants,
                  [saved.id]: {
                    light: "control",
                    sensors: "read",
                    indicator: "control",
                    history: "read",
                  },
                },
              }
            : value,
        ),
      );
    setRoomId(saved.id);
    setGasClosed(false);
    navigate("Quartos");
    setSnack("Ambiente salvo nesta sessão. Nenhum equipamento foi conectado.");
  }
  function setLevel(group: Group, level: Level) {
    if (
      !user?.admin ||
      ((group === "sensors" || group === "history") && level === "control")
    )
      return;
    sim.cancelPending();
    setUsers((previous) =>
      previous.map((value) =>
        value.id === selected.id
          ? {
              ...value,
              grants: {
                ...value.grants,
                [room.id]: {
                  ...(value.grants[room.id] ?? emptyGrants()),
                  [group]: level,
                },
              },
            }
          : value,
      ),
    );
    setSnack(
      `${selected.name}: ${groupLabels[group]} → ${levelLabels[level]}.`,
    );
  }
  function addUser() {
    if (!user?.admin) return;
    const address = email.trim().toLowerCase();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setFormError("Informe nome e e-mail válido.");
      return;
    }
    if (users.some((value) => value.email.toLowerCase() === address)) {
      setFormError("Já existe um perfil com esse e-mail.");
      return;
    }
    const id = `demo-${++sequence.current}`;
    setUsers((previous) => [
      ...previous,
      {
        id,
        name: name.trim(),
        email: address,
        admin: false,
        grants: { [room.id]: emptyGrants() },
      },
    ]);
    setEditingUser(id);
    setDialog(null);
    setSnack("Perfil fictício criado sem acesso. Nenhum convite foi enviado.");
  }
  const themeControl = (
    <IconButton
      icon={dark ? "weather-sunny" : "weather-night"}
      accessibilityLabel={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      onPress={() => setDark(!dark)}
    />
  );
  const nav = (item: Screen) => (
    <Button
      key={item}
      mode={screen === item ? "contained" : "text"}
      icon={navIcons[item]}
      onPress={() => navigate(item)}
      accessibilityLabel={`Abrir ${item}`}
      contentStyle={s.navContent}
      style={s.navButton}
      textColor={screen === item ? colors.onPrimary : colors.onSurfaceVariant}
    >
      {navLabels[item] ?? item}
    </Button>
  );
  const titles: Record<Screen, string> = {
    Quartos: "Leitos e quartos conectados",
    Painel: room.name,
    Iluminação: "Controle de iluminação",
    Sensores: "Sensores e gás",
    Manchester: "Triagem Manchester",
    Histórico: "Histórico do ambiente",
    Conta: "Minha conta",
    Conexões: "Conexões e dispositivos",
    Usuários: "Usuários e permissões",
    Cadastro: rooms.some((value) => value.id === roomDraft.id)
      ? "Editar ambiente"
      : "Cadastrar ambiente",
  };
  const filteredRooms = visibleRooms.filter(
    (value) =>
      `${value.name} ${value.bed} ${value.wing} ${value.device}`
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")) &&
      (roomFilter === "all" ||
        (roomFilter === "active" ? value.active : !value.active)),
  );
  const filteredLogs = sim.logs.filter(
    (value) =>
      value.message
        .toLocaleLowerCase("pt-BR")
        .includes(logQuery.toLocaleLowerCase("pt-BR")) &&
      (logFilter === "all" || value.type === logFilter),
  );
  const roomSelector = (
    <View style={s.chips}>
      {visibleRooms.map((value) => (
        <Chip
          key={value.id}
          selected={value.id === room.id}
          onPress={() => {
            sim.cancelPending();
            setRoomId(value.id);
            setGasClosed(false);
            cancelTest();
          }}
          accessibilityLabel={`Selecionar ambiente ${value.name}`}
        >
          {value.bed} · {value.name}
        </Chip>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.background }]}>
      <StatusBar style={dark ? "light" : "dark"} />
      {!user ? (
        <ScrollView contentContainerStyle={s.loginScroll}>
          <View style={[s.loginPage, wide && s.grid]}>
            <View style={s.column}>
              <View style={s.spread}>
                <Brand />
                {themeControl}
              </View>
              <Text
                variant={wide ? "displaySmall" : "headlineLarge"}
                style={s.bold}
              >
                Seu ambiente, ao seu alcance.
              </Text>
              <Text
                variant="bodyLarge"
                style={{ color: colors.onSurfaceVariant }}
              >
                Controle da iluminação, acompanhamento de sensores e indicador
                externo em uma interface.
              </Text>
              <Blueprint intensity={65} indicator="blue" />
              <Note
                title="Modo de demonstração"
                text="Dados e comandos simulados. Nenhum equipamento físico conectado."
              />
            </View>
            <View style={s.column}>
              <Panel
                title="Escolha um perfil"
                icon="account-circle-outline"
                subtitle="Perfis fictícios · sem autenticação real"
              >
                {users.map((profile) => (
                  <View
                    key={profile.id}
                    style={[s.profile, { borderColor: colors.outlineVariant }]}
                  >
                    <View style={s.row}>
                      <Avatar.Text size={38} label={profile.name.slice(0, 1)} />
                      <View style={s.flex}>
                        <Text variant="titleMedium" style={s.bold}>
                          {profile.name}
                        </Text>
                        <Text variant="bodySmall">
                          {profile.admin
                            ? "Administrador"
                            : "Usuário com permissões específicas"}
                        </Text>
                      </View>
                    </View>
                    <Button
                      mode={profile.admin ? "contained" : "outlined"}
                      accessibilityLabel={`Entrar como ${profile.name}`}
                      onPress={() => changeSession(profile.id)}
                    >
                      Entrar como {profile.name}
                    </Button>
                  </View>
                ))}
                <Text
                  variant="bodySmall"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Recarregar reinicia o cadastro local. O estado do Node-RED
                  permanece enquanto ele estiver rodando.
                </Text>
              </Panel>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={s.shell}>
          {desktop && (
            <View
              style={[
                s.sidebar,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderRightColor: colors.outlineVariant,
                },
              ]}
            >
              <Brand />
              <Text
                variant="labelSmall"
                style={[s.sectionLabel, { color: colors.onSurfaceVariant }]}
              >
                AMBIENTES
              </Text>
              {nav("Quartos")}
              <Text
                variant="labelSmall"
                style={[s.sectionLabel, { color: colors.onSurfaceVariant }]}
              >
                QUARTO SELECIONADO
              </Text>
              {(
                [
                  "Painel",
                  "Iluminação",
                  "Sensores",
                  "Manchester",
                  "Histórico",
                ] as Screen[]
              ).map(nav)}
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
              <View style={s.sidebarFooter}>
                {nav("Conta")}
                <View style={s.row}>
                  <Avatar.Text size={32} label={user.name.slice(0, 1)} />
                  <View style={s.flex}>
                    <Text variant="titleSmall">{user.name}</Text>
                    <Text variant="bodySmall">
                      {user.admin ? "Administrador" : "Usuário"} · demonstração
                    </Text>
                  </View>
                </View>
                <Button
                  icon="logout"
                  mode="text"
                  onPress={() => changeSession(null)}
                >
                  Trocar perfil
                </Button>
              </View>
            </View>
          )}
          <View style={s.flex}>
            <View
              style={[
                s.topbar,
                !wide && { paddingHorizontal: 16 },
                {
                  backgroundColor: colors.surfaceVariant,
                  borderBottomColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={s.flex}>
                {desktop ? (
                  <Text variant="titleSmall" numberOfLines={2}>
                    {room.name}
                  </Text>
                ) : (
                  <Brand width={Math.min(150, width * 0.35)} />
                )}
              </View>
              <Chip
                compact
                icon="flask-outline"
                style={{ backgroundColor: colors.primaryContainer }}
                textStyle={{ fontSize: 11 }}
              >
                Simulação
              </Chip>
              {themeControl}
            </View>
            <ScrollView
              ref={scroll}
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={[s.pageScroll, !wide && s.mobileScroll]}
            >
              <View style={s.page}>
                <View style={[s.spread, !wide && s.titleStack]}>
                  <View style={s.flex}>
                    <Text
                      variant="labelSmall"
                      style={{ color: colors.primary }}
                    >
                      SAMAHI / {screen.toUpperCase()}
                    </Text>
                    <Text
                      variant={wide ? "headlineMedium" : "headlineSmall"}
                      style={s.bold}
                    >
                      {titles[screen]}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: colors.onSurfaceVariant }}
                    >
                      {["Quartos", "Cadastro"].includes(screen)
                        ? "Ambientes demonstrativos · dados mantidos nesta sessão"
                        : `${room.wing} · ${room.bed}`}
                    </Text>
                  </View>
                  {screen !== "Quartos" && (
                    <Chip
                      compact
                      icon={connected ? "access-point" : "access-point-off"}
                    >
                      {status}
                    </Chip>
                  )}
                </View>
                {!desktop &&
                  [
                    "Iluminação",
                    "Sensores",
                    "Manchester",
                    "Usuários",
                    "Conexões",
                    "Cadastro",
                  ].includes(screen) && (
                    <Button
                      icon="arrow-left"
                      mode="text"
                      style={s.back}
                      onPress={() =>
                        navigate(
                          ["Usuários", "Conexões"].includes(screen)
                            ? "Conta"
                            : screen === "Cadastro"
                              ? "Quartos"
                              : "Painel",
                        )
                      }
                    >
                      Voltar
                    </Button>
                  )}
                {read("sensors") &&
                  sim.device.gas === "detected" &&
                  (!sim.device.gasAcknowledged || !gasClosed) && (
                    <GasAlarm
                      room={room.name}
                      acknowledged={sim.device.gasAcknowledged}
                      stale={!connected}
                      reduced={reduced}
                      onAcknowledge={() => sim.acknowledgeGasAlert(user.name)}
                      onClose={() => setGasClosed(true)}
                    />
                  )}
                {read("sensors") &&
                  sim.device.gas === "detected" &&
                  gasClosed && (
                    <Note
                      warning
                      title="Alerta de gás reconhecido"
                      text="A detecção continua ativa no quarto selecionado."
                    />
                  )}
                {screen === "Quartos" && (
                  <>
                    <View style={s.metrics}>
                      <Metric
                        title="Ambientes visíveis"
                        value={String(visibleRooms.length)}
                        icon="bed-outline"
                        detail="Conforme seu perfil"
                      />
                      <Metric
                        title="Habilitados"
                        value={String(
                          visibleRooms.filter((value) => value.active).length,
                        )}
                        icon="lan-connect"
                        detail="Cadastro da simulação"
                      />
                    </View>
                    <View style={[s.grid, !wide && s.stack]}>
                      <TextInput
                        mode="outlined"
                        style={s.flex}
                        label="Buscar quarto, leito ou dispositivo"
                        accessibilityLabel="Buscar quarto, leito ou dispositivo"
                        value={query}
                        onChangeText={setQuery}
                        left={<TextInput.Icon icon="magnify" />}
                      />
                      {user.admin && (
                        <Button
                          mode="contained"
                          icon="plus"
                          onPress={() => openEditor()}
                        >
                          Novo ambiente
                        </Button>
                      )}
                    </View>
                    <View style={s.chips}>
                      {[
                        ["all", "Todos"],
                        ["active", "Habilitados"],
                        ["disabled", "Desativados"],
                      ].map(([value, label]) => (
                        <Chip
                          key={value}
                          selected={roomFilter === value}
                          onPress={() => setRoomFilter(value)}
                        >
                          {label}
                        </Chip>
                      ))}
                    </View>
                    {filteredRooms.length === 0 ? (
                      <Note
                        title="Nenhum ambiente encontrado"
                        text={
                          visibleRooms.length === 0
                            ? "O administrador precisa conceder acesso a um ambiente."
                            : "Altere a busca ou o filtro."
                        }
                      />
                    ) : (
                      <View style={s.roomCards}>
                        {filteredRooms.map((value) => (
                          <View
                            key={value.id}
                            style={[s.roomCardWidth, wide && { width: "48%" }]}
                          >
                            <Panel
                              title={value.name}
                              icon="bed-outline"
                              subtitle={`${value.wing} · ${value.bed}`}
                            >
                              <View style={s.chips}>
                                <Chip compact icon="chip">
                                  {value.device}
                                </Chip>
                                <Chip compact>
                                  {value.active ? "Habilitado" : "Desativado"}
                                </Chip>
                              </View>
                              <Text
                                variant="bodySmall"
                                style={{ color: colors.onSurfaceVariant }}
                              >
                                Ambiente de demonstração. Nenhum ESP32 físico
                                conectado.
                              </Text>
                              <Button
                                mode="contained"
                                icon="arrow-right"
                                contentStyle={{ flexDirection: "row-reverse" }}
                                onPress={() => openRoom(value.id)}
                                accessibilityLabel={`Acessar ${value.name}`}
                              >
                                Acessar painel
                              </Button>
                              {user.admin && (
                                <Button
                                  mode="text"
                                  icon="pencil-outline"
                                  onPress={() => openEditor(value)}
                                >
                                  Editar ambiente
                                </Button>
                              )}
                            </Panel>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )}
                {["Painel", "Iluminação", "Sensores", "Manchester"].includes(
                  screen,
                ) && (
                  <>
                    {!desktop && screen === "Painel" && (
                      <View style={s.chips}>
                        {(
                          ["Iluminação", "Sensores", "Manchester"] as Screen[]
                        ).map((item) => (
                          <Chip
                            key={item}
                            icon={navIcons[item]}
                            onPress={() => navigate(item)}
                          >
                            {navLabels[item] ?? item}
                          </Chip>
                        ))}
                      </View>
                    )}
                    <Dashboard
                      key={`${room.id}-${user.id}`}
                      sim={sim}
                      room={room}
                      read={read}
                      control={control}
                      send={send}
                      screen={screen}
                      wide={wide}
                      onGas={() => setGasClosed(false)}
                    />
                    <Text
                      variant="bodySmall"
                      style={{ color: colors.onSurfaceVariant }}
                    >
                      Última leitura há {age} s · {room.device} · dados
                      simulados{" "}
                      {room.endpoint !== "https://servico.exemplo"
                        ? "via Node-RED"
                        : "no app"}
                    </Text>
                  </>
                )}
                {screen === "Histórico" &&
                  (read("history") ? (
                    <>
                      <View style={s.metrics}>
                        <Metric
                          title="Eventos na sessão"
                          value={String(sim.logs.length)}
                          icon="history"
                          detail="Até 30 registros por ambiente"
                        />
                        <Metric
                          title="Falhas / alertas"
                          value={String(
                            sim.logs.filter((value) => value.type === "error")
                              .length,
                          )}
                          icon="alert-circle-outline"
                          detail="Eventos classificados como erro"
                        />
                      </View>
                      <TextInput
                        mode="outlined"
                        label="Buscar ação ou usuário"
                        accessibilityLabel="Buscar ação ou usuário"
                        value={logQuery}
                        onChangeText={setLogQuery}
                        left={<TextInput.Icon icon="magnify" />}
                      />
                      <View style={s.chips}>
                        {[
                          ["all", "Todos"],
                          ["info", "Informações"],
                          ["success", "Confirmações"],
                          ["error", "Falhas / alertas"],
                        ].map(([value, label]) => (
                          <Chip
                            key={value}
                            selected={logFilter === value}
                            onPress={() => setLogFilter(value)}
                          >
                            {label}
                          </Chip>
                        ))}
                      </View>
                      <Panel
                        title="Linha do tempo"
                        icon="timeline-clock-outline"
                        subtitle="Eventos locais deste ambiente · sem auditoria persistente"
                      >
                        {filteredLogs.length === 0 ? (
                          <Note
                            title="Nenhum evento encontrado"
                            text={
                              sim.logs.length
                                ? "Altere a busca ou o filtro."
                                : "Utilize os controles para registrar ações nesta sessão."
                            }
                          />
                        ) : (
                          filteredLogs.map((value) => (
                            <View
                              key={value.id}
                              style={[
                                s.event,
                                { borderBottomColor: colors.outlineVariant },
                              ]}
                            >
                              <Avatar.Icon
                                size={32}
                                icon={
                                  value.type === "error"
                                    ? "alert-outline"
                                    : value.type === "success"
                                      ? "check"
                                      : "clock-outline"
                                }
                              />
                              <View style={s.flex}>
                                <Text
                                  variant="labelSmall"
                                  style={{ color: colors.onSurfaceVariant }}
                                >
                                  {value.time} ·{" "}
                                  {value.type === "error"
                                    ? "Falha / alerta"
                                    : value.type === "success"
                                      ? "Confirmação simulada"
                                      : "Informação"}
                                </Text>
                                <Text variant="bodyMedium">
                                  {value.message}
                                </Text>
                              </View>
                            </View>
                          ))
                        )}
                      </Panel>
                    </>
                  ) : (
                    <Note
                      title="Histórico restrito"
                      text="Seu perfil não possui acesso a este grupo."
                    />
                  ))}
                {screen === "Conta" && (
                  <View style={[s.grid, !wide && s.stack]}>
                    <View style={s.column}>
                      <Panel
                        title="Perfil de demonstração"
                        icon="account-circle-outline"
                      >
                        <View style={s.row}>
                          <Avatar.Text
                            size={48}
                            label={user.name.slice(0, 1)}
                          />
                          <View style={s.flex}>
                            <Text variant="titleLarge" style={s.bold}>
                              {user.name}
                            </Text>
                            <Text variant="bodySmall">{user.email}</Text>
                            <Text variant="bodySmall">
                              {user.admin ? "Administrador" : "Usuário"} · conta
                              fictícia
                            </Text>
                          </View>
                        </View>
                        {groups.map((group) => (
                          <View key={group} style={s.spread}>
                            <Text variant="bodyMedium" style={s.flex}>
                              {groupLabels[group]}
                            </Text>
                            <Chip compact>
                              {
                                levelLabels[
                                  user.grants[room.id]?.[group] ?? "none"
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
                      <Panel
                        title="Aparência e acessibilidade"
                        icon="palette-outline"
                      >
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
                          <Text style={s.flex}>Reduzir animações</Text>
                          <Switch
                            value={reduced}
                            onValueChange={setReduceMotion}
                            accessibilityLabel="Reduzir animações"
                          />
                        </View>
                      </Panel>
                    </View>
                    <View style={s.column}>
                      <Panel
                        title="Laboratório de simulação"
                        icon="flask-outline"
                        subtitle={`${room.name} · controles de teste`}
                      >
                        <View style={s.chips}>
                          {scenarios.map(([value, label]) => (
                            <Chip
                              key={value}
                              selected={sim.scenario === value}
                              disabled={!user.admin}
                              accessibilityLabel={`Cenário ${label}`}
                              onPress={() => {
                                cancelTest();
                                sim.selectScenario(value);
                              }}
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
                              ).map((value) => (
                                <Chip
                                  key={value}
                                  selected={sim.device.gas === value}
                                  disabled={!connected}
                                  accessibilityLabel={`Simular gás: ${gasStatusLabels[value]}`}
                                  onPress={() => sim.simulateGas(value)}
                                >
                                  {gasStatusLabels[value]}
                                </Chip>
                              ))}
                            </View>
                          </>
                        )}
                        <Note
                          title="Retorno da simulação"
                          text={
                            read("light") ||
                            read("indicator") ||
                            read("sensors")
                              ? sim.notice
                              : "Sem acesso às funções deste ambiente."
                          }
                        />
                        <Button
                          mode="outlined"
                          disabled={!user.admin}
                          onPress={() => {
                            cancelTest();
                            sim.reset();
                            setRooms((previous) =>
                              previous.map((value) =>
                                value.id === room.id
                                  ? { ...value, active: true }
                                  : value,
                              ),
                            );
                            setGasClosed(false);
                            setSnack("Simulação do ambiente reiniciada.");
                          }}
                        >
                          Reiniciar simulação
                        </Button>
                      </Panel>
                    </View>
                  </View>
                )}
                {screen === "Conexões" && user.admin && (
                  <>
                    {roomSelector}
                    <Note
                      title="Configuração de demonstração"
                      text="Endereços são configurações locais. O teste simulado não realiza requisição de rede."
                    />
                    <Panel
                      title={room.name}
                      icon="chip"
                      subtitle={`${room.bed} · ${room.wing}`}
                    >
                      <Text selectable>{room.device}</Text>
                      <Text selectable>{room.endpoint}</Text>
                      <Chip style={s.back}>{status}</Chip>
                      <View style={s.chips}>
                        <Button
                          mode="contained"
                          icon="pencil-outline"
                          onPress={() => openEditor(room)}
                        >
                          Editar e testar
                        </Button>
                        <Button
                          mode="outlined"
                          icon="power"
                          onPress={() => {
                            if (room.active) setDialog("disable");
                            else {
                              setRooms((previous) =>
                                previous.map((value) =>
                                  value.id === room.id
                                    ? { ...value, active: true }
                                    : value,
                                ),
                              );
                              sim.selectScenario("normal");
                            }
                          }}
                        >
                          {room.active
                            ? "Desativar conexão"
                            : "Reativar conexão"}
                        </Button>
                      </View>
                    </Panel>
                  </>
                )}
                {screen === "Cadastro" && user.admin && (
                  <>
                    <Note
                      title="Cadastro local de ambiente"
                      text="Dados demonstrativos. Salvar não conecta hardware nem cria registros em um servidor."
                    />
                    <View style={[s.grid, !wide && s.stack]}>
                      <View style={s.column}>
                        <Panel
                          title="Identificação do ambiente"
                          icon="bed-outline"
                        >
                          {(
                            [
                              ["name", "Nome do quarto"],
                              ["bed", "Código do leito"],
                              ["wing", "Ala / localização"],
                            ] as [keyof RoomDefinition, string][]
                          ).map(([key, label]) => (
                            <TextInput
                              key={key}
                              mode="outlined"
                              label={label}
                              accessibilityLabel={label}
                              value={String(roomDraft[key])}
                              onChangeText={(value) => editDraft(key, value)}
                            />
                          ))}
                        </Panel>
                        <Panel title="Conexão do dispositivo" icon="chip">
                          <TextInput
                            mode="outlined"
                            label="Identificador do dispositivo"
                            accessibilityLabel="Identificador do dispositivo"
                            value={roomDraft.device}
                            autoCapitalize="none"
                            onChangeText={(value) => editDraft("device", value)}
                          />
                          <TextInput
                            mode="outlined"
                            label="Endereço do serviço (http/https)"
                            accessibilityLabel="Endereço do serviço (http/https)"
                            value={roomDraft.endpoint}
                            autoCapitalize="none"
                            onChangeText={(value) =>
                              editDraft("endpoint", value)
                            }
                          />
                          <Button
                            mode="outlined"
                            icon="lan-connect"
                            loading={testStatus === "testing"}
                            disabled={testStatus === "testing"}
                            onPress={testConnection}
                          >
                            Testar conexão
                          </Button>
                          {testStatus === "passed" && (
                            <Note
                              title="Teste concluído"
                              text={
                                roomDraft.endpoint === "https://servico.exemplo"
                                  ? "Simulação interna; nenhuma requisição de rede."
                                  : "API respondeu com dados válidos e recentes do ambiente. Equipamento ainda simulado."
                              }
                            />
                          )}
                          {testStatus === "failed" && (
                            <Note
                              warning
                              title="Teste simulado falhou"
                              text="Reative o ambiente e restaure o cenário Normal para tentar novamente."
                            />
                          )}
                        </Panel>
                      </View>
                      <View style={s.column}>
                        <Panel
                          title="Funções do protótipo"
                          icon="view-grid-outline"
                        >
                          <Text>
                            Iluminação com intensidade, temperatura, umidade,
                            estado do gás e indicador Manchester.
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={{ color: colors.onSurfaceVariant }}
                          >
                            Novo ambiente começa com estado simulado. O criador
                            recebe acesso; outras pessoas precisam de concessão
                            explícita.
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={{ color: colors.onSurfaceVariant }}
                          >
                            Limiares, modelo do sensor e protocolo físico serão
                            definidos na integração com o hardware.
                          </Text>
                        </Panel>
                        <Panel
                          title="Salvar ambiente"
                          icon="content-save-outline"
                        >
                          {!!formError && (
                            <HelperText type="error">{formError}</HelperText>
                          )}
                          <Button mode="contained" onPress={saveRoom}>
                            Salvar ambiente
                          </Button>
                          <Button
                            mode="outlined"
                            onPress={() => navigate("Quartos")}
                          >
                            Cancelar
                          </Button>
                        </Panel>
                      </View>
                    </View>
                  </>
                )}
                {screen === "Usuários" && user.admin && (
                  <>
                    {roomSelector}
                    <Note
                      title="Permissões por ambiente"
                      text="Alterações são aplicadas imediatamente nesta simulação. Sem concessão explícita, sem acesso."
                    />
                    <View style={[s.grid, !wide && s.stack]}>
                      <View style={s.column}>
                        <Panel
                          title="Pessoas da demonstração"
                          icon="account-group-outline"
                        >
                          {users.map((value) => (
                            <Button
                              key={value.id}
                              mode={
                                selected.id === value.id
                                  ? "contained-tonal"
                                  : "outlined"
                              }
                              icon="account-outline"
                              onPress={() => setEditingUser(value.id)}
                            >
                              {value.name} ·{" "}
                              {value.admin ? "Administrador" : "Usuário"}
                            </Button>
                          ))}
                          <Button
                            mode="contained"
                            icon="account-plus-outline"
                            onPress={() => {
                              setName("");
                              setEmail("");
                              setFormError("");
                              setDialog("user");
                            }}
                          >
                            Criar perfil fictício
                          </Button>
                        </Panel>
                      </View>
                      <View style={[s.column, wide && { flex: 1.5 }]}>
                        <Panel
                          title={`Acessos de ${selected.name}`}
                          icon="shield-account-outline"
                          subtitle={room.name}
                        >
                          {groups.map((group) => (
                            <View
                              key={group}
                              style={[
                                s.accessRow,
                                { borderBottomColor: colors.outlineVariant },
                              ]}
                            >
                              <Text variant="titleSmall">
                                {groupLabels[group]}
                              </Text>
                              <SegmentedButtons
                                value={
                                  selected.grants[room.id]?.[group] ?? "none"
                                }
                                onValueChange={(value) =>
                                  setLevel(group, value as Level)
                                }
                                buttons={(
                                  [
                                    "none",
                                    "read",
                                    ...(group === "light" ||
                                    group === "indicator"
                                      ? ["control"]
                                      : []),
                                  ] as Level[]
                                ).map((value) => ({
                                  value,
                                  label:
                                    !wide && value === "none"
                                      ? "Sem acesso"
                                      : levelLabels[value],
                                }))}
                              />
                            </View>
                          ))}
                          <Text
                            variant="bodySmall"
                            style={{ color: colors.onSurfaceVariant }}
                          >
                            Sensores e histórico são somente leitura. Perfis
                            locais não substituem autenticação e autorização no
                            servidor.
                          </Text>
                        </Panel>
                      </View>
                    </View>
                  </>
                )}
                <Text
                  variant="labelSmall"
                  style={[s.footer, { color: colors.onSurfaceVariant }]}
                >
                  SAMAHI · Prévia visual · Dados simulados nesta sessão
                </Text>
              </View>
            </ScrollView>
            {!desktop && (
              <BottomNavigation.Bar
                navigationState={{
                  index: Math.max(
                    0,
                    routes.findIndex(
                      (route) =>
                        route.key ===
                        (["Iluminação", "Sensores", "Manchester"].includes(
                          screen,
                        )
                          ? "Painel"
                          : ["Conexões", "Usuários"].includes(screen)
                            ? "Conta"
                            : screen === "Cadastro"
                              ? "Quartos"
                              : screen),
                    ),
                  ),
                  routes,
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
          visible={dialog === "user"}
          onDismiss={() => setDialog(null)}
          style={[s.dialog, { maxHeight: height * 0.85 }]}
        >
          <Dialog.Title>Criar perfil fictício</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.form}
            >
              <TextInput
                mode="outlined"
                label="Nome"
                accessibilityLabel="Nome"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                mode="outlined"
                label="E-mail"
                accessibilityLabel="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text variant="bodySmall">
                Começa sem acesso. Nenhuma conta real ou convite será criado.
              </Text>
              {!!formError && <HelperText type="error">{formError}</HelperText>}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Cancelar</Button>
            <Button onPress={addUser}>Salvar</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={dialog === "disable"}
          onDismiss={() => setDialog(null)}
          style={s.dialog}
        >
          <Dialog.Title>Desativar conexão?</Dialog.Title>
          <Dialog.Content>
            <Text>
              Os controles serão bloqueados e o último estado confirmado será
              preservado.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Cancelar</Button>
            <Button
              onPress={() => {
                sim.selectScenario("offline");
                setRooms((previous) =>
                  previous.map((value) =>
                    value.id === room.id ? { ...value, active: false } : value,
                  ),
                );
                setDialog(null);
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
  brand: { width: 180, height: 43 },
  sidebar: { width: 248, padding: 16, gap: 6, borderRightWidth: 1 },
  sidebarFooter: { marginTop: "auto", gap: 10, paddingTop: 16 },
  sectionLabel: { marginTop: 20, marginBottom: 8, letterSpacing: 1 },
  navButton: { borderRadius: 10 },
  navContent: { justifyContent: "flex-start", minHeight: 46 },
  divider: { marginVertical: 14 },
  topbar: {
    minHeight: 74,
    paddingHorizontal: 24,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  spread: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  titleStack: { alignItems: "flex-start", flexDirection: "column" },
  pageScroll: { padding: 28, alignItems: "center", flexGrow: 1 },
  mobileScroll: { padding: 16 },
  page: { width: "100%", maxWidth: 1440, gap: 22 },
  grid: { flexDirection: "row", gap: 24 },
  stack: { flexDirection: "column" },
  column: { flex: 1, minWidth: 0, gap: 20 },
  card: { borderRadius: 16 },
  cardContent: { padding: 20, gap: 16 },
  bold: { fontWeight: "700" },
  note: { padding: 14, borderRadius: 10, gap: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metrics: { flexDirection: "row", alignItems: "stretch", gap: 16 },
  wrap: { flexWrap: "wrap" },
  metric: {
    flex: 1,
    minWidth: 130,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  slider: { width: "100%", height: 44 },
  back: { alignSelf: "flex-start" },
  footer: { marginTop: 4, paddingBottom: 8 },
  triageState: { borderLeftWidth: 4, padding: 14, borderRadius: 10, gap: 8 },
  triageOptions: { gap: 8 },
  triageButton: { justifyContent: "flex-start", minHeight: 46 },
  indicatorDot: { width: 12, height: 12, borderRadius: 6 },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  roomCards: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  roomCardWidth: { width: "100%" },
  profile: { borderWidth: 1, padding: 16, borderRadius: 12, gap: 14 },
  loginScroll: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  loginPage: { width: "100%", maxWidth: 1100, gap: 32 },
  event: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  accessRow: { gap: 10, paddingBottom: 16, borderBottomWidth: 1 },
  form: { paddingVertical: 16, gap: 16 },
  dialog: { maxWidth: 540, width: "92%", alignSelf: "center" },
  blueprint: {
    height: 280,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  gridLine: {
    position: "absolute",
    top: 20,
    bottom: 40,
    width: 1,
    opacity: 0.2,
  },
  gridHorizontal: {
    position: "absolute",
    left: 24,
    right: 24,
    height: 1,
    opacity: 0.2,
  },
  floorWall: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: 35,
    bottom: 48,
    borderWidth: 2,
    borderRadius: 4,
  },
  bathroom: {
    position: "absolute",
    width: "27%",
    height: 72,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  board: {
    position: "absolute",
    top: 20,
    left: "46%",
    borderRadius: 6,
    padding: 6,
    alignItems: "center",
    gap: 4,
  },
  lightZone: {
    position: "absolute",
    right: "19%",
    top: 90,
    width: "42%",
    height: 116,
    borderRadius: 50,
  },
  bed: {
    position: "absolute",
    right: "24%",
    top: 107,
    width: "31%",
    height: 88,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
    flexDirection: "row",
    gap: 4,
  },
  pillow: { width: "28%", borderRadius: 4 },
  blanket: {
    flex: 1,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  doorLed: { position: "absolute", left: "10%", bottom: 54, gap: 5 },
  planCaption: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    padding: 7,
    borderRadius: 6,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
});
