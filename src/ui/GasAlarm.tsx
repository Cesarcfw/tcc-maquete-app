import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
  const [exit] = useState(() => new Animated.Value(0));
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  useEffect(() => () => exit.stopAnimation(), [exit]);
  function closeAlarm() {
    if (!acknowledged || closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    if (reduced) {
      onClose();
      return;
    }
    Animated.timing(exit, {
      toValue: 1,
      duration: 380,
      easing: Easing.inOut(Easing.cubic),
      isInteraction: false,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  }
  useEffect(() => {
    motion.setValue(0);
    if (reduced) return;
    const animation = Animated.loop(
      Animated.timing(motion, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        isInteraction: false,
        useNativeDriver: false,
      }),
      { iterations: -1 },
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
      onRequestClose={closeAlarm}
    >
      <View style={s.overlay}>
        <Animated.View
          pointerEvents="none"
          style={[
            s.backdrop,
            {
              opacity: exit.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        />
        <ScrollView contentContainerStyle={s.scroll}>
          <Animated.View
            style={[
              s.banner,
              {
                transform: [
                  {
                    translateX: exit.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, width],
                    }),
                  },
                ],
              },
            ]}
            accessibilityViewIsModal
          >
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
                    onPress={closeAlarm}
                    disabled={closing}
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
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  overlay: { flex: 1, overflow: "hidden" },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(3, 8, 18, 0.85)",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  banner: {
    backgroundColor: "#FFE16B",
    overflow: "hidden",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#C8A900",
    width: "100%",
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
  content: {
    padding: 24,
    gap: 18,
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
  },
  title: { color: "#181810", fontWeight: "700" },
  text: { color: "#181810" },
  button: { alignSelf: "flex-start", borderColor: "#181810" },
});
