import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  defaultLightingSchedule,
  validLightingSchedule,
  type LightingSchedule,
} from "../../shared/lighting-schedule.cjs";
import type { DeviceState } from "../domain/maquette";

export function LightingScheduleControls({
  device,
  ready,
  canControl,
  onConfigure,
}: {
  device: DeviceState;
  ready: boolean;
  canControl: boolean;
  onConfigure: (schedule: LightingSchedule, enabled: boolean) => void;
}) {
  const { colors } = useTheme();
  const confirmed = device.lightingSchedule;
  const defaults = confirmed ?? defaultLightingSchedule();
  const [draft, setDraft] = useState<{
    dayStart: string;
    nightStart: string;
    dayIntensity: string;
    nightIntensity: string;
  } | null>(null);
  const form = draft ?? {
    ...defaults,
    dayIntensity: String(defaults.dayIntensity),
    nightIntensity: String(defaults.nightIntensity),
  };
  const schedule = {
    timeZone: "America/Sao_Paulo" as const,
    dayStart: form.dayStart,
    nightStart: form.nightStart,
    dayIntensity: /^\d{1,3}$/.test(form.dayIntensity)
      ? Number(form.dayIntensity)
      : NaN,
    nightIntensity: /^\d{1,3}$/.test(form.nightIntensity)
      ? Number(form.nightIntensity)
      : NaN,
  };
  const valid = validLightingSchedule(schedule);
  const dirty =
    !!draft && JSON.stringify(schedule) !== JSON.stringify(confirmed);
  const disabled = !ready || !canControl || !confirmed;
  const change = (key: keyof typeof form, value: string) =>
    setDraft({ ...form, [key]: value });
  return (
    <View style={styles.root}>
      <Divider />
      <Text variant="titleMedium">Modos Dia e Noite</Text>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        Horário de Brasília · programação diária
      </Text>
      <Text variant="labelLarge">
        Modo atual:{" "}
        {device.lightMode === "scheduled"
          ? device.lightingPeriod === "day"
            ? "Dia · programação ativa"
            : "Noite · programação ativa"
          : "Manual"}
      </Text>
      {!confirmed ? (
        <Text>Programação indisponível neste dispositivo.</Text>
      ) : !canControl ? (
        <Text>
          Dia: {confirmed.dayStart} · {confirmed.dayIntensity}%. Noite:{" "}
          {confirmed.nightStart} · {confirmed.nightIntensity}%.
        </Text>
      ) : (
        <>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text variant="labelLarge">Dia</Text>
              <TextInput
                mode="outlined"
                label="Início do Dia (HH:mm)"
                accessibilityLabel="Início do Dia (HH:mm)"
                value={form.dayStart}
                onChangeText={(v) => change("dayStart", v)}
                disabled={disabled}
                autoCorrect={false}
                placeholder="07:00"
              />
              <TextInput
                mode="outlined"
                label="Luz no Dia (%)"
                accessibilityLabel="Luz no Dia (%)"
                keyboardType="number-pad"
                value={form.dayIntensity}
                onChangeText={(v) => change("dayIntensity", v)}
                disabled={disabled}
              />
            </View>
            <View style={styles.column}>
              <Text variant="labelLarge">Noite</Text>
              <TextInput
                mode="outlined"
                label="Início da Noite (HH:mm)"
                accessibilityLabel="Início da Noite (HH:mm)"
                value={form.nightStart}
                onChangeText={(v) => change("nightStart", v)}
                disabled={disabled}
                autoCorrect={false}
                placeholder="19:00"
              />
              <TextInput
                mode="outlined"
                label="Luz na Noite (%)"
                accessibilityLabel="Luz na Noite (%)"
                keyboardType="number-pad"
                value={form.nightIntensity}
                onChangeText={(v) => change("nightIntensity", v)}
                disabled={disabled}
              />
            </View>
          </View>
          {!!draft && !valid && (
            <HelperText type="error">
              Use horários diferentes em HH:mm e intensidades inteiras de 0 a
              100%.
            </HelperText>
          )}
          {dirty && valid && (
            <HelperText type="info">
              Alterações ainda não confirmadas pelo serviço.
            </HelperText>
          )}
          <Button
            mode="contained-tonal"
            icon="calendar-clock"
            disabled={
              disabled || !valid || (!dirty && device.lightMode === "scheduled")
            }
            onPress={() => onConfigure(schedule, true)}
          >
            {dirty
              ? "Salvar e ativar horários"
              : device.lightMode === "scheduled"
                ? "Horários ativos"
                : "Ativar horários"}
          </Button>
          {device.lightMode === "scheduled" && (
            <Button
              mode="outlined"
              disabled={disabled}
              onPress={() => onConfigure(confirmed, false)}
            >
              Pausar programação
            </Button>
          )}
          {dirty && (
            <Button disabled={!ready} onPress={() => setDraft(null)}>
              Descartar edição
            </Button>
          )}
        </>
      )}
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        Cada modo permanece até o início do outro. 0% apaga a luz. Usar o
        controle manual pausa os horários até você reativá-los.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { gap: 10 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  column: { flex: 1, minWidth: 160, gap: 10 },
});
