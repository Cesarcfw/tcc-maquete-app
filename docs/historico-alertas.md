> **Situação atual:** recurso incluído no código 0.6.0 e no [APK registrado](apk-v0.6.0.md). Ensaios abaixo são registros da etapa de implementação; aceite completo do APK instalado e integração física permanecem separados. Consulte o [índice atual](README.md).

# Histórico de falhas e alertas

## Problema e correção

César observou que gás não aparecia em Falhas / alertas e que interromper o ESP virtual não gerava evento no histórico. O gás já era persistido como mudança de estado, mas o cliente classificava todas essas mudanças como informação. A disponibilidade era mostrada no painel sem registro persistente.

## Classificação atual

| Evento | Categoria no histórico |
| --- | --- |
| Gás detectado | Falha / alerta |
| Leitura de gás indisponível | Falha / alerta |
| Comunicação perdida | Falha / alerta |
| Amostra com idade de 10 segundos ou mais | Falha / alerta |
| Comando sem confirmação | Falha / alerta |
| Gás sem detecção | Informação |
| Comunicação restabelecida com leitura recente | Informação |
| Comando confirmado pelo serviço | Confirmação |

Registros antigos de gás que tenham `detail.current` são classificados corretamente ao serem lidos; não é necessário reescrever a auditoria. Quedas anteriores não registradas não podem ser reconstruídas.

## Persistência e limites

A tabela aditiva `room_connection_state` guarda o último estado observado por quarto no SQLite. É criada ao iniciar o backend atualizado, sem apagar contas, permissões ou histórico. Transações `BEGIN IMMEDIATE` unem o registro de evento e a mudança de estado, evitando duplicação por consultas/clientes/instâncias que compartilhem o banco. Reiniciar o backend não reinicia a deduplicação.

Eventos são observados nas consultas autorizadas à telemetria. O app consulta aproximadamente a cada 2 segundos; falhas de transporte podem aguardar até o timeout do serviço. Se apenas o gerador parar e a API continuar respondendo, a falta de atualização é registrada como leitura antiga quando a idade atingir 10 segundos. Se a API não responder, é registrada perda de comunicação.

Não é um monitoramento contínuo em segundo plano: sem consultas não há coleta. Se o próprio backend estiver desligado ou inacessível, não consegue gravar a própria queda nem servir histórico ao telefone. A recuperação é referente a uma falha anteriormente observada pelo backend.

Uma leitura antiga não produz nova detecção de gás nem substitui a última leitura válida no banco. O app continua bloqueando controles e preservando o estado reportado quando não há confirmação. Gás e Manchester permanecem independentes.

O campo actor identifica a conta cuja consulta observou a transição, não uma pessoa responsável pela falha ou pelo gás.

## Como validar

1. Reiniciar o backend atualizado e recarregar o app web/Expo Go desta branch. Um APK antigo precisa ser recompilado para receber a nova classificação.
2. Com o quarto sendo consultado, provocar gás no Node-RED e verificar Falhas / alertas.
3. Retirar gás; conferir o retorno em Todos / Informações.
4. Parar só a atualização de leituras: aguardar idade de 10 segundos e conferir Leitura do ambiente desatualizada.
5. Parar a API/serviço do ambiente mantendo backend e app ativos: conferir Comunicação perdida.
6. Retomar leituras recentes: conferir Comunicação restabelecida em Todos / Informações.
7. Repetir consultas e reabrir o app: o mesmo estado não deve gerar várias ocorrências.

**TIRE PRINT DESTA PARTE:** filtro Falhas / alertas com gás e perda de comunicação; linha do tempo com recuperação.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** leitura normal → gás → retirar detecção → interromper serviço → retomar → histórico, indicando origem virtual no registro acadêmico.

## Verificação técnica

- 15 testes de domínio/apresentação: inclui categorias de gás, indisponibilidade, desconexão, leitura antiga e recuperação.
- 3 suítes do backend: permissões/persistência, fluxo nativo e monitoramento. A nova suíte interrompe um servidor HTTP local, repete consultas, reinicia o backend com o mesmo banco e valida eventos sem duplicação.
- Amostra antiga não cria detecção nova nem sobrescreve a última leitura válida.
- Lint, tipos e exportação web aprovados. No navegador, gás e comunicação perdida apareceram no filtro Falhas / alertas com banco/serviço descartáveis; captura em docs/evidencias/historico-alertas/.
