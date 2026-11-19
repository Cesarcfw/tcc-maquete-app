# Integração do app com o ESP físico

Preparação de 19/11/2026, branch feat/integracao-esp-fisico. Usa autenticação/permissões existentes e separa origem física da simulação. A edição offline do orientador permanece independente e não controla hardware. O APK anterior não recebe estas alterações automaticamente.

## Arquitetura

App -> backend autenticado -> API HTTP local do Node-RED -> ponte física -> UDP/ACK do ESP. Telemetria percorre o caminho inverso a partir do UDP 4210 da bancada. O nó reutiliza a saída UDP existente, com origem 4210 e destino 4211, preservando o filtro de IP/porta do firmware.

Identidade: quarto-01 / ESP32-bancada. Firmware, nó da ponte e cadastro do backend precisam concordar. source esp32-physical é mantido até o app; falha nunca provoca fallback para o simulador. O gravador SQLite da bancada continua conectado antes do JSON, salvando texto bruto/ACKs. O backend guarda contas, permissões, eventos e última leitura; a série completa permanece no banco separado da bancada.

## Funções

| Função | Implementação |
| --- | --- |
| DHT22 | Temperatura/umidade reais com flags e idade; leitura inválida vira null/Indisponível |
| MQ-2 | ADC, limites experimentais, alerta latched e falha reportados pelo firmware |
| Luz | Ligar/desligar e intensidade 0–100%, após led-ack correspondente |
| Triagem | Quatro cores/apagado, após triage-ack correspondente |
| Pisca por gás | Cor escolhida separada da cor visível; amarelo temporário quando triagem apagada |
| Reconhecer gás | Reconhecimento só no app; não envia comando para silenciar/desligar o alerta local |
| Dia/Noite | Executado pelo Node-RED em America/Sao_Paulo e aplicado por PWM com ACK |

A agenda física persiste em data/physical-lighting.json da instância. Node-RED precisa permanecer ligado. A cada 2 s confere período/alvo e envia apenas quando a intensidade reportada diverge. Ao reiniciar, espera telemetria recente antes de aplicar. Comando manual confirmado pausa a agenda. Falha ao enviar/aplicar/salvar não vira confirmação positiva; erro de agenda aparece no app. Não foi adicionada agenda autônoma ao firmware.

Firmware antigo sem gasAlarmVersion/limiares válidos permite mostrar ADC, mas o monitoramento aparece não configurado/indisponível. ADC baixo não substitui gasAlarmActive. Alerta ativo continua detectado quando o firmware reporta falha do MQ-2; a falha aparece separadamente. A ponte não fabrica o pisca: o ESP precisa do firmware preparado na bancada com a política local.

## Confirmação e falhas

- IDs do app são mapeados a um ID UDP aleatório p- com 24 dígitos hexadecimais, dentro do limite do parser do ESP.
- Uma pendência por ponte. ACK precisa coincidir com IP/porta, dispositivo, ID, ação, versão, pinos e valor solicitados. Enviar UDP não comprova aplicação.
- Timeout de 3 s retorna 504 e não altera estado por previsão. Telemetria posterior pode indicar que algo foi aplicado sem ACK, sem confirmar retroativamente o pedido perdido.
- Luz/triagem/agenda: applied_in_hardware com confirmationScope firmware_ack e wireCommandId. Confirmação de software/PWM relatada pela placa, não medição óptica.
- Reconhecer gás: acknowledged_in_gateway com confirmationScope app-only. A sinalização local continua enquanto o ESP mantiver o alerta.
- Simulação mantém applied_in_simulator. O contrato comum recusa essa confirmação quando a origem é física.
- Sem pacote inicial: 503. Após 10 s sem novo pacote, leitura fica antiga e comandos são bloqueados. A idade dos sensores soma sua idade no pacote à idade da recepção. Duplicatas não renovam artificialmente a conexão.
- Pacotes fora de ordem são rejeitados. Sem bootId no contrato de bancada, redução de uptime só é aceita após janela sem leitura recente; um reboot pode levar 10 s para ser retomado. Isso não é proteção criptográfica contra replay.
- IP não muda enquanto o dispositivo anterior estiver recente. UDP continua sem autenticação ou garantia de entrega; usar na rede de desenvolvimento.

O backend revalida concessões e omite campos por grupo. Ler indicador/estado de pisca não concede leitura de ADC ou reconhecimento de gás. Audit diferencia comando físico confirmado de reconhecimento apenas no app.

## Ativação na instalação local

Pré-requisitos: Node.js 24.15+ da série 24, Node-RED 5.0.8 na pasta irmã samahi-node-red, Python 3 e banco do app já inicializado. Não repetir setup sobre instalação com contas.

1. Salvar edições e reiniciar Node-RED para carregar o tipo novo. O settings local usa nodesDir com samahi-node-red/nodes e tcc-maquete-app/integration/node-red/nodes. Se copiar settings.example.cjs, ajustar caminhos ao local onde ele for instalado.
2. Executar **Preparar-ESP-Fisico.cmd** na raiz do app. Gera rotas, instala com revisão da API (ou em arquivo com serviço desligado), faz backup e vincula o quarto. Se o processo aberto não carregou o tipo novo, interrompe sem mudar os fluxos e pede reinício.
3. O instalador desativa a aba virtual para evitar rotas duplicadas, preserva seus nós e acrescenta a API física. Mantém controles e histórico da bancada, adicionando somente o fio UDP da ponte e sua saída para o UDP out existente. Não cria outro socket na porta 4210.
4. O helper do backend troca apenas o vínculo padrão ESP32-quarto-01 para ESP32-bancada. Vínculo personalizado provoca recusa e deve ser configurado pelo administrador. Faz snapshot antes da alteração, preserva contas/concessões/audit e limpa apenas caches de última leitura/conexão do quarto. Reexecutar no vínculo correto é inofensivo.
5. Iniciar Node-RED, backend e Expo/web pelos comandos existentes; reiniciar backend antigo para carregar o código novo. O telefone aponta para o IP LAN/porta do **backend**, não para o editor Node-RED.

A primeira telemetria real precisa chegar antes do app apresentar conexão. Conferência local da API: http://127.0.0.1:1880/api/v1/rooms/quarto-01/telemetry. Editor/API Node-RED ficam em 127.0.0.1, atrás do backend para o celular. Acesso remoto por Vercel/túnel não foi configurado aqui.

O instalador exige os IDs existentes esp32wifi12udp/esp32led14out da bancada e recusa outra instância. Em outro PC, copiar/recriar a bancada local e configurar nodesDir antes de executá-lo. Arquivos de runtime, credenciais e bancos não vão no Git. O diretório do nó físico e a API gerada ficam versionados.

Para reverter, parar Node-RED, preservar registros recentes e restaurar o backup do fluxo. Revalidar o dispositivo do quarto para o modo escolhido pela administração; não restaurar todo o banco de contas apenas para trocar o vínculo. A edição offline do orientador não exige reversão desses arquivos.

## Validação e evidências

Na instalação local de César, a API física recebeu telemetria real em 19/11/2026: 29,3 °C, 53,3% de umidade e 106 ADC, com origem esp32-physical e vínculo quarto-01/ESP32-bancada. Foi uma consulta de leitura; não comprova o acionamento dos LEDs pelo aplicativo. Fluxos e banco foram preservados com backup antes da ativação. O aceite de comandos no conjunto app/placa e a validação móvel desta alteração permanecem pendentes.

Testes locais cobrem ausência de leitura, DHT inválido/null, alerta mantido abaixo do disparo, seleção apagada versus amarelo visível, reconhecimento só no app, ACK/IP/pinos/valor, timeout, agenda, permissões e vínculo com backup. O teste de Node-RED isolado usa HTTP/UDP reais em loopback e ESP sintético; não envia pacotes à placa real nem mistura dados no banco de bancada. Isso verifica software/transporte, não emissão de LED ou instalação Android.

Resultado desta preparação: tipagem, lint, 31 testes do cliente/domínio, quatro testes HTTP do backend, exportação web e verificação das referências locais aprovados. O ensaio isolado de Node-RED também passou. A interface web foi conferida em 390 × 844 e 1440 × 1000 com conta/banco e ESP sintéticos: DHT inválido, comando de luz confirmado, alerta, reconhecimento e retorno ao painel, sem erros de página. Essas capturas não são evidência da placa física.

Comandos de verificação: `npm run typecheck`, `npm test`, `npm run lint`, `npm run docs:check` e `npm run export:web` na raiz; `npm test` na pasta backend. Para o transporte isolado, executar `node --test integration/node-red/physical-runtime.test.cjs` com a instalação irmã de Node-RED disponível. Portas temporárias de loopback precisam estar liberadas no ambiente de teste.

**TIRE PRINT DESTA PARTE:** source esp32-physical/IDs coincidentes na API, valores reais/flags, painel DHT/ADC e ACK correlacionado ao comando do app. Capturas com dados sintéticos servem somente para avaliação visual.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** no app autenticado, luz 25/75%, desligar/religar, triagem e LED; alerta mantendo a classificação com amarelo temporário quando apagada; reconhecer aviso sem parar o sinal local; queda/retorno de comunicação sem confirmação falsa. Registrar web e APK/Expo Go separadamente, sem senhas/configurações privadas.

## Referências

- [Node-RED: nós, mensagens e encerramento](https://nodered.org/docs/creating-nodes/node-js)
- [Node-RED: deploy com revisão](https://nodered.org/docs/api/admin/methods/post/flows/)
- [Espressif: ADC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)
- [Winsen: MQ-2](https://www.winsen-sensor.com/sensors/combustible-sensor/mq2.html)
- [API](api/README.md), [modelo de dados](modelo-dados.md) e [instalação](instalacao-configuracao.md).
