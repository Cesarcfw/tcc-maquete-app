# Firmware do ESP32 físico

Sketch atual: `samahi_esp32/samahi_esp32.ino`. Integra a bancada anterior com AP+STA e portal persistente de rede. Instruções, limites e roteiro de evidências no [guia operacional](../../docs/rede-esp-notebook.md).

Requer core Espressif 3.3.12, placa ESP32 Dev Module, partições com OTA e bibliotecas DHT sensor library / Adafruit Unified Sensor. Criar os três arquivos privados a partir dos exemplos: `wifi_config.h`, `ota_config.h`, `network_config.h`. Nunca versionar os arquivos reais ou os binários que contêm suas credenciais.

O caminho inicial para o notebook é o AP, destino inicial 192.168.4.2. O Wi-Fi de `wifi_config.h` é a configuração inicial da interface externa. Após o primeiro salvamento no portal, o registro NVS prevalece sobre esses valores. Alterar só o header não substitui um registro NVS já salvo.

A compilação não grava a placa. Para reverter, gravar o sketch anterior de bancada; o namespace `samahi-net` permanece no NVS, mas não é usado pelo firmware anterior. A próxima instalação deste firmware volta a carregar esse registro. As configurações do notebook e o banco do aplicativo são independentes.
