# Firmware do ESP32 físico

Este firmware integra a versão atual da maquete. Consulte [integração física](../../docs/integracao-esp-fisico.md), [rede AP/STA](../../docs/rede-esp-notebook.md) e [validação](../../docs/rede-esp-notebook-validacao.md). Use o cabo para a primeira gravação quando a placa ainda não tiver OTA configurado. Em instalações posteriores, use o caminho já validado na bancada.


Sketch atual: `samahi_esp32/samahi_esp32.ino`. Integra a bancada anterior com AP+STA e portal persistente de rede. Instruções, limites e roteiro de evidências no [guia operacional](../../docs/rede-esp-notebook.md).

Requer core Espressif 3.3.12, placa ESP32 Dev Module, partições com OTA e bibliotecas DHT sensor library / Adafruit Unified Sensor. Criar os três arquivos privados a partir dos exemplos: `wifi_config.h`, `ota_config.h`, `network_config.h`. Nunca versionar os arquivos reais ou os binários que contêm suas credenciais.

O caminho inicial para o notebook é o AP, destino inicial 192.168.4.2. O Wi-Fi de `wifi_config.h` é a configuração inicial da interface externa. Após o primeiro salvamento no portal, o registro NVS prevalece sobre esses valores. Alterar só o header não substitui um registro NVS já salvo.

A compilação não grava a placa. Para reverter, gravar o sketch anterior de bancada; o namespace `samahi-net` permanece no NVS, mas não é usado pelo firmware anterior. A próxima instalação deste firmware volta a carregar esse registro. As configurações do notebook e o banco do aplicativo são independentes.

## Interface da bancada

| Componente | Pino e uso |
| --- | --- |
| LED da iluminação | GPIO23, saída PWM |
| LED RGB | GPIO16 vermelho, GPIO17 verde, GPIO18 azul. Catodo comum e resistor em cada canal. |
| DHT22 | GPIO4, temperatura e umidade |
| MQ-2 | GPIO34, ADC1 de 12 bits. A saída A0 do módulo alimentado a 5 V passa pelo divisor antes do ADC. |

A pinagem corresponde ao [firmware desta revisão](samahi_esp32/samahi_esp32.ino). A revisão 2 do diagrama da protoboard registra a montagem de bancada. Uma alteração física de cabeamento deve ser registrada no diagrama e comparada com a pinagem antes de energizar. A frequência PWM, as versões dos ACKs e as configurações de UDP estão no sketch.

O [alarme local](samahi_esp32/gas_alarm.h) usa duas avaliações consecutivas de pelo menos 500 ADC para entrar em alerta e três de até 300 ADC para sair. A avaliação ocorre a cada 2 s. Esses valores são limiares experimentais da bancada. Falha de leitura não encerra um alerta ativo. O indicador alterna a cada 300 ms, preserva a classificação escolhida e usa amarelo temporário se ela estiver apagada.
