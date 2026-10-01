import React, { useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Switch,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import {
  colorNames,
  indicatorPriorities,
  IndicatorColor,
  Scenario,
  toggleLight,
} from "./src/domain/maquette";
import { useSimulator } from "./src/hooks/useSimulator";
const c = {
  ink: "#F1F5FF",
  muted: "#A7B5D1",
  teal: "#69B6FF",
  pale: "#102A38",
  bg: "#070D20",
  border: "#263451",
  orange: "#FFD18C",
  surface: "#101A34",
  inset: "#0B142B",
};
const colors: Record<IndicatorColor, string> = {
  blue: "#487FDB",
  green: "#2B9B77",
  red: "#CD6262",
  orange: "#EF8B24",
  yellow: "#EAC82F",
  off: "#829097",
};
type Tab = "Painel" | "Configurações" | "Evidências";
const tabIcons: Record<Tab, string> = {
  Painel: "▦",
  Configurações: "⚙",
  Evidências: "▤",
};
function Navigation({
  tab,
  onChange,
  desktop,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
  desktop: boolean;
}) {
  return (
    <View style={desktop ? s.sideNav : s.bottomNav} accessibilityRole="tablist">
      {(["Painel", "Configurações", "Evidências"] as Tab[]).map((item) => (
        <Pressable
          key={item}
          accessibilityRole="tab"
          accessibilityLabel={item}
          accessibilityState={{ selected: item === tab }}
          onPress={() => onChange(item)}
          style={({ pressed }) => [
            s.navItem,
            desktop ? s.sideItem : s.bottomItem,
            item === tab && s.navSelected,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text
            accessibilityElementsHidden
            style={[s.navIcon, item === tab && { color: c.teal }]}
          >
            {tabIcons[item]}
          </Text>
          <Text style={[s.navLabel, item === tab && { color: c.ink }]}>
            {item}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
function Button({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: c.ink }]}>{title}</Text>
    </Pressable>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}
export default function App() {
  return (
    <SafeAreaProvider>
      <Dashboard />
    </SafeAreaProvider>
  );
}
function Dashboard() {
  const sim = useSimulator();
  const [tab, setTab] = useState<Tab>("Painel"),
    [draft, setDraft] = useState<number | null>(null);
  const width = useWindowDimensions().width;
  const desktop = width >= 1100;
  const wide = width >= 760;
  const scrollRef = useRef<ScrollView>(null);
  function navigate(next: Tab) {
    setTab(next);
    setDraft(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }
  const enabled = sim.connection === "online" && !sim.pending;
  const age = Math.max(0, Math.floor((sim.now - sim.device.receivedAt) / 1000));
  const status = {
    online: "Conectado na simulação",
    offline: "Sem comunicação",
    stale: "Dados desatualizados",
  }[sim.connection];
  const bad = sim.connection !== "online";
  function intensity(value: number) {
    setDraft(null);
    sim.send({ kind: "light", on: value > 0, intensity: value });
  }
  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="light" />
      <View style={s.shell}>
        {desktop && (
          <View style={s.sidebar}>
            <View style={s.brand}>
              <View style={s.logo}>
                <Text style={s.logoText}>M</Text>
              </View>
              <View>
                <Text style={s.brandText}>Maquete</Text>
                <Text style={s.eyebrow}>CONECTADA</Text>
              </View>
            </View>
            <View style={s.sideDivider} />
            <Text style={s.sideCaption}>ESPAÇO DE CONTROLE</Text>
            <Navigation tab={tab} onChange={navigate} desktop />
            <View style={s.sideNote}>
              <Text style={s.itemTitle}>Um ambiente conectado.</Text>
              <Text style={s.small}>
                Sensores e controles em um único painel.
              </Text>
              <Text style={[s.footnote, { color: c.orange }]}>
                Demonstração simulada
              </Text>
            </View>
            <Text style={s.small}>v0.2.0 · Prévia visual</Text>
          </View>
        )}
        <ScrollView
          ref={scrollRef}
          style={s.content}
          contentContainerStyle={[s.scroll, !wide && s.mobileScroll]}
        >
          <View style={s.page}>
            <View style={s.header}>
              {!desktop && (
                <View style={s.brand}>
                  <View style={s.logo}>
                    <Text style={s.logoText}>M</Text>
                  </View>
                  <View>
                    <Text style={s.brandText}>Maquete conectada</Text>
                    <Text style={s.eyebrow}>CONTROLE DO AMBIENTE</Text>
                  </View>
                </View>
              )}
              {desktop && (
                <View>
                  <Text style={s.small}>Espaço de controle / {tab}</Text>
                  <Text style={s.brandText}>
                    {tab === "Painel" ? "Visão geral do ambiente" : tab}
                  </Text>
                </View>
              )}
              <View style={s.version}>
                <Text style={s.small}>v0.2.0 · Protótipo</Text>
              </View>
            </View>
            <View style={[s.heading, tab === "Painel" && s.hero]}>
              {tab === "Painel" && (
                <View pointerEvents="none" style={s.heroOrb} />
              )}
              <Text style={s.kicker}>
                {tab === "Painel" ? "AMBIENTE 01" : "PROTÓTIPO DO APLICATIVO"}
              </Text>
              <Text style={[s.title, !wide && s.mobileTitle]}>
                {tab === "Painel"
                  ? "Seu quarto, em um só lugar."
                  : tab === "Configurações"
                    ? "Explore os cenários."
                    : "Registre o funcionamento."}
              </Text>
              <Text style={s.description}>
                {tab === "Painel"
                  ? "Acompanhe os sensores e ajuste as funções da maquete."
                  : tab === "Configurações"
                    ? "Teste as telas e as respostas do aplicativo."
                    : "Um roteiro de capturas para documentar esta versão."}
              </Text>
            </View>
            <Text style={s.simBanner}>
              DADOS SIMULADOS · Nenhum ESP32 conectado
            </Text>
            {tab === "Painel" && (
              <>
                <View style={[s.status, bad && { backgroundColor: "#33271E" }]}>
                  <View
                    style={[
                      s.connectionDot,
                      bad && { backgroundColor: c.orange },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.statusTitle, bad && { color: c.orange }]}>
                      {status}
                    </Text>
                    <Text style={s.small}>
                      {bad
                        ? "Última leitura preservada; comandos pausados."
                        : "Leituras e comandos demonstrados localmente."}
                    </Text>
                  </View>
                  <Text style={s.small}>Há {age} s</Text>
                </View>
                <View style={[s.columns, !wide && s.stacked]}>
                  <View style={s.column}>
                    <Card>
                      <Text style={s.sectionTitle}>Sensores do quarto</Text>
                      <Text style={s.small}>
                        {bad
                          ? "Valores anteriores, sem atualização atual."
                          : "Temperatura e umidade do ambiente simulado."}
                      </Text>
                      <View style={s.sensorRow}>
                        {[
                          ["Temperatura", "24,6", "°C"],
                          ["Umidade", "58", "%"],
                        ].map(([label, value, unit]) => (
                          <View style={s.sensor} key={label}>
                            <Text style={s.small}>{label}</Text>
                            <Text style={[s.metric, bad && { color: c.muted }]}>
                              {value}
                              <Text style={s.unit}> {unit}</Text>
                            </Text>
                            <Text style={s.small}>Sensor DHT22</Text>
                          </View>
                        ))}
                      </View>
                    </Card>
                    <Card>
                      <View style={s.row}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.sectionTitle}>Luz do quarto</Text>
                          <Text style={s.small}>
                            {sim.device.lightOn ? "Ligada" : "Desligada"} ·
                            confirmado na simulação
                          </Text>
                        </View>
                        <Switch
                          accessibilityLabel="Ligar ou desligar luz do quarto"
                          value={sim.device.lightOn}
                          disabled={!enabled}
                          onValueChange={() =>
                            sim.send(toggleLight(sim.device))
                          }
                          trackColor={{ false: "#CCD8D4", true: c.teal }}
                          thumbColor="#FFFFFF"
                        />
                      </View>
                      <View style={s.room}>
                        <View
                          style={[
                            s.glow,
                            { opacity: 0.15 + sim.device.intensity / 130 },
                          ]}
                        />
                        <View
                          style={[
                            s.lamp,
                            {
                              backgroundColor: sim.device.lightOn
                                ? "#F2CA67"
                                : "#A6B6B0",
                            },
                          ]}
                        />
                        <View style={s.floor} />
                        <View style={s.bed}>
                          <View style={s.pillow} />
                          <View style={s.blanket} />
                        </View>
                        <Text style={s.roomCaption}>
                          {sim.device.lightOn
                            ? `Iluminação em ${sim.device.intensity}%`
                            : "Luz desligada"}
                        </Text>
                      </View>
                      <View style={s.row}>
                        <Text style={s.small}>Intensidade</Text>
                        <Text style={s.percent}>
                          {draft ?? sim.device.intensity}%
                        </Text>
                      </View>
                      <Slider
                        accessibilityLabel="Intensidade da luz"
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                        value={draft ?? sim.device.intensity}
                        disabled={!enabled}
                        onValueChange={setDraft}
                        onSlidingComplete={intensity}
                        minimumTrackTintColor={c.teal}
                        maximumTrackTintColor="#D7E4DE"
                        thumbTintColor={c.teal}
                        style={{ width: "100%", height: 38 }}
                      />
                      <View style={s.row}>
                        <Text style={s.small}>0% · desligada</Text>
                        <Text style={s.small}>100% · máxima</Text>
                      </View>
                      <View style={s.presets}>
                        {[0, 25, 50, 100].map((value) => (
                          <Pressable
                            key={value}
                            accessibilityRole="button"
                            accessibilityLabel={`Definir intensidade ${value}%`}
                            disabled={!enabled}
                            onPress={() => intensity(value)}
                            style={[s.preset, !enabled && s.disabled]}
                          >
                            <Text style={s.presetText}>{value}%</Text>
                          </Pressable>
                        ))}
                      </View>
                      <Text style={s.small}>
                        Reportado: {sim.device.intensity}%. Enviado ao soltar o
                        controle.
                      </Text>
                    </Card>
                  </View>
                  <View style={[s.column, wide && { flex: 0.83 }]}>
                    <Card>
                      <Text style={s.sectionTitle}>Indicador externo</Text>
                      <Text style={s.small}>
                        Protocolo de Manchester · seleção manual da cor.
                      </Text>
                      <View style={s.indicatorPreview}>
                        <View
                          style={[
                            s.indicatorLight,
                            { backgroundColor: colors[sim.device.indicator] },
                          ]}
                        />
                        <Text style={s.indicatorName}>
                          {colorNames[sim.device.indicator]}
                        </Text>
                        <Text style={s.small}>
                          {indicatorPriorities[sim.device.indicator]}
                        </Text>
                        <Text style={s.small}>Confirmado na simulação</Text>
                      </View>
                      <View style={s.colorGrid}>
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
                          <Pressable
                            key={color}
                            accessibilityRole="button"
                            accessibilityLabel={`Indicador ${colorNames[color]}`}
                            accessibilityState={{
                              selected: sim.device.indicator === color,
                              disabled: !enabled,
                            }}
                            disabled={!enabled}
                            onPress={() =>
                              sim.send({ kind: "indicator", color })
                            }
                            style={[
                              s.colorButton,
                              sim.device.indicator === color && s.selected,
                              !enabled && s.disabled,
                            ]}
                          >
                            <View
                              style={[
                                s.colorDot,
                                { backgroundColor: colors[color] },
                              ]}
                            />
                            <View>
                              <Text style={s.colorText}>
                                {colorNames[color]}
                              </Text>
                              <Text style={s.small}>
                                {color === "off"
                                  ? "Apagar indicador"
                                  : indicatorPriorities[color]}
                              </Text>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                      <Text style={s.footnote}>
                        Representa na maquete uma classificação já definida. O
                        aplicativo não realiza a triagem. Desligado apenas apaga
                        o indicador e não é uma categoria do protocolo.
                      </Text>
                    </Card>
                    <Card>
                      <Text style={s.sectionTitle}>Resposta do aplicativo</Text>
                      <View
                        style={[
                          s.notice,
                          sim.pending && { backgroundColor: "#30291D" },
                        ]}
                        accessibilityLiveRegion="polite"
                      >
                        <Text style={s.noticeText}>{sim.notice}</Text>
                      </View>
                      <Text style={s.small}>
                        A confirmação nesta versão representa a resposta do
                        simulador.
                      </Text>
                      <Button
                        title="Testar cenários de conexão"
                        secondary
                        onPress={() => navigate("Configurações")}
                      />
                    </Card>
                    <View style={s.future}>
                      <Text style={s.futureTitle}>Preparado para crescer</Text>
                      <Text style={s.small}>
                        Novos sensores e controles serão integrados conforme as
                        funções da maquete forem definidas.
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
            {tab === "Configurações" && (
              <View style={[s.columns, !wide && s.stacked]}>
                <View style={s.column}>
                  <Card>
                    <Text style={s.sectionTitle}>Cenários de teste</Text>
                    <Text style={s.small}>
                      Alteram somente a simulação desta versão.
                    </Text>
                    {(
                      [
                        [
                          "normal",
                          "Operação normal",
                          "Leituras atuais e comandos confirmados.",
                        ],
                        [
                          "offline",
                          "Sem comunicação",
                          "Preserva a leitura anterior e pausa os controles.",
                        ],
                        [
                          "stale",
                          "Dados desatualizados",
                          "Mostra a leitura antiga e pausa os controles.",
                        ],
                        [
                          "timeout",
                          "Comando sem confirmação",
                          "Leituras atuais; comando retorna falha após 5 s.",
                        ],
                      ] as [Scenario, string, string][]
                    ).map(([value, title, description]) => (
                      <Pressable
                        key={value}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: sim.scenario === value }}
                        accessibilityLabel={title}
                        onPress={() => {
                          setDraft(null);
                          sim.selectScenario(value);
                        }}
                        style={[
                          s.scenario,
                          sim.scenario === value && s.selected,
                        ]}
                      >
                        <View
                          style={[
                            s.radio,
                            sim.scenario === value && {
                              backgroundColor: c.teal,
                            },
                          ]}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={s.itemTitle}>{title}</Text>
                          <Text style={s.small}>{description}</Text>
                        </View>
                      </Pressable>
                    ))}
                    <Button
                      title="Voltar ao painel"
                      onPress={() => navigate("Painel")}
                    />
                  </Card>
                </View>
                <View style={[s.column, wide && { flex: 0.83 }]}>
                  <Card>
                    <Text style={s.sectionTitle}>Sobre esta versão</Text>
                    <Text style={s.paragraph}>
                      v0.2.0 · Protótipo interativo
                    </Text>
                    <Text style={s.small}>
                      React Native, Expo e TypeScript. Simulador local, sem
                      comandos pela rede.
                    </Text>
                    <Text style={s.paragraph}>
                      A configuração de servidor e a integração real entram após
                      validar as telas e o contrato de comunicação.
                    </Text>
                    <Button
                      title="Reiniciar demonstração"
                      secondary
                      onPress={() => {
                        sim.reset();
                        setDraft(null);
                      }}
                    />
                  </Card>
                  <Card>
                    <Text style={s.sectionTitle}>Atividade recente</Text>
                    {sim.logs.length === 0 ? (
                      <Text style={s.small}>
                        Nenhuma ação registrada nesta sessão.
                      </Text>
                    ) : (
                      sim.logs.slice(0, 6).map((item) => (
                        <View key={item.id} style={s.log}>
                          <Text style={s.logTime}>{item.time}</Text>
                          <Text
                            style={[
                              s.small,
                              item.type === "error" && { color: "#FFADAD" },
                            ]}
                          >
                            {item.message}
                          </Text>
                        </View>
                      ))
                    )}
                  </Card>
                </View>
              </View>
            )}
            {tab === "Evidências" && (
              <Card>
                <Text style={s.sectionTitle}>Roteiro de captura · v0.2.0</Text>
                <Text style={s.paragraph}>
                  Identifique em toda captura que os dados e as confirmações são
                  simulados.
                </Text>
                {[
                  [
                    "E01 · Tire print desta parte",
                    "Painel completo: sensores, luz em 65%, indicador azul e aviso de simulação.",
                  ],
                  [
                    "E02 · Mostre em vídeo ou GIF",
                    "Desligue e ligue a luz, incluindo o estado confirmado.",
                  ],
                  [
                    "E03 · Mostre em vídeo ou GIF",
                    "Ajuste para 25%, 50% e 100%. Inclua o valor reportado e o quarto.",
                  ],
                  [
                    "E04 · Mostre em vídeo ou GIF",
                    "Troque as cinco cores Manchester e apague o indicador. Mostre as prioridades e as confirmações.",
                  ],
                  [
                    "E05 · Tire print desta parte",
                    "Ative “Sem comunicação” e mostre controles pausados no painel.",
                  ],
                  [
                    "E06 · Mostre em vídeo ou GIF",
                    "Ative “Comando sem confirmação”, envie uma alteração e mostre o aviso de falha sem mudança no estado reportado.",
                  ],
                  [
                    "E07 · Mostre em vídeo ou GIF",
                    "Volte para “Operação normal” e confira que o comando que falhou não é reaplicado.",
                  ],
                ].map(([title, description]) => (
                  <View key={title} style={s.evidence}>
                    <Text style={s.itemTitle}>{title}</Text>
                    <Text style={s.small}>{description}</Text>
                  </View>
                ))}
                <Text style={s.footnote}>
                  Roteiro planejado. Registre os resultados antes de considerar
                  as evidências coletadas.
                </Text>
                <Button
                  title="Abrir painel para capturar"
                  onPress={() => navigate("Painel")}
                />
              </Card>
            )}
            <View style={s.footer}>
              <Text style={s.small}>
                Maquete conectada · desenvolvimento do aplicativo
              </Text>
              <Text style={s.small}>v0.2.0</Text>
            </View>
          </View>
        </ScrollView>
      </View>
      {!desktop && <Navigation tab={tab} onChange={navigate} desktop={false} />}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: c.bg,
  },
  shell: { flex: 1, flexDirection: "row" },
  content: { flex: 1 },
  scroll: { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 32 },
  mobileScroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },
  page: { width: "100%", maxWidth: 1240, alignSelf: "center" },
  sidebar: {
    width: 230,
    backgroundColor: "#0C142C",
    padding: 22,
    paddingTop: 32,
    borderRightWidth: 1,
    borderRightColor: c.border,
    gap: 22,
  },
  sideDivider: { height: 1, backgroundColor: c.border },
  sideCaption: { color: c.muted, fontSize: 9, letterSpacing: 1.5 },
  sideNav: { gap: 10 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#0C142C",
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  navItem: {
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  sideItem: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 14,
    gap: 12,
  },
  bottomItem: { flex: 1, gap: 4, paddingVertical: 7 },
  navSelected: { backgroundColor: "#1A2F56" },
  navIcon: { color: c.muted, fontSize: 22 },
  navLabel: { color: c.muted, fontSize: 11, fontWeight: "600" },
  sideNote: {
    marginTop: "auto",
    backgroundColor: "#15274B",
    borderWidth: 1,
    borderColor: "#304671",
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6DE3B2",
  },
  hero: {
    backgroundColor: "#122650",
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#284C80",
    marginTop: 26,
    marginBottom: 18,
  },
  heroOrb: {
    position: "absolute",
    right: -32,
    top: -100,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: "#193C73",
    opacity: 0.35,
  },
  mobileTitle: { fontSize: 27, lineHeight: 34 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: {
    backgroundColor: c.teal,
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "white", fontWeight: "800", fontSize: 25 },
  brandText: { fontSize: 18, fontWeight: "700", color: c.ink },
  eyebrow: { fontSize: 9, letterSpacing: 1.5, color: c.muted, marginTop: 4 },
  version: {
    backgroundColor: "#142342",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabs: {
    flexDirection: "row",
    gap: 6,
    borderBottomColor: c.border,
    borderBottomWidth: 1,
    marginTop: 27,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: c.teal },
  tabText: { color: c.muted, fontWeight: "600", fontSize: 13 },
  heading: { paddingTop: 28, paddingBottom: 22 },
  kicker: {
    color: c.teal,
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: "700",
    marginBottom: 8,
  },
  title: { color: c.ink, fontSize: 30, fontWeight: "700", letterSpacing: -0.8 },
  description: { color: c.muted, fontSize: 14, lineHeight: 21, marginTop: 9 },
  simBanner: {
    color: c.orange,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 16,
  },
  status: {
    backgroundColor: c.pale,
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  statusTitle: {
    color: "#89E6C2",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  columns: { flexDirection: "row", gap: 20, alignItems: "flex-start" },
  stacked: { flexDirection: "column", alignItems: "stretch" },
  column: { flex: 1, gap: 18 },
  card: {
    backgroundColor: c.surface,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: c.border,
    gap: 10,
  },
  sectionTitle: {
    color: c.ink,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  small: { color: c.muted, fontSize: 12, lineHeight: 18 },
  paragraph: { color: c.ink, fontSize: 13, lineHeight: 21, marginVertical: 5 },
  sensorRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  sensor: {
    flex: 1,
    backgroundColor: c.inset,
    padding: 14,
    borderRadius: 14,
  },
  metric: {
    color: c.ink,
    fontSize: 30,
    fontWeight: "700",
    marginVertical: 10,
    letterSpacing: -0.5,
  },
  unit: { fontSize: 18, fontWeight: "400", color: c.muted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  percent: { color: c.teal, fontSize: 19, fontWeight: "700" },
  room: {
    height: 155,
    backgroundColor: "#17213A",
    borderRadius: 15,
    overflow: "hidden",
    alignItems: "center",
    marginVertical: 9,
  },
  glow: {
    position: "absolute",
    top: -55,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#FFE396",
  },
  lamp: {
    width: 50,
    height: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    top: 12,
  },
  floor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 43,
    backgroundColor: "#253452",
  },
  bed: {
    position: "absolute",
    width: 135,
    height: 63,
    backgroundColor: "#8190B0",
    bottom: 38,
    borderRadius: 10,
    padding: 7,
  },
  pillow: { width: 48, height: 16, backgroundColor: "white", borderRadius: 5 },
  blanket: {
    backgroundColor: "#365B9A",
    height: 26,
    borderRadius: 5,
    marginTop: 6,
  },
  roomCaption: {
    position: "absolute",
    bottom: 13,
    color: c.ink,
    fontSize: 11,
    fontWeight: "600",
  },
  presets: { flexDirection: "row", gap: 8, marginVertical: 6 },
  preset: {
    backgroundColor: "#1B2B49",
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  presetText: { color: c.teal, fontSize: 12, fontWeight: "600" },
  indicatorPreview: {
    backgroundColor: c.inset,
    alignItems: "center",
    padding: 22,
    borderRadius: 16,
    marginVertical: 8,
    gap: 7,
  },
  indicatorLight: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 7,
    borderColor: "#273959",
  },
  indicatorName: { color: c.ink, fontSize: 18, fontWeight: "700" },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  colorButton: {
    width: "48%",
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 9,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    borderColor: c.border,
    borderWidth: 1,
  },
  selected: { backgroundColor: "#172E51", borderColor: c.teal },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  colorText: { color: c.ink, fontSize: 12, fontWeight: "600" },
  footnote: { color: c.muted, fontSize: 11, lineHeight: 17, marginTop: 6 },
  notice: {
    backgroundColor: c.inset,
    padding: 15,
    borderRadius: 12,
    minHeight: 70,
    justifyContent: "center",
  },
  noticeText: { color: c.ink, fontSize: 13, lineHeight: 20 },
  button: {
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: "#216FE7",
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: { color: "white", fontWeight: "600", fontSize: 12 },
  secondary: {
    backgroundColor: "#172743",
    borderWidth: 1,
    borderColor: c.border,
  },
  disabled: { opacity: 0.42 },
  future: { padding: 19, gap: 6 },
  futureTitle: { color: c.teal, fontSize: 13, fontWeight: "700" },
  scenario: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: "center",
    marginTop: 6,
  },
  radio: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: c.teal,
  },
  itemTitle: { color: c.ink, fontSize: 13, fontWeight: "700", marginBottom: 5 },
  log: { borderTopWidth: 1, borderTopColor: c.border, paddingVertical: 10 },
  logTime: { color: c.teal, fontSize: 10, marginBottom: 3 },
  evidence: {
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 25,
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingTop: 17,
  },
});
