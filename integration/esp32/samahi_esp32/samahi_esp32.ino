#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <DHT.h>
#include <math.h>
#include "gas_alarm.h"
#include "gas_alarm_checks.h"
#include "wifi_config.h"
#include "ota_config.h"
#include "network_manager.h"

// Teste de bancada: LED vermelho comum com resistor no GPIO 23.
const int LED_PIN = 23;
const int DHT_PIN = 4;
const unsigned long DHT_INTERVALO_MS = 2500;
DHT dht(DHT_PIN, DHT22);
float temperaturaC = NAN;
float umidadePercentual = NAN;
bool temperaturaValida = false;
bool umidadeValida = false;
bool dhtLido = false;
unsigned long ultimaLeituraDht = 0;
const int GAS_PIN = 34;  // ADC1: entrada analogica disponivel com Wi-Fi.
const unsigned long GAS_INTERVALO_MS = 1000;
const int GAS_AMOSTRAS = 16;
// Limiares experimentais do ensaio: nao sao ppm nem limites de seguranca.
const int GAS_LIMIAR_TESTE_ADC = SamahiAlarm::ON_ADC;
SamahiAlarm::State alarmeGas;
uint32_t inicioPisca = 0;
uint32_t ultimaTentativaRgb = 0;
const char* FIRMWARE_VERSION = "samahi-ap-sta-2026.11.22";
int gasRawAdc = 0;
bool gasLido = false;
unsigned long ultimaLeituraGas = 0;
const int RGB_R_PIN = 16;  // Pode estar escrito RX2 na placa.
const int RGB_G_PIN = 17;  // Pode estar escrito TX2 na placa.
const int RGB_B_PIN = 18;
// Confirmar o tipo fisico: false = comum no GND; true = comum no 3V3.
const bool RGB_ANODO_COMUM = false;
const uint16_t PORTA_NODE_RED = 4210;
const uint16_t PORTA_LOCAL = 4211;
const uint32_t PWM_FREQUENCIA = 5000;
const uint8_t PWM_BITS = 8;
WiFiUDP udp;
int intensidade = 0;
int ultimaIntensidadePositiva = 100;
bool pwmPronto = false;
bool socketPronto = false;
bool otaPronto = false;
bool atualizando = false;
unsigned long ultimoEnvio = 0;
unsigned long ultimaTentativa = 0;
unsigned long sequencia = 0;
bool rgbPronto = false;
struct CorRgb { const char* nome; uint8_t r; uint8_t g; uint8_t b; };
const CorRgb CORES[] = {
  // Ajuste inicial para este LED: verde domina as misturas. Validar visualmente.
  // Amarelo usa a mistura anteriormente chamada de laranja no teste.
  {"red", 255, 0, 0}, {"yellow", 255, 20, 0},
  {"green", 0, 255, 0}, {"blue", 0, 0, 255}, {"off", 0, 0, 0}
};
const int NUM_CORES = sizeof(CORES) / sizeof(CORES[0]);
const int COR_APAGADA = NUM_CORES - 1;
const int COR_AMARELA = 1;
int corAtual = COR_APAGADA;
bool corConhecida = false;
int corVisivel = COR_APAGADA;
bool rgbSaidaConhecida = false;
String ultimoRgbId;
String ultimaRgbAcao;
char ultimoRgbAck[360] = "";

uint32_t dutyRgb(uint8_t valor) {
  return RGB_ANODO_COMUM ? 255 - valor : valor;
}

const char* nomeCor() {
  return corConhecida ? CORES[corAtual].nome : "unknown";
}

bool escreverRgb(int indice) {
  if (!rgbPronto || indice < 0 || indice >= NUM_CORES) return false;
  const CorRgb& cor = CORES[indice];
  bool r = ledcWrite(RGB_R_PIN, dutyRgb(cor.r));
  bool g = ledcWrite(RGB_G_PIN, dutyRgb(cor.g));
  bool b = ledcWrite(RGB_B_PIN, dutyRgb(cor.b));
  rgbSaidaConhecida = r && g && b;
  if (rgbSaidaConhecida) corVisivel = indice;
  ultimaTentativaRgb = millis();
  return rgbSaidaConhecida;
}

bool fasePiscaLigada() {
  return !alarmeGas.active || SamahiAlarm::blinkPhase(inicioPisca, millis());
}

bool aplicarCor(int indice) {
  if (indice < 0 || indice >= NUM_CORES) return false;
  const int visivel = SamahiAlarm::visibleColor(indice, COR_APAGADA, COR_AMARELA, alarmeGas.active, fasePiscaLigada());
  const bool aplicado = escreverRgb(visivel);
  // A cor de triagem e independente da sobreposicao temporaria do alarme.
  if (aplicado) { corAtual = indice; corConhecida = true; }
  return aplicado;
}

void atualizarIndicador() {
  const int visivel = SamahiAlarm::visibleColor(corAtual, COR_APAGADA, COR_AMARELA, alarmeGas.active, fasePiscaLigada());
  if ((rgbSaidaConhecida && visivel != corVisivel) || (!rgbSaidaConhecida && millis() - ultimaTentativaRgb >= SamahiAlarm::BLINK_MS)) {
    escreverRgb(visivel);
  }
}

void avaliarAlarmeGas() {
  const bool anterior = alarmeGas.active;
  alarmeGas = SamahiAlarm::update(alarmeGas, gasRawAdc, gasLido, ultimaLeituraGas, millis());
  if (alarmeGas.active && !anterior) {
    inicioPisca = millis();
    Serial.println("MQ-2: alerta experimental confirmado; RGB piscando, sem buzzer.");
  } else if (!alarmeGas.active && anterior) {
    Serial.println("MQ-2: retorno experimental confirmado; restaurando indicador de triagem.");
  }
}

const char* nomeEstado() {
  return intensidade > 0 ? "on" : "off";
}

bool aplicarIntensidade(int percentual) {
  if (!pwmPronto || percentual < 0 || percentual > 100) return false;
  uint32_t duty = (percentual * 255 + 50) / 100;
  if (!ledcWrite(LED_PIN, duty)) return false;
  intensidade = percentual;
  if (percentual > 0) ultimaIntensidadePositiva = percentual;
  return true;
}

bool enviar(const char* json) {
  if (!socketPronto || !SamahiNetwork::ready()) return false;
  if (udp.beginPacket(SamahiNetwork::destination(), PORTA_NODE_RED) != 1) return false;
  udp.print(json);
  return udp.endPacket() == 1;
}

void receberTriagem(const String& id, const String& acao) {
  // Repeticao do ultimo comando devolve o mesmo ACK sem avancar novamente.
  if (id == ultimoRgbId) {
    if (acao == ultimaRgbAcao) enviar(ultimoRgbAck);
    return;
  }
  int alvo = -1;
  if (acao == "next") alvo = corConhecida ? (corAtual + 1) % NUM_CORES : 0;
  else {
    for (int i = 0; i < NUM_CORES; i++) if (acao == CORES[i].nome) alvo = i;
  }
  if (alvo < 0) return;
  bool aplicado = aplicarCor(alvo);
  snprintf(ultimoRgbAck, sizeof(ultimoRgbAck),
           "{\"type\":\"triage-ack\",\"source\":\"esp32-physical\","
           "\"deviceId\":\"ESP32-bancada\",\"commandId\":\"%s\","
           "\"status\":\"%s\",\"action\":\"%s\",\"triageColor\":\"%s\","
             "\"rgbControlVersion\":2,\"pins\":[16,17,18],\"gasAlarmActive\":%s}",
           id.c_str(), aplicado ? "applied" : "error", acao.c_str(), nomeCor(), alarmeGas.active ? "true" : "false");
  ultimoRgbId = id;
  ultimaRgbAcao = acao;
  enviar(ultimoRgbAck);
  Serial.println(ultimoRgbAck);
}

void receberComando() {
  int tamanho = udp.parsePacket();
  if (tamanho <= 0) return;
  // Restringir comandos ao PC configurado e a origem UDP do fluxo de bancada.
  if (!SamahiNetwork::accepts(udp.remoteIP()) || udp.remotePort() != PORTA_NODE_RED || tamanho > 100) {
    while (udp.available()) udp.read();
    return;
  }
  char buffer[101];
  int lidos = udp.read(buffer, sizeof(buffer) - 1);
  if (lidos <= 0) return;
  buffer[lidos] = '\0';
  String texto(buffer);
  // Luz: led:<id>:on|off|level:<0..100>; RGB: triage:<id>:next|<cor>.
  bool triagem = texto.startsWith("triage:");
  if (!triagem && !texto.startsWith("led:")) return;
  int inicioId = triagem ? 7 : 4;
  int separador = texto.indexOf(':', inicioId);
  if (separador <= inicioId) return;
  String id = texto.substring(inicioId, separador);
  if (id.length() > 48) return;
  for (size_t i = 0; i < id.length(); i++) {
    char c = id[i];
    if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') ||
          (c >= 'A' && c <= 'Z') || c == '-')) return;
  }
  String acao = texto.substring(separador + 1);
  if (triagem) { receberTriagem(id, acao); return; }
  int alvo;
  const char* tipoAcao;
  if (acao == "on") { alvo = ultimaIntensidadePositiva; tipoAcao = "on"; }
  else if (acao == "off") { alvo = 0; tipoAcao = "off"; }
  else if (acao.startsWith("level:")) {
    String valor = acao.substring(6);
    if (valor.length() < 1 || valor.length() > 3) return;
    for (size_t i = 0; i < valor.length(); i++) {
      if (valor[i] < '0' || valor[i] > '9') return;
    }
    alvo = valor.toInt();
    if (alvo > 100) return;
    tipoAcao = "level";
  } else return;

  bool aplicado = aplicarIntensidade(alvo);
  char resposta[340];
  snprintf(resposta, sizeof(resposta),
           "{\"type\":\"led-ack\",\"source\":\"esp32-physical\","
           "\"deviceId\":\"ESP32-bancada\",\"commandId\":\"%s\","
           "\"status\":\"%s\",\"action\":\"%s\",\"ledState\":\"%s\","
           "\"lightIntensityPercent\":%d,\"lastPositiveIntensity\":%d,\"gpio\":23,\"controlVersion\":2}",
           id.c_str(), aplicado ? "applied" : "error", tipoAcao,
           nomeEstado(), intensidade, ultimaIntensidadePositiva);
  if (!aplicado) {
    Serial.println("Falha PWM: comando nao confirmado como aplicado.");
  }
  enviar(resposta);
  Serial.println(resposta);
}

void lerDht() {
  if (millis() - ultimaLeituraDht < DHT_INTERVALO_MS) return;
  // As duas propriedades usam a mesma amostra em cache da biblioteca.
  float temperatura = dht.readTemperature();
  float umidade = dht.readHumidity();
  ultimaLeituraDht = millis();
  dhtLido = true;
  temperaturaValida = isfinite(temperatura) && temperatura >= -40 && temperatura <= 80;
  umidadeValida = isfinite(umidade) && umidade >= 0 && umidade <= 100;
  // Nunca reutilizar uma leitura antiga como atual quando houver falha.
  temperaturaC = temperaturaValida ? temperatura : NAN;
  umidadePercentual = umidadeValida ? umidade : NAN;
  if (!temperaturaValida || !umidadeValida) {
    Serial.println("DHT22: leitura invalida; conferir alimentacao, DATA GPIO4 e pull-up de 10k.");
  }
}

const char* estadoDht() {
  if (!dhtLido) return "waiting";
  if (temperaturaValida && umidadeValida) return "ok";
  if (temperaturaValida || umidadeValida) return "partial";
  return "error";
}

void lerGas() {
  if (millis() - ultimaLeituraGas < GAS_INTERVALO_MS) return;
  uint32_t soma = 0;
  for (int i = 0; i < GAS_AMOSTRAS; i++) soma += analogRead(GAS_PIN);
  gasRawAdc = (soma + GAS_AMOSTRAS / 2) / GAS_AMOSTRAS;
  ultimaLeituraGas = millis();
  gasLido = true;
}

const char* estadoGas() {
  if (!gasLido) return "waiting";
  if (gasRawAdc >= 4095) return "adc_saturated";
  if (GAS_LIMIAR_TESTE_ADC < 0) return "uncalibrated";
  return gasRawAdc >= GAS_LIMIAR_TESTE_ADC ? "above_test_threshold" : "below_test_threshold";
}

void iniciarOta() {
  ArduinoOTA.setHostname("samahi-esp32-bancada");
  ArduinoOTA.setPassword(OTA_SENHA);
  ArduinoOTA.onStart([]() {
    atualizando = true;
    // Suspender o ensaio enquanto a flash e atualizada; saídas apagadas.
    aplicarIntensidade(0);
    escreverRgb(COR_APAGADA);
    udp.stop();
    socketPronto = false;
    Serial.println("OTA: iniciando atualizacao; controles de bancada suspensos.");
  });
  ArduinoOTA.onEnd([]() { Serial.println("OTA: transferencia concluida; reiniciando."); });
  ArduinoOTA.onError([](ota_error_t erro) {
    atualizando = false;
    Serial.printf("OTA: erro %u; conferir autenticacao, rede e particoes.\n", (unsigned)erro);
  });
  ArduinoOTA.begin();
  otaPronto = true;
  Serial.print("OTA pronto: samahi-esp32-bancada em ");
  Serial.println(WiFi.localIP());
  Serial.print("OTA tambem disponivel no AP: "); Serial.println(WiFi.softAPIP());
}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  Serial.begin(115200);
  dht.begin();
  pinMode(GAS_PIN, INPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(GAS_PIN, ADC_11db);
  Serial.println("MQ-2: ADC GPIO34 via divisor 10k/10k. Comparacao depende de limiar experimental; nao mede ppm.");
  delay(1000);
  pwmPronto = ledcAttach(LED_PIN, PWM_FREQUENCIA, PWM_BITS);
  if (!aplicarIntensidade(0)) Serial.println("Falha ao iniciar PWM no GPIO 23.");
  // Tres canais adicionais; cada cor tem seu proprio resistor em serie.
  const int pinosRgb[] = {RGB_R_PIN, RGB_G_PIN, RGB_B_PIN};
  for (int pino : pinosRgb) {
    pinMode(pino, OUTPUT);
    digitalWrite(pino, RGB_ANODO_COMUM ? HIGH : LOW);
  }
  bool r = ledcAttach(RGB_R_PIN, PWM_FREQUENCIA, PWM_BITS);
  bool g = ledcAttach(RGB_G_PIN, PWM_FREQUENCIA, PWM_BITS);
  bool b = ledcAttach(RGB_B_PIN, PWM_FREQUENCIA, PWM_BITS);
  rgbPronto = r && g && b;
  if (!aplicarCor(COR_APAGADA)) Serial.println("Falha ao iniciar RGB; comando nao sera confirmado como aplicado.");
  SamahiNetwork::begin();
  Serial.println("Luz PWM: aguardando Wi-Fi. Ligar/desligar/intensidade pelo Node-RED.");
}

void loop() {
  if (!atualizando) { lerDht(); lerGas(); avaliarAlarmeGas(); atualizarIndicador(); }
  unsigned long agora = millis();
  if (!atualizando) SamahiNetwork::tick();
  static String interfacesAnteriores;
  String interfacesAtuais = WiFi.localIP().toString() + "/" + WiFi.softAPIP().toString();
  if (interfacesAtuais != interfacesAnteriores) {
    interfacesAnteriores = interfacesAtuais;
    udp.stop(); socketPronto = false;
    if (otaPronto) { ArduinoOTA.end(); otaPronto = false; }
  }
  if (!otaPronto) iniciarOta();
  ArduinoOTA.handle();
  if (atualizando) { delay(1); return; }
  if (!socketPronto) {
    socketPronto = udp.begin(PORTA_LOCAL) == 1;
    if (!socketPronto) { delay(20); return; }
    Serial.print("IP ESP32: "); Serial.println(WiFi.localIP());
    Serial.println("UDP 4211 pronto; telemetria para o PC na porta 4210.");
  }
  receberComando();
  if (agora - ultimoEnvio >= 2000) {
    ultimoEnvio = agora;
    char temperaturaJson[24] = "null";
    char umidadeJson[24] = "null";
    char idadeJson[24] = "null";
    if (temperaturaValida) snprintf(temperaturaJson, sizeof(temperaturaJson), "%.1f", temperaturaC);
    if (umidadeValida) snprintf(umidadeJson, sizeof(umidadeJson), "%.1f", umidadePercentual);
    if (dhtLido) snprintf(idadeJson, sizeof(idadeJson), "%lu", millis() - ultimaLeituraDht);
    char gasJson[24] = "null";
    char idadeGasJson[24] = "null";
    char limiarGasJson[24] = "null";
    const bool gasLimiarConfigurado = GAS_LIMIAR_TESTE_ADC >= 0;
    if (gasLido) {
      snprintf(gasJson, sizeof(gasJson), "%d", gasRawAdc);
      snprintf(idadeGasJson, sizeof(idadeGasJson), "%lu", millis() - ultimaLeituraGas);
    }
    if (gasLimiarConfigurado) snprintf(limiarGasJson, sizeof(limiarGasJson), "%d", GAS_LIMIAR_TESTE_ADC);
    const char* excedeuGas = gasLido && gasRawAdc < 4095 && gasLimiarConfigurado ?
        (gasRawAdc >= GAS_LIMIAR_TESTE_ADC ? "true" : "false") : "null";
    char mensagem[1400];
    int tamanho = snprintf(mensagem, sizeof(mensagem),
             "{\"type\":\"network-test\",\"source\":\"esp32-physical\","
             "\"deviceId\":\"ESP32-bancada\",\"sequence\":%lu,\"uptimeMs\":%lu,"
             "\"wifiRssiDbm\":%ld,\"ledState\":\"%s\",\"lightIntensityPercent\":%d,"
             "\"lastPositiveIntensity\":%d,\"gpio\":23,\"ledControl\":true,"
             "\"controlVersion\":2,\"pwm\":%s,\"rgbControlVersion\":2,"
             "\"rgbReady\":%s,\"triageColor\":\"%s\",\"rgbCommonAnode\":%s,"
             "\"dhtVersion\":1,\"dhtPin\":4,\"dhtStatus\":\"%s\",\"dhtSampleAgeMs\":%s,"
             "\"temperatureC\":%s,\"temperatureValid\":%s,"
             "\"humidityPercent\":%s,\"humidityValid\":%s,"
             "\"gasVersion\":1,\"gasSensor\":\"MQ-2\",\"gasPin\":34,\"gasAdcBits\":12,"
             "\"gasRawAdc\":%s,\"gasSampleAgeMs\":%s,\"gasAverageSamples\":16,"
             "\"gasStatus\":\"%s\",\"gasThresholdAdc\":%s,\"gasThresholdConfigured\":%s,"
             "\"gasTestThresholdExceeded\":%s,\"gasDividerNominalRatio\":0.5,"
             "\"firmwareVersion\":\"%s\",\"gasAlarmVersion\":1,\"gasAlarmActive\":%s,\"gasAlarmFault\":%s,"
             "\"gasClearThresholdAdc\":300,\"gasAlarmEvaluationMs\":2000,\"gasAlarmOnConfirm\":2,\"gasAlarmOffConfirm\":3,"
             "\"rgbVisibleColor\":\"%s\",\"rgbBlinking\":%s,\"rgbBlinkOn\":%s,\"rgbAlarmFallback\":%s}",
             ++sequencia, agora, (long)WiFi.RSSI(), nomeEstado(), intensidade,
             ultimaIntensidadePositiva, pwmPronto ? "true" : "false",
             (rgbPronto && corConhecida && rgbSaidaConhecida) ? "true" : "false", nomeCor(),
             RGB_ANODO_COMUM ? "true" : "false", estadoDht(), idadeJson,
             temperaturaJson, temperaturaValida ? "true" : "false",
             umidadeJson, umidadeValida ? "true" : "false", gasJson, idadeGasJson,
             estadoGas(), limiarGasJson, gasLimiarConfigurado ? "true" : "false", excedeuGas,
             FIRMWARE_VERSION, alarmeGas.active ? "true" : "false", alarmeGas.fault ? "true" : "false",
             rgbSaidaConhecida ? CORES[corVisivel].nome : "unknown",
             (alarmeGas.active && rgbSaidaConhecida) ? "true" : "false",
             (alarmeGas.active && rgbSaidaConhecida && corVisivel != COR_APAGADA) ? "true" : "false",
             (alarmeGas.active && corAtual == COR_APAGADA) ? "true" : "false");
    if (tamanho > 0 && (size_t)tamanho < sizeof(mensagem)) {
      enviar(mensagem);
      Serial.println(mensagem);
    } else Serial.println("Telemetria nao enviada: buffer insuficiente.");
  }
  delay(1);
}
