import { Image, View } from "react-native";
import { useTheme } from "react-native-paper";

/** Assinatura compacta: símbolo e nome independentes, sem reduzir a descrição. */
export function Brand({ width = 180 }: { width?: number }) {
  const { dark } = useTheme();
  const symbolSize = width * 0.25;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="SAMAHI — Sistema de Automação e Monitoramento de Ambientes Hospitalares Inteligentes"
      style={{
        width,
        height: symbolSize,
        flexDirection: "row",
        alignItems: "center",
        gap: width * 0.04,
      }}
    >
      <Image
        accessible={false}
        source={require("../../assets/brand/symbol-ui.png")}
        style={{ width: symbolSize, height: symbolSize }}
        resizeMode="contain"
      />
      <Image
        accessible={false}
        source={
          dark
            ? require("../../assets/brand/wordmark-dark.png")
            : require("../../assets/brand/wordmark-light.png")
        }
        style={{ width: width * 0.71, height: symbolSize * 0.7 }}
        resizeMode="contain"
      />
    </View>
  );
}
