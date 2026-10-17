# Testes, CI e gestão de versões

## Camadas de verificação

| Camada | Comando | O que comprova / limite |
| --- | --- | --- |
| Estilo | `npm run lint` | Regras ESLint; não valida comportamento |
| Tipos | `npm run typecheck` | Compilação estática do TS; não valida rede física |
| Documentação local | `npm run docs:check` | Arquivos dos links Markdown, referências internas OpenAPI e operationId únicos; sem rede, sem validar âncoras ou equivalência com runtime |
| Domínio/serviços | `npm test` | `tests/*.test.ts` via tsx/Node test runner; agenda, estado, contratos e preferências |
| Backend HTTP | `npm --prefix backend test` | `backend/test/*.test.mjs`, app real e SQLite temporário; acesso, telefone/headers e monitoramento |
| Bundle web | `npm run export:web` | Gera `dist/`; não publica nem executa ensaio manual |
| Contratos documentados | `npx --yes @redocly/cli lint --extends minimal docs/api/backend.openapi.json docs/api/node-red.openapi.json` | Estrutura OpenAPI; não comprova equivalência total com runtime |
| Integração manual | [Roteiro do telefone](teste-app-integrado.md) | UX/rede/aparelho; registrar ambiente e resultado |

As suítes automatizadas usam dados temporários/injeção de relógio. Não apontar scripts que alteram cenários para instância compartilhada sem organizar o ensaio. O script `check-api.cjs` do Node-RED muda cenários; não é uma sonda de saúde apenas de leitura.

## CI

`.github/workflows/ci.yml` usa Node 24 no Ubuntu, instala os dois pacotes e executa lint, documentação local, tipos, testes, exportação e backend. PRs para main/feat/fix/docs são abrangidos. A CI não gera APK automaticamente, não testa aparelho e não publica release. A validação estrutural completa dos contratos via Redocly acima é um passo documental manual nesta versão.

Uma verificação local pode exigir permissão para abrir sockets e escrever em diretórios temporários do sistema. Falha por sandbox não deve ser relatada como falha funcional antes de repetir no ambiente permitido. Não ignorar falha real para obter uma checklist verde.

## Casos de regressão essenciais

- 0% desliga; religar restaura última intensidade positiva.
- ACK errado/ausente mantém estado confirmado; cenário timeout não vira sucesso.
- Horários válidos/iguais, limites de período, agenda que atravessa meia-noite e intensidades 0/100.
- Manual pausa; reativação aplica período; persistência e falha de gravação.
- Gás detectado/unavailable/clear e reconhecimento; Manchester independente.
- Sessão inexistente, usuário bloqueado, acesso read/control, quarto oculto/inativo e redaction por grupo.
- Histórico de transições sem duplicação por múltiplas consultas; recuperação após falha observada.
- Preferências ausentes, inválidas, escrita concorrente e falha de armazenamento.

## Versões e distribuição

App está em **0.6.0**. Backend tem manifest **0.1.0** e esquema próprio **1**; protocolo virtual **1**. São identificadores distintos. Durante 0.x, mudanças incompatíveis devem estar explícitas no PR/changelog, pois a API ainda evolui. Usamos formato SemVer e registro de mudanças inspirado em Keep a Changelog.

Para distribuir Android, ajustar versão do app e configurações de build de forma coerente; Android versionCode deve crescer para permitir atualização. Revisar `app.json`, `app.config.js`, `package.json`, lock e `eas.json`. O código remoto EAS pode administrar o versionCode: conferir o valor efetivo na build, sem presumir que editar um JSON local bastou.

### Checklist de release

1. PRs incorporados/revisados, escopo e incompatibilidades descritos; não incluir alteração local secreta na build.
2. Gates executados e registro do commit exato. Configuração/variáveis revistas sem publicar segredos.
3. Docs, OpenAPI, ADR quando necessário, changelog e cartão atualizados.
4. Exportação web e build Android quando aplicáveis; registrar id, perfil, commit, versão/code e hash do arquivo.
5. Aceite no aparelho instalado e rede de destino. Build concluída não substitui esse aceite.
6. César revisa a entrega antes de tag/release final. Não inventar tag ou release que ainda não existe.
7. Após merge, remover branch apenas se a alteração estiver incorporada e PRs dependentes forem rebaseados/retargetados.

PRs empilhados devem mostrar base e ordem explicitamente. Revise o diff contra a base; após integrar a base, ajuste a próxima para main e confira o diff. Não misture “mudou no Git”, “publicado no Vercel” e “instalado no telefone”.

## Registro verificável

Para cada verificação, documentar comando, data, commit, saída resumida, ambiente e limitações. A contagem de testes em relatos antigos é um resultado daquela revisão, não um contador fixo atual. [Registro desta revisão documental](verificacao-documentacao.md) e [evidências](evidencias.md).
