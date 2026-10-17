# Requisitos e critérios de aceitação

Base: código 0.6.0. “Implementado” descreve código disponível; não representa aprovação física ou clínica. Cada PR deve indicar quais critérios realmente executou. As evidências anteriores estão nos registros de funcionalidade/build.

| ID | Requisito implementado | Critério de aceitação | Onde verificar |
| --- | --- | --- | --- |
| RF01 | Login e sessão | Conta válida entra; inválida é rejeitada; token não é salvo nas preferências | `ConnectedApp`, backend; teste HTTP e telefone |
| RF02 | Gestão de usuários | Admin cria usuário, altera concessões, bloqueia/reativa e redefine senha de usuário comum | `AccountManagement`, rotas users, suíte access |
| RF03 | Autorização por quarto/grupo | Sem concessão não revela quarto; leitura não controla; sensors/history não aceitam control | backend e suíte access |
| RF04 | Catálogo persistente | Criar/editar mantém ambiente após reinício; leito/dispositivo únicos; criar não provisiona ESP | rooms, SQLite, suíte access |
| RF05 | Telemetria | Consultar temperatura/umidade/gás somente com grupo sensors; mostrar estado de atualização | hook, redaction, suíte access/monitoring |
| RF06 | Luz manual | 0% desliga; ligar restaura última intensidade positiva; aguardar ACK; erro preserva estado reportado | domínio, simulador, testes |
| RF07 | Dia/Noite | Horários distintos HH:mm e intensidades 0–100; período em Brasília; manual pausa; reativar retoma | shared, schedule, testes com relógio injetado |
| RF08 | Persistência da luz | Reiniciar instância recupera modo/agenda/intensidade; falha de gravação não confirma alteração | fileStorage, testes temporários |
| RF09 | Gás | ADC ≥ 2000 detecta; unavailable separa indisponibilidade; reconhecer não remove detecção | simulador e alerta; testes/UI |
| RF10 | Indicador Manchester | Vermelho/laranja/amarelo/verde/azul/off manuais; alterar não depende do gás | comando indicator, testes |
| RF11 | Histórico | Transições de gás/conexão são persistidas durante consultas; repetição não duplica transição | suíte monitoring; histórico por quarto |
| RF12 | Preferências | Endereço válido, tema e redução de movimento reaparecem; dados inválidos usam fallback seguro | preferences, testes e recarregamento |
| RF13 | Comandos identificados | ACK correlacionado ao commandId; repetição confirmada idêntica não reaplica no backend | rota commands, suítes HTTP |
| RF14 | Web/Android | Login e funções adaptados ao aparelho, sem dependência de controles exclusivos de mouse | validação visual + roteiro móvel |

## Atributos de qualidade

| ID | Expectativa | Implementação/limite atual |
| --- | --- | --- |
| RQ01 | Controle de acesso no servidor | Sessão e concessões por requisição; esconder botão sozinho não basta |
| RQ02 | Percepção de falha | Timeout cliente 8 s, upstream 5 s, leitura antiga ≥10 s; não são SLOs medidos |
| RQ03 | Manutenibilidade | Tipos, domínio compartilhado, testes, CI, documentação e PR |
| RQ04 | Recuperação | Backup consistente SQLite + segredo + arquivo de luz; restauração ainda deve ser ensaiada no notebook |
| RQ05 | Acessibilidade | Tema, contraste a revisar no aparelho, redução de movimento; não há auditoria formal WCAG completa |
| RQ06 | Rastreabilidade | Commit/build e origem de dados nas evidências; sem inventar resultados |

## Pendências fora da garantia atual

1. Integrar ESP físico, sensores calibrados, PWM e indicador real com ACK verificável.
2. Validar APK 0.6.0 instalado: todos os controles, persistência, perda/retorno de rede e contas com permissões distintas.
3. Transferir dados/segredo/luz ao notebook e executar ensaio completo de apresentação.
4. Definir HTTPS, identidade de dispositivo e proteção de Node-RED antes de ampliar exposição.
5. Projetar coleta autônoma se for necessário registrar incidentes mesmo sem cliente consultando.
6. Definir retenção, métricas e migrações para evolução além do cenário local.

Não estão implementados prontuário, triagem automática, prescrição, determinação de gás tóxico, notificações push, provisionamento automático de múltiplos ESPs ou sincronização em nuvem. Qualquer ampliação deve virar requisito e critério verificável próprio.
