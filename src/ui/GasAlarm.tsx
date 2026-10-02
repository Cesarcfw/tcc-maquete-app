import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export function GasAlarm({
  room,
  acknowledged,
  stale,
  reduced,
  onAcknowledge,
}: {
  room: string;
  acknowledged: boolean;
  stale: boolean;
  reduced: boolean;
  onAcknowledge: () => void;
}) {
  const [motion] = useState(() => new Animated.Value(0));
  useEffect(() => {
    motion.setValue(0);
    if (reduced) return;
    const animation = Animated.loop(
      Animated.timing(motion, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [motion, reduced]);
  return (
    <View style={s.banner}>
      <View
        style={s.strip}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.View
          style={[
            s.stripes,
            {
              transform: [
                {
                  translateX: motion.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {Array.from({ length: 50 }, (_, index) => (
            <View key={index} style={s.stripe} />
          ))}
        </Animated.View>
      </View>
      <View style={s.content}>
        <Text
          variant="titleMedium"
          style={s.title}
          accessibilityLiveRegion="polite"
        >
          ⚠ ALERTA DE GÁS · SIMULAÇÃO
        </Text>
        <Text variant="bodyMedium" style={s.text}>
          Possível presença de gás ou fumaça em {room}.
        </Text>
        <Text variant="bodySmall" style={s.text}>
          {stale
            ? "Última detecção preservada; leitura atual indisponível."
            : "Alerta ambiental independente da triagem do paciente. Tipo de gás não identificado."}
        </Text>
        {acknowledged ? (
          <Text variant="labelLarge" style={s.title}>
            Alerta reconhecido · detecção continua ativa
          </Text>
        ) : (
          <Button
            mode="outlined"
            textColor="#181810"
            style={s.button}
            onPress={onAcknowledge}
          >
            Reconhecer alerta
          </Button>
        )}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  banner: {
    backgroundColor: "#FFE16B",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#C8A900",
  },
  strip: { height: 12, overflow: "hidden", backgroundColor: "#FFE16B" },
  stripes: { flexDirection: "row", width: 2000, height: 20 },
  stripe: {
    width: 20,
    height: 24,
    marginRight: 20,
    backgroundColor: "#181810",
    transform: [{ skewX: "-30deg" }],
  },
  content: { padding: 16, gap: 10 },
  title: { color: "#181810", fontWeight: "700" },
  text: { color: "#181810" },
  button: { alignSelf: "flex-start", borderColor: "#181810" },
});
