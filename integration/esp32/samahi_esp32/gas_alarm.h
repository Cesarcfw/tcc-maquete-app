#pragma once
#include <stdint.h>

namespace SamahiAlarm {
constexpr int ON_ADC = 500;
constexpr int OFF_ADC = 300;
constexpr uint32_t EVALUATION_MS = 2000;
constexpr uint32_t MAX_SAMPLE_AGE_MS = 4000;
constexpr uint32_t BLINK_MS = 300;
static_assert(OFF_ADC > 0 && OFF_ADC < ON_ADC && ON_ADC < 4095,"Limiares invalidos");
struct State {
  bool active = false;
  bool fault = false;
  bool evaluated = false;
  uint8_t highCount = 0;
  uint8_t lowCount = 0;
  uint32_t lastEvaluation = 0;
  uint32_t lastSample = 0;
};

// Avalia localmente sem depender da rede. Falha nunca encerra alerta ativo.
constexpr State update(State s, int adc, bool hasSample, uint32_t sampleAt, uint32_t now) {
  const uint32_t elapsed = now - s.lastEvaluation;
  if (elapsed < EVALUATION_MS) return s;
  const bool repeated = s.evaluated && sampleAt == s.lastSample;
  const bool gap = s.evaluated && elapsed > MAX_SAMPLE_AGE_MS;
  s.lastEvaluation = now;
  s.lastSample = sampleAt;
  s.evaluated = true;
  if (!hasSample || adc < 0 || adc >= 4095 || now - sampleAt > MAX_SAMPLE_AGE_MS || repeated) {
    s.fault = true;
    s.highCount = 0;
    s.lowCount = 0;
    return s;
  }
  s.fault = false;
  if (gap) { s.highCount = 0; s.lowCount = 0; }
  if (!s.active) {
    s.lowCount = 0;
    s.highCount = adc >= ON_ADC ? s.highCount + 1 : 0;
    if (s.highCount >= 2) { s.active = true; s.highCount = 0; }
  } else {
    s.highCount = 0;
    s.lowCount = adc <= OFF_ADC ? s.lowCount + 1 : 0;
    if (s.lowCount >= 3) { s.active = false; s.lowCount = 0; }
  }
  return s;
}

constexpr int visibleColor(int selected, int off, int yellow, bool active, bool phaseOn) {
  return !active ? selected : !phaseOn ? off : selected == off ? yellow : selected;
}
constexpr bool blinkPhase(uint32_t startedAt, uint32_t now) {
  return ((now - startedAt) / BLINK_MS) % 2 == 0;
}
}
