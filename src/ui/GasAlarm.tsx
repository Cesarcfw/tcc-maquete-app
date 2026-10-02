import { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Button, Text } from "react-native-paper";

export function GasAlarm({
  room,
  acknowledged,
  stale,
  reduced,
  onAcknowledge,
  onClose,
}: {
  room: string;
  acknowledged: boolean;
  stale: boolean;
  reduced: boolean;
  onAcknowledge: () => void;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
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
  function strip(reverse: boolean) {
    return (
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
                    outputRange: reverse ? [0, -80] : [-80, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {Array.from({ length: Math.ceil(width / 80) + 3 }, (_, index) => (
            <View key={index} style={s.stripe} />
          ))}
        </Animated.View>
      </View>
    );
  }
  return (
    <Modal
      transparent
      visible
      animationType={reduced ? "none" : "fade"}
      onRequestClose={() => {
        if (acknowledged) onClose();
      }}
    >
      <View style={s.backdrop}>
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.banner} accessibilityViewIsModal>
            {strip(false)}
            <View style={s.content}>
              <Text
                variant="headlineSmall"
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
                <>
                  <Text variant="labelLarge" style={s.title}>
                    Alerta reconhecido · detecção continua ativa
                  </Text>
                  <Button
                    mode="contained"
                    buttonColor="#181810"
                    textColor="#FFE16B"
                    onPress={onClose}
                  >
                    Voltar ao aplicativo
                  </Button>
                </>
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
            {strip(true)}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(3, 8, 18, 0.85)" },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  banner: {
    backgroundColor: "#FFE16B",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#C8A900",
    width: "100%",
    maxWidth: 820,
  },
  strip: { height: 28, overflow: "hidden", backgroundColor: "#FFE16B" },
  stripes: { flexDirection: "row", height: 40 },
  stripe: {
    width: 40,
    height: 40,
    marginRight: 40,
    flexShrink: 0,
    backgroundColor: "#181810",
    transform: [{ skewX: "-30deg" }],
  },
  content: { padding: 24, gap: 18 },
  title: { color: "#181810", fontWeight: "700" },
  text: { color: "#181810" },
  button: { alignSelf: "flex-start", borderColor: "#181810" },
});
