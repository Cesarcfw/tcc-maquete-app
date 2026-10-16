# Iluminação: modos Dia e Noite

## Decisão de César

Substituir o automático por luminosidade/LDR por dois períodos diários, cada um com início e intensidade configuráveis pelo aplicativo, no horário de Brasília. LDR permanece na telemetria; não decide mais quando ligar ou apagar a luz no serviço atual.

## Comportamento

- Dia começa no horário definido e permanece até o início de Noite. Noite permanece até o próximo Dia, incluindo a passagem pela meia-noite.
- Cada intensidade é um inteiro de 0 a 100%. Zero apaga; não equivale a lux.
- Horários em HH:mm (00:00–23:59), diferentes entre si. Ambos podem ser alterados; intervalos que cruzam meia-noite são aceitos.
- Valores iniciais editáveis: Dia 07:00/100%, Noite 19:00/20%. Na primeira execução a luz permanece manual até ativação explícita.
- Salvar e ativar envia um comando. Campos e modo operacional só são tratados como confirmados após o serviço responder com o mesmo ID, configuração e modo.
- Ligar/desligar, slider e atalhos manuais pausam a programação. Ela permanece pausada até Ativar horários; uma troca de período não cancela a decisão manual.
- Pausar programação mantém a intensidade atual. Retomar aplica imediatamente o período correspondente ao horário atual.
- Gás, reconhecimento, buzzer e Manchester continuam independentes da iluminação.

## Onde roda

O Node-RED continua com ESP virtual; a regra está em integration/node-red/simulator.cjs e é executada pelo nó periódico existente, aproximadamente a cada 2 segundos. Não exige app aberto ou backend ativo para virar o período. Exige Node-RED e computador em execução; computador suspenso/desligado não executa automações. Ao retomar/reiniciar, aplica o período atual, sem reproduzir mudanças intermediárias.

O cálculo usa Date.now e Intl.DateTimeFormat com timeZone America/Sao_Paulo e hourCycle h23. Portanto, não usa o fuso selecionado no telefone nem o fuso padrão do computador. O relógio do computador precisa estar correto/sincronizado; escolher o fuso não corrige um relógio errado. Não há consulta ao Observatório Nacional a cada execução.

A função comum de validação/cálculo está em shared/lighting-schedule.cjs, com tipos em lighting-schedule.d.cts. O app compartilha a validação, mas não é a autoridade da hora nem aplica a luz localmente.

## Autorização e contrato

Usa o endpoint autenticado existente POST /api/rooms/:roomId/commands e requer concessão de **controle de iluminação**. Leitura permite consultar horários, sem alterá-los.

```json
{
  "commandId": "app-id-unico",
  "command": {
    "kind": "lightingSchedule",
    "enabled": true,
    "schedule": {
      "timeZone": "America/Sao_Paulo",
      "dayStart": "07:00",
      "nightStart": "19:00",
      "dayIntensity": 100,
      "nightIntensity": 20
    }
  }
}
```

enabled false pausa. A confirmação segue status applied_in_simulator e inclui telemetria com lightMode (manual/scheduled), lightingSchedule e lightingPeriod (day/night/null), além do estado real do serviço. O backend confere configuração e modo retornados antes de registrar sucesso. Erro de gravação/ACK incompatível não aparece como configuração aplicada.

O comando antigo automatic não é mais aceito. Clientes antigos que tentarem usar LDR precisam ser atualizados. O app novo mostra programação indisponível se a telemetria ainda não oferecer os campos necessários. Isso exige atualizar/reiniciar o serviço, não fabricar uma confirmação.

O serviço virtual atual atende somente quarto-01. Cadastrar outro quarto não cria um segundo dispositivo/scheduler.

## Persistência e transferência

Na instância usada pelo Node-RED, modo, configuração, intensidade e última intensidade positiva são gravados atomicamente em **backend/data/node-red-lighting.json**, excluído de Git e EAS. A variável SAMAHI_NODE_RED_STATE_FILE pode definir outro caminho. Arquivo inválido interrompe a carga com erro, sem ativar silenciosamente valores padrão.

Sensores e cenários continuam em memória. O comando de reset do serviço persistente preserva a configuração da luz. createSimulator sem storage é usado apenas por ensaios descartáveis.

SQLite continua guardando contas, ambientes, concessões, auditoria e comandos enviados/confirmados. O arquivo operacional permite ao Node-RED continuar programando com o backend desligado. O script backend/backup.mjs também copia node-red-lighting.json, quando existe, além do banco e auth-secret.

Para transferir ao notebook: parar Node-RED/backend, gerar o backup, restaurar banco/segredo/configuração nos respectivos caminhos e iniciar os serviços. Se usar caminho personalizado, fornecer a mesma variável para Node-RED e backup. Não versionar arquivos de execução ou segredos.

## Atualização e ensaio

1. Reiniciar Node-RED e backend para carregar a versão desta branch. O fluxo existente não exige novos nós/pacotes.
2. Recarregar web/Expo Go atualizado. APK já instalado exige nova compilação; não foi recompilado nesta etapa.
3. No quarto, abrir Iluminação → Modos Dia e Noite. Alterar os quatro campos e salvar/ativar.
4. Conferir modo atual, intensidade retornada e histórico de confirmação.
5. Configurar uma troca para poucos minutos à frente em Brasília e deixar o app fechado; reabrir após o horário e conferir o novo período.
6. Usar intensidade manual, aguardar outra troca e conferir que permanece manual; reativar horários para retomar.
7. Reiniciar Node-RED e conferir horários/modo preservados. Testar 0%, horários iguais/invalidos e conta sem controle.
8. Mudar LDR no Node-RED: a leitura pode mudar, mas não deve determinar a luz.

**TIRE PRINT DESTA PARTE:** formulário confirmado, modo Dia/Noite, intensidade e horário de Brasília; indicação de manual após intervenção.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** programar → virar período com app fechado → manual → reativar → reiniciar serviço. Na monografia, identificar fonte virtual e não confundir validação web com APK/hardware físico.

## Verificação e pendências

- Lint, tipos, 18 testes de domínio/serviço e 3 suítes do backend aprovados; exportação web concluída.
- Navegador isolado: horários iguais bloqueados, Dia 07:00/80% e Noite 19:00/15% confirmados; período Noite aplicado em 15%, manual em 25% pausou programação e reativação retomou o período. Configuração recuperada após recarregar o app. Desktop e viewport mobile 390 × 844 conferidos; capturas em docs/evidencias/modos-dia-noite/.

- Testes com relógio injetado: limites de Dia/Noite, madrugada e intervalo invertido; 0%, pausa manual, LDR independente e gás/Manchester preservados.
- Persistência em arquivo temporário e reinício; falha de gravação sem mudança do estado confirmado.
- Backend: permissões, rejeição de configuração inválida e de ACK sem configuração/mode aplicados; fluxo nativo com ativação de horários.
- Revisão/ensaio de César, novo APK e integração física com Gabriel permanecem pendentes. O firmware físico deverá respeitar a autoridade dos comandos/programação; não manter uma regra antiga de LDR concorrendo com ela.

## Referências

- [Observatório Nacional — fusos horários adotados no Brasil](https://www.gov.br/observatorio/pt-br/assuntos/areas-de-atuacao/tempo-e-frequencia/brasil).
- [MDN — Intl.DateTimeFormat: timeZone e hourCycle](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat).
