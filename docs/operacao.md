# Operação, backup e solução de problemas

## Iniciar e encerrar

Siga [instalação](instalacao-configuracao.md) para PC e [telefone](teste-app-integrado.md) para LAN. São três processos: frontend/Metro, backend e Node-RED. A porta da interface não é o endereço da API.

Use Ctrl+C no terminal que iniciou o serviço. O iniciador de telefone encerra somente os filhos que abriu; Node-RED já existente é preservado. Não finalize todos os processos `node.exe` para liberar uma porta: isso pode encerrar ferramentas da equipe. Identifique PID, comando e proprietário antes de agir.

## Saúde e diagnóstico

```powershell
Invoke-RestMethod http://127.0.0.1:3001/health
Invoke-RestMethod http://127.0.0.1:1880/api/v1/rooms/quarto-01/telemetry
Get-NetTCPConnection -State Listen | Where-Object LocalPort -In 1880,3001,3002,8081,8082
```

Health só verifica resposta do backend. Para saúde funcional, login, quarto acessível, leitura recente e comando confirmado. Não há endpoint agregado de prontidão, métricas ou tracing distribuído.

| Sintoma | Conferir |
| --- | --- |
| Porta em uso | PID e serviço já ativo; reutilizar serviço correto ou encerrar somente sua instância |
| Login abre mas quarto não atualiza | Node-RED, fluxo implantado, global samahi, cenário e identidade do dispositivo |
| `/health` abre no PC e não no telefone | IP privado correto, bind do backend, mesma rede, isolamento Wi-Fi e regra específica do firewall |
| Origem não autorizada (403) | Origem exata do web em SAMAHI_ORIGINS; reiniciar backend após configurar |
| Conta entra mas controle não aparece | Concessões do grupo e quarto ativo; admin também precisa de concessão operacional |
| Comando falha/409 | Leitura antiga, quarto inativo, commandId repetido não confirmado ou corpo diferente |
| Comando sem confirmação/5xx | Node-RED, cenário timeout, resposta inválida ou falha de gravação da luz; preservar último estado |
| Histórico não mostra período offline | Sem consulta não há observação; queda antes de chegar ao backend também não gera evento ali |
| Horário incorreto | Relógio do computador, agenda HH:mm, timezone fixo, modo manual/ativado, tick ativo |
| Endereço volta ao anterior | Campo inválido não é salvo; verificar aviso de armazenamento e preferência da mesma origem/aparelho |
| Node-RED falha ao iniciar após restore | Caminho do require, arquivo de luz válido, permissões e versão do shared |
| Vercel abre interface mas não conecta | Cliente público e backend local separados; política de navegador e rede; [guia Vercel](publicacao-vercel.md) |

## Backup

Para copiar um conjunto estável ao notebook, encerre os processos de backend e Node-RED antes da operação. Na raiz do repositório:

```powershell
npm --prefix backend run backup
```

O script usa `VACUUM INTO` para obter uma cópia consistente do SQLite, inclusive quando WAL está ativo. Cria pasta datada em `backend/backups/`, com `samahi.sqlite`, `auth-secret` e `node-red-lighting.json` quando existente. Esses arquivos contêm dados sensíveis: mantenha fora do Git e em local privado. O script não compacta, criptografa nem copia o código/fluxos.

`SAMAHI_DATA_DIR` personalizado deve apontar para os mesmos dados usados pelo servidor. Se o Node-RED usa `SAMAHI_NODE_RED_STATE_FILE`, forneça a mesma variável ao backup. Confira existência e conteúdo esperado dos arquivos e registre versão/commit que os produziu. Cópia do segredo/banco e JSON não é uma transação entre todos os processos; parar os serviços evita divergência de configuração durante a transferência.

## Restaurar ou transferir ao notebook

1. Instale a mesma revisão do repositório, dependências e Node-RED configurado. Não execute setup sobre dados já inicializados.
2. Encerre backend e Node-RED. Faça backup dos dados atuais antes de substituir qualquer arquivo.
3. Em destino com diretório de dados vazio, copie `samahi.sqlite` e `auth-secret` do mesmo backup. Copie o JSON de luz para o caminho usado pelo Node-RED. Não misture o segredo de outra instalação.
4. Se houver banco antigo e arquivos WAL/SHM, não sobreponha seletivamente com o serviço aberto. Preserve o conjunto antigo em backup e prepare diretório novo para o restore.
5. Atualize o caminho do módulo Node-RED e variáveis. Inicie Node-RED/backend e confira logs, health, conta, ambientes, concessões e agenda.
6. Reconfigure IP/origens e endereço no telefone; valide luz manual, horário, gás, histórico e perda/retorno de comunicação. Guarde o resultado do ensaio.

Não há teste de restauração do notebook registrado apenas por executar backup no PC. Um plano de recuperação só fica validado após restaurar e conferir o fluxo.

## Atualizar e voltar uma versão

Antes de atualizar código com mudança de dados, faça backup e leia o PR/migração. Reinicie Node-RED/backend após atualizar seus módulos. Para reverter código, confira compatibilidade do esquema e restaure o conjunto de dados compatível se necessário, com serviços parados. Fazer downgrade de código sobre um banco incompatível não é rollback validado.

## Observabilidade e retenção

Auditoria funcional inclui criação/alteração de usuários/quartos, concessões, comandos, transições de gás/conexão. Eventos globais podem ter quarto nulo e não aparecem na rota de histórico por quarto. Essa rota retorna os últimos 100, não apaga registros anteriores. Não há retenção, rotação ou exportação administrativa automáticas implementadas. Logs de console não devem conter credenciais.
