import { StyleSheet, View } from "react-native";
import { Card, Icon, Text, useTheme } from "react-native-paper";
export function Panel({
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
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.row}>
          {icon && <Icon source={icon} size={22} color={colors.primary} />}
          <Text variant="titleMedium" style={[styles.bold, styles.flex]}>
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
export function Note({
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
        styles.note,
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

const styles = StyleSheet.create({
  card: { borderRadius: 16 },
  cardContent: { padding: 20, gap: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  bold: { fontWeight: "700" },
  flex: { flex: 1, minWidth: 0 },
  note: { padding: 14, borderRadius: 10, gap: 6 },
});
