# Requisitos e critérios de aceitação

Base: código 0.7.0. “Implementado” descreve código disponível; não representa aprovação física ou clínica. Cada PR deve indicar quais critérios realmente executou. As evidências anteriores estão nos registros de funcionalidade/build.

| ID | Requisito implementado | Critério de aceitação | Onde verificar |
| --- | --- | --- | --- |
| RF01 | Login e sessão | Conta válida entra; inválida é rejeitada; token não é salvo nas preferências | `ConnectedApp`, backend; teste HTTP e telefone |
| RF02 | Gestão de usuários | Admin cria usuário, altera concessões, bloqueia/reativa e redefine senha de usuário comum | `AccountManagement`, rotas users, suíte access |
| RF03 | Autorização por quarto/grupo | Sem concessão não revela quarto; leitura não controla; sensors/history não aceitam control | backend e suíte access |
| RF04 | Catálogo persistente | Criar/editar mantém ambiente após reinício; leito/dispositivo únicos; criar não provisiona ESP | rooms, SQLite, suíte access |
| RF05 | Telemetria | Consultar temperatura/umidade/gás somente com grupo sensors; mostrar estado de atualização | hook, redaction, suíte access/monitoring |
| RF06 | Luz manual | 0% desliga; ligar restaura última intensidade positiva; aguardar ACK; erro preserva estado reportado | domínio, simulador, testes |
| RF07 | Dia/Noite | Horários distintos HH:mm e intensidades 0–100; período em Brasília; manual pausa; reativar retoma | shared, schedule, testes com relógio injetado |
| RF08 | Persistência da luz | Reiniciar o gateway recupera modo e agenda. No simulador, persiste também o estado da luz. No físico, só aplica agenda após receber telemetria recente. Falha de gravação não confirma alteração. | Armazenamento de luz, ponte física e testes temporários |
| RF09 | Gás | Simulador usa limite 2000. No físico, firmware usa histerese de bancada (500/300 ADC), sinalização local e status de falha. Reconhecer no app não encerra o sinal. | simulador e alerta; testes/UI |
| RF10 | Indicador de triagem simplificado | Vermelho/amarelo/verde/azul/off manuais; laranja não selecionável; alterar não depende do gás | comando indicator, testes |
| RF11 | Histórico | Transições de gás/conexão são persistidas durante consultas; repetição não duplica transição | suíte monitoring; histórico por quarto |
| RF12 | Preferências | Endereço válido, tema e redução de movimento reaparecem; dados inválidos usam fallback seguro | preferences, testes e recarregamento |
| RF13 | Comandos identificados | ACK correlacionado ao commandId; repetição confirmada idêntica não reaplica no backend | rota commands, suítes HTTP |
| RF14 | Web/Android | Login e funções adaptados ao aparelho, sem dependência de controles exclusivos de mouse | validação visual + roteiro móvel |
| RF15 | ESP físico | DHT22 e MQ-2 reportam origem física. Luz e RGB só confirmam com ACK correlacionado. Falha mantém origem e estado conhecido. | Ponte física, firmware e testes sintéticos |
| RF16 | Rede da apresentação | Notebook e telefone usam a rede escolhida e IP exibido pelo iniciador. O portal persiste destino e Wi-Fi externo. | Firmware AP/STA e roteiro de rede |
| RF17 | Execução portátil | Executar backend e Node-RED no Windows x64 com as dependências e dados da entrega privada. | Gerador, verificador e registro do pacote |

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

1. Consolidar a matriz de aceite com APK 0.7.0, firmware e notebook identificados, incluindo controles, permissões, agenda, desconexão e reconexão.
2. Registrar o ensaio de rede e pacote que César confirmou, discriminando o resultado de cada cenário.
3. Avaliar calibração, repetibilidade e montagem definitiva em ensaio próprio.
4. Definir HTTPS, identidade de dispositivo e proteção de Node-RED antes de ampliar exposição.
5. Projetar coleta autônoma se for necessário registrar incidentes mesmo sem cliente consultando.
6. Definir retenção, métricas e migrações para evolução além do cenário local.

Não estão implementados prontuário, triagem automática, prescrição, determinação de gás tóxico, notificações push, provisionamento automático de múltiplos ESPs ou sincronização em nuvem. Qualquer ampliação deve virar requisito e critério verificável próprio.
