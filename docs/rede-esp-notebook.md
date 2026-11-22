# Rede do ESP e operação pelo notebook

Decisão de César em 22/11/2026. Firmware candidato `samahi-ap-sta-2026.11.22`, branch `feat/rede-esp-notebook`, sobre `feat/apk-v0.7.0`. A versão instalada na placa não muda até uma gravação ser concluída.

## Organização

O ESP32 mantém um ponto de acesso (AP, Access Point) protegido e também pode conectar-se a outro Wi-Fi como cliente (STA, Station). O notebook executa Node-RED e backend autenticado com banco SQLite. O APK integrado é o controle geral e acessa o backend. Nenhum serviço foi transferido para o telefone ou para o ESP.

`App → backend do notebook → Node-RED local → UDP/ACK do ESP`

O rádio AP+STA não faz roteamento/NAT entre as duas redes. Para este procedimento, notebook e telefone usam a mesma rede: ambos no AP do ESP ou ambos no Wi-Fi externo. Manter o AP habilitado não faz um telefone no AP alcançar automaticamente um notebook no Wi-Fi externo.

## Arquivos

- Firmware: [samahi_esp32.ino](../integration/esp32/samahi_esp32/samahi_esp32.ino).
- Portal/configuração: [network_manager.h](../integration/esp32/samahi_esp32/network_manager.h).
- Inicializador para APK instalado: [Iniciar-SAMAHI-Notebook.cmd](../Iniciar-SAMAHI-Notebook.cmd).
- O iniciador anterior [Iniciar-App-Integrado.cmd](../Iniciar-App-Integrado.cmd) continua oferecendo Expo Go.
- [Integração física](integracao-esp-fisico.md), [instalação](instalacao-configuracao.md) e [operação/backup](operacao.md).

## Preparar e gravar o firmware

1. Abrir a pasta `integration/esp32/samahi_esp32` na Arduino IDE. Selecionar **ESP32 Dev Module**, core Espressif **3.3.12**, partições padrão com OTA (Over-The-Air, atualização pela rede). Manter DHT sensor library e Adafruit Unified Sensor já usados na bancada.
2. Em outro computador, criar `wifi_config.h`, `ota_config.h` e `network_config.h` a partir dos `.example`. Os três arquivos reais são privados e ignorados pelo Git. Neste PC foram copiadas as credenciais anteriores e gerada uma senha exclusiva para o AP; não foram publicadas.
3. Em `network_config.h`, `AP_NOME` é o nome da rede e `AP_SENHA` sua senha (12 a 63 caracteres). A mesma senha protege o portal com usuário **admin**. Consultar o arquivo local em particular; não fotografar nem publicar.
4. Gravar pela porta de rede já disponível usando a senha OTA anterior, ou pelo procedimento USB que já funciona nesta placa. A primeira gravação ainda usa a conexão da versão anterior. Não foi feito upload automaticamente nesta etapa.
5. Abrir Monitor Serial a **115200**. Conferir a rede própria, IP do portal, IP externo e IP destino do notebook. O console não imprime senhas.

A pinagem foi preservada: iluminação GPIO23; RGB16/17/18; DHT22 GPIO4; MQ-2 GPIO34. O pisca do alerta de gás continua no firmware. A agenda Dia/Noite continua no Node-RED e depende do notebook ligado. Telemetria mantém contrato e firmwareVersion identifica a versão nova.

## Usar a rede própria do ESP

1. Ligar o ESP e conectar notebook e telefone à rede **SAMAHI-Bancada**, usando a senha de `network_config.h`. Aceitar permanecer no Wi-Fi sem internet.
2. No notebook, executar **Iniciar-SAMAHI-Notebook.cmd**. Escolher a interface do Wi-Fi do ESP, caso apareça uma lista. É necessário ter as dependências instaladas e o administrador configurado; não cria contas nem apaga dados.
3. O console informa, por exemplo, **COLOQUE NO APP: http://192.168.4.2:3002**. O endereço é um exemplo: usar o IP exibido na execução. Também aparece o IP sem porta a ser colocado no portal do ESP.
4. Abrir `http://192.168.4.1/` no navegador. Entrar como **admin**. Escolher **Rede propria do ESP** e preencher **IP do notebook na rede do ESP** com o IP mostrado no console. Salvar. O padrão inicial é esse caminho com notebook em 192.168.4.2, mas DHCP pode atribuir outro IP.
5. No APK integrado, em **Configurar conexão**, informar a URL completa do console. Confirmar `/health` no navegador do telefone e entrar com a conta real.
6. Se o acesso estiver bloqueado no Windows, executar **Liberar-Acesso-App.cmd** como administrador após escolher a rede. O script libera backend TCP3002, Expo TCP8082 e telemetria UDP4210 somente para o Node e interface/sub-rede selecionados. Não desliga o firewall nem expõe o editor Node-RED.

Node-RED continua em `http://127.0.0.1:1880` no notebook. O inicializador tenta reutilizar a instância SAMAHI existente ou inicia a instalação irmã `../samahi-node-red`. Ctrl+C encerra somente os serviços que o iniciador abriu. No modo APK, não abre Metro/Expo; não requer nova build do aplicativo apenas para mudar a rede.

Pressionar **Enter** no console do iniciador mostra novamente a URL. O backend também imprime a URL ao iniciar diretamente, considerando a porta e o endereço de escuta reais. Se iniciado em loopback, informa que o acesso é restrito ao computador. Para conferir só a escolha de rede sem abrir serviços: `node scripts/test-phone.mjs --apk --prepare --host IP_DO_NOTEBOOK`.

## Configurar e usar Wi-Fi externo

1. Pelo portal do ESP, preencher o nome exato e a senha do Wi-Fi **2,4 GHz**. Deixar a senha vazia mantém a anterior; ao mudar o nome da rede, é preciso informar a nova senha ou marcar rede aberta. Nome vazio desativa apenas a conexão externa.
2. Escolher **Wi-Fi externo** como caminho para o notebook. Conectar notebook e telefone a esse Wi-Fi e reiniciar o iniciador para obter a URL dessa interface.
3. Preencher **IP do notebook no Wi-Fi externo** no portal e salvar. O portal também pode ser aberto pelo IP externo do ESP enquanto essa conexão estiver disponível. O AP permanece habilitado.
4. Alterar a URL no app para o endereço novo do notebook. O app já persiste esse valor.

SSID, senha, caminho escolhido e dois IPs do notebook são salvos como um único registro em NVS (Non-Volatile Storage, armazenamento não volátil). O ESP tenta reconectar o Wi-Fi externo a cada 20 s. Não troca automaticamente o destino para outro computador; o caminho do notebook é uma seleção explícita. Se o Wi-Fi externo falhar, entrar no AP e escolher esse caminho no portal.

AP e STA compartilham um rádio e canal; uma conexão externa pode causar reassociação dos clientes AP. Se a sub-rede externa conflitar com o AP, o firmware tenta mudar o AP para outra sub-rede privada e informa o novo endereço no Serial. Reconectar os clientes e atualizar o IP do notebook no portal; não presumir que o IP anterior continua válido.

## Endereços e limites

| Endereço/porta | Uso |
|---|---|
| IP do ESP, HTTP80 | Portal de configuração de rede |
| IP do notebook, TCP3002 | Backend usado pelo app neste iniciador |
| 127.0.0.1:1880 no notebook | Editor/API do Node-RED, sem exposição ao telefone |
| Notebook UDP4210 / ESP UDP4211 | Telemetria, comandos e ACKs |

O IP obtido por DHCP pode mudar. Após trocar de rede ou receber IP novo, reiniciar o iniciador, conferir a URL, ajustar o destino no portal e atualizar a regra de firewall se necessário. O backend fica ligado ao IP escolhido; não promete migração automática enquanto está rodando.

O AP não fornece internet. Para abrir o Vercel é necessária conectividade externa; o APK instalado e as dependências já preparadas permitem a operação local. O portal usa HTTP com autenticação Basic e token de formulário contra requisições cruzadas, sem TLS; operar em rede controlada. Credenciais NVS não são declaradas criptografadas. O protocolo UDP anterior continua sem autenticação criptográfica; a restrição a IP/porta não equivale a identidade segura. O portal não oferece rotas para controlar GPIOs nem substitui contas/permissões do aplicativo.

## Validação e evidências

Ver o [registro de verificação](rede-esp-notebook-validacao.md) antes de afirmar sucesso físico. Compilar firmware não comprova Wi-Fi/OTA nem persistência na placa. O firmware anterior de bancada foi preservado fora do repositório para reversão.

- **TIRE PRINT DESTA PARTE:** console com URL real e interface selecionada; portal salvo sem senha; versão do firmware e telemetria física.
- **MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** ligar tudo sem internet, login, DHT/MQ-2, luz on/off/intensidade e triagem com ACK; reiniciar o ESP e confirmar persistência; usar AP enquanto STA conectado; desligar o roteador e reconfigurar pelo AP; trocar de rede e atualizar IPs. Registrar alerta local mesmo sem notebook e a agenda voltando ao ligá-lo.
- Testar separadamente senha incorreta, formulário sem token, IP inválido, falha de Wi-Fi e reinício. Não usar esses resultados como evidência antes de executá-los na placa.

## Referências primárias

- [Espressif — API Wi-Fi do Arduino ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html).
- [Espressif — modos Wi-Fi AP/STA](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/network/esp_wifi.html).
- [Espressif — Preferences/NVS](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/preferences.html).
