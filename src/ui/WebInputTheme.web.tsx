import { useTheme } from "react-native-paper";

export default function WebInputTheme() {
  const { colors, dark } = useTheme();
  return (
    <style>{`
      input, textarea { color-scheme: ${dark ? "dark" : "light"}; }
      input:is(:autofill, :-webkit-autofill),
      input:is(:autofill, :-webkit-autofill):hover,
      input:is(:autofill, :-webkit-autofill):focus,
      textarea:is(:autofill, :-webkit-autofill) {
        -webkit-box-shadow: 0 0 0 1000px ${colors.background} inset !important;
        box-shadow: 0 0 0 1000px ${colors.background} inset !important;
        -webkit-text-fill-color: ${colors.onSurface} !important;
        caret-color: ${colors.onSurface};
      }
    `}</style>
  );
}
