import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  IconButton,
  PaperProvider,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  backendAddress,
  backendRequest,
  BackendError,
  Account,
  SavedRoom,
} from "../services/backend";
import { appTheme } from "./theme";
import DemoApp, { LoginPresentation } from "./DemoApp";
import { Panel, Note } from "./SharedPanels";
import WebInputTheme from "./WebInputTheme";

export default function ConnectedApp() {
  const [demo, setDemo] = useState(false);
  const [dark, setDark] = useState(true);
  const [address, setAddress] = useState(
    process.env.EXPO_PUBLIC_BACKEND_URL || "http://127.0.0.1:3001",
  );
  const [base, setBase] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [rooms, setRooms] = useState<SavedRoom[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const forget = () => {
    setToken(null);
    setAccount(null);
    setRooms([]);
    setPassword("");
    setMessage("");
  };
  const act = async (action: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (error) {
      if (error instanceof BackendError && error.status === 401 && account)
        forget();
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível conectar ao servidor.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const theme = appTheme(dark, false);
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
        <StatusBar style={dark ? "light" : "dark"} />
        {demo ? (
          <View style={styles.flex}>
            <Button icon="arrow-left" onPress={() => setDemo(false)}>
              Voltar à entrada
            </Button>
            <DemoApp isolated />
          </View>
        ) : account && token ? (
          <DemoApp
            workspace={{
              base,
              token,
              account,
              rooms,
              dark,
              onTheme: setDark,
              message,
              onExpired: forget,
              onLogout: () => {
                void act(async () => {
                  await backendRequest(base, "/api/auth/sign-out", token, {});
                  forget();
                });
              },
            }}
          />
        ) : (
          <SafeAreaView
            style={[styles.flex, { backgroundColor: theme.colors.background }]}
          >
            <WebInputTheme />
            <ScrollView
              contentContainerStyle={styles.login}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.themeControl}>
                <IconButton
                  icon={dark ? "weather-sunny" : "weather-night"}
                  accessibilityLabel={
                    dark ? "Ativar tema claro" : "Ativar tema escuro"
                  }
                  onPress={() => setDark((v) => !v)}
                />
              </View>
              <LoginPresentation>
                <LoginForm
                  address={address}
                  setAddress={setAddress}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  message={message}
                  busy={busy}
                  onDemo={() => setDemo(true)}
                  onSubmit={() =>
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
                      const [identity, list] = await Promise.all([
                        backendRequest<Account>(url, "/api/me", login.token),
                        backendRequest<SavedRoom[]>(
                          url,
                          "/api/rooms",
                          login.token,
                        ),
                      ]);
                      setBase(url);
                      setToken(login.token);
                      setAccount(identity.data);
                      setRooms(list.data);
                      setPassword("");
                      setMessage("");
                    })
                  }
                />
              </LoginPresentation>
            </ScrollView>
          </SafeAreaView>
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function LoginForm({
  address,
  setAddress,
  email,
  setEmail,
  password,
  setPassword,
  message,
  busy,
  onSubmit,
  onDemo,
}: {
  address: string;
  setAddress: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  message: string;
  busy: boolean;
  onSubmit: () => void;
  onDemo: () => void;
}) {
  const { colors } = useTheme();
  const [showConnection, setShowConnection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Panel
      title="Bem-vindo ao SAMAHI"
      icon="shield-account-outline"
      subtitle="Entre para acessar seus ambientes e as funções autorizadas."
    >
      {!!message && (
        <View accessibilityRole="alert">
          <Note title="Não foi possível entrar" text={message} warning />
        </View>
      )}
      <TextInput
        mode="outlined"
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        disabled={busy}
        left={<TextInput.Icon icon="email-outline" />}
      />
      <TextInput
        mode="outlined"
        label="Senha"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoComplete="current-password"
        value={password}
        onChangeText={setPassword}
        disabled={busy}
        onSubmitEditing={onSubmit}
        left={<TextInput.Icon icon="lock-outline" />}
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off-outline" : "eye-outline"}
            accessibilityLabel={
              showPassword ? "Ocultar senha" : "Mostrar senha"
            }
            onPress={() => setShowPassword((v) => !v)}
          />
        }
      />
      <Button
        mode="contained"
        icon="login"
        contentStyle={styles.primaryButton}
        loading={busy}
        disabled={busy || !email.trim() || !password}
        onPress={onSubmit}
      >
        Entrar
      </Button>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        Sua conta e o acesso aos quartos são gerenciados pelo administrador.
        Para redefinir a senha, entre em contato com ele.
      </Text>
      <Button
        mode="text"
        icon="lan-connect"
        disabled={busy}
        onPress={() => setShowConnection((v) => !v)}
      >
        {showConnection ? "Ocultar conexão" : "Configurar conexão"}
      </Button>
      {showConnection && (
        <View style={styles.connection}>
          <TextInput
            mode="outlined"
            label="Endereço do servidor"
            autoCapitalize="none"
            keyboardType="url"
            value={address}
            onChangeText={setAddress}
            disabled={busy}
          />
          <HelperText type="info">
            No celular, use o endereço do computador que executa o servidor
            SAMAHI.
          </HelperText>
        </View>
      )}
      <Button
        mode="outlined"
        icon="play-circle-outline"
        disabled={busy}
        onPress={onDemo}
      >
        Explorar demonstração
      </Button>
      <Text
        variant="labelSmall"
        style={{ color: colors.onSurfaceVariant, textAlign: "center" }}
      >
        Demonstração isolada · nenhum equipamento físico conectado
      </Text>
    </Panel>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  login: {
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  themeControl: { position: "absolute", top: 8, right: 16, zIndex: 1 },
  primaryButton: { minHeight: 48 },
  connection: { gap: 6 },
});
