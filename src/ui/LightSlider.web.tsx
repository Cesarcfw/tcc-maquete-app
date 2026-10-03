import type { SliderProps } from "@react-native-community/slider";

// O input do navegador oferece teclado e semântica de valor/desabilitado.
// Android/iOS continuam usando o slider nativo no arquivo LightSlider.tsx.
export default function LightSlider(props: SliderProps) {
  return (
    <input
      type="range"
      aria-label={props.accessibilityLabel}
      aria-valuetext={`${props.value ?? 0}%`}
      min={props.minimumValue}
      max={props.maximumValue}
      step={props.step}
      value={props.value}
      disabled={props.disabled}
      onChange={(event) =>
        props.onValueChange?.(Number(event.currentTarget.value))
      }
      onPointerUp={(event) => {
        if (!props.disabled)
          props.onSlidingComplete?.(Number(event.currentTarget.value));
      }}
      onKeyUp={(event) => {
        if (
          !props.disabled &&
          [
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
            "PageUp",
            "PageDown",
          ].includes(event.key)
        ) {
          props.onSlidingComplete?.(Number(event.currentTarget.value));
        }
      }}
      style={{
        width: "100%",
        height: 44,
        margin: "8px 0",
        accentColor: String(props.thumbTintColor),
        cursor: props.disabled ? "not-allowed" : "pointer",
      }}
    />
  );
}
