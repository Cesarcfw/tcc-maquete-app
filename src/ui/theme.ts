import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
export function appTheme(dark: boolean, reducedMotion: boolean) {
  const base = dark ? MD3DarkTheme : MD3LightTheme;
  const palette = dark
    ? {
        primary: "#79CDEE",
        onPrimary: "#092432",
        primaryContainer: "#19374A",
        onPrimaryContainer: "#BFE9FC",
        background: "#090F1E",
        onBackground: "#EDF3FD",
        surface: "#151F33",
        onSurface: "#EDF3FD",
        surfaceVariant: "#202E45",
        onSurfaceVariant: "#ACBCD4",
        outline: "#41516A",
        outlineVariant: "#2D3D55",
        secondaryContainer: "#19374A",
        onSecondaryContainer: "#BFE9FC",
      }
    : {
        primary: "#086C94",
        onPrimary: "#FFFFFF",
        primaryContainer: "#D8EEF9",
        onPrimaryContainer: "#06334A",
        background: "#F1F5FA",
        onBackground: "#17283E",
        surface: "#FFFFFF",
        onSurface: "#17283E",
        surfaceVariant: "#E6EDF5",
        onSurfaceVariant: "#52647A",
        outline: "#73849A",
        outlineVariant: "#D6E0EC",
        secondaryContainer: "#D8EEF9",
        onSecondaryContainer: "#06334A",
      };
  return {
    ...base,
    roundness: 5,
    colors: { ...base.colors, ...palette },
    animation: { scale: reducedMotion ? 0 : 1 },
  };
}
