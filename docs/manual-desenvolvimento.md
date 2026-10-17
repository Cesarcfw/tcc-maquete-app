# Manual de desenvolvimento e leitura do código

Referência: 0.6.0. Leia [arquitetura](arquitetura.md) antes de alterar integrações.

## Mapa do repositório

| Caminho | O que procurar |
| --- | --- |
| `index.ts`, `App.tsx` | Entrada Expo e exportação da aplicação autenticada |
| `src/ui/ConnectedApp.tsx` | Hidratação, endereço, login, sessão e montagem do workspace |
| `src/ui/DemoApp.tsx` | Layout atual do painel/catálogo; nome herdado de protótipo |
| `src/ui/AccountManagement.tsx` | Administração e concessões |
| `src/ui/LightingScheduleControls.tsx` | Formulário Dia/Noite |
| `src/ui/GasAlarm.tsx` | Sobreposição de gás e movimento |
| `src/ui/Brand.tsx`, `src/ui/theme.ts` | Marca e temas |
| `src/hooks/useAuthenticatedDevice.ts` | Polling, pendência, ACK, geração de requisição e histórico |
| `src/hooks/usePreferences.ts` | Carregamento e persistência das preferências |
| `src/domain/` | Regras de estado, permissões, ambientes, histórico e endereço |
| `src/services/backend.ts` | Transporte autenticado e tradução de erros |
| `src/services/preferences.ts` | Chave/schema, decodificação e fila de gravação |
| `src/hooks/useSimulator.ts`, `useNodeRed.ts`, `src/services/nodeRed.ts` | Caminhos de protótipo/integração direta mantidos no histórico do código; não são o transporte da entrada autenticada |
| `shared/lighting-schedule.cjs` e `.d.cts` | Regra de agenda compartilhada e tipos |
| `backend/core.mjs` | SQLite, Better Auth, concessões e bootstrap |
| `backend/server.mjs` | HTTP, autorização, redaction, proxy, observação e comandos |
| `backend/setup.mjs`, `backup.mjs` | Rotinas administrativas locais |
| `integration/node-red/simulator.cjs` | Dispositivo virtual, persistência de luz e cenários |
| `integration/node-red/build-flow.cjs`, `flows.json` | Gerador e fluxo importável |
| `scripts/test-phone.mjs` | Rede local e serviços para teste móvel |
| `plugins/withLocalNetwork.js` | Configuração Android de rede local para preview |
| `tests/`, `backend/test/` | Ensaios automatizados |
| `app.json`, `app.config.js`, `eas.json`, `vercel.json` | Identidade, build e publicação |

Os nomes exatos podem ser conferidos com `rg --files src backend shared integration scripts plugins`. O `package-lock.json` de cada pacote é a referência reproduzível das dependências resolvidas.

## Como estudar um caso completo

1. **Luz manual:** localizar o controle em `DemoApp.tsx`; seguir `useAuthenticatedDevice.send`; ler POST commands no backend; seguir `handle('commands')` no simulador; conferir testes e auditoria.
2. **Horários:** começar pela função pura em `shared/lighting-schedule.cjs`, depois formulário, validação do backend e persistência no simulador.
3. **Gás/histórico:** seguir `gasStatus` → telemetria → observação de transição no backend → `describeAuditEvent` → renderização/alerta. Reconhecimento não altera detecção.
4. **Endereço salvo:** `backendAddress` → `usePreferences` → `preferences.ts`. O endereço salvo válido prevalece sobre o valor inicial de build; senha e token não entram no snapshot.

## Como acrescentar uma função

Defina requisito, grupo/permissão, comando, resposta e falha antes de criar a tela. Atualize tipos/domínio, backend, dispositivo virtual e contrato OpenAPI no mesmo PR. Faça o componente usar estado reportado e indicação pendente; não simule confirmação na interface autenticada.

Para trocar o simulador pelo hardware, primeiro acordar transporte e identidade com Gabriel. O backend hoje aceita a fonte virtual e o cliente aceita ACK virtual; adaptar esses pontos junto com testes, firmware e documentação. Não renomear um resultado virtual para parecer confirmação física.

## Alterar dados e contratos

- Mudança incompatível de tabelas exige migração explícita, backup e teste de atualização de banco existente. O esquema atual usa criação aditiva e `user_version=1`; isso não é um framework de migrações do domínio.
- Better Auth gerencia seu próprio esquema; não alterar tabelas internas manualmente para adicionar funções do domínio.
- Atualizar ambos os lados de qualquer comando e [OpenAPI](api/README.md). Manter compatibilidade de fixtures, exemplos e mensagens.
- Atualizar o gerador e regenerar `flows.json` quando mudar nós. Não alterar só o JSON gerado e perder a mudança na próxima geração.
- Componentes e nomes legados não provam exposição operacional. Seguir imports a partir da entrada antes de remover arquivos.

## Rotina de entrega

[CONTRIBUTING](../CONTRIBUTING.md) define branches, PR e evidências. Executar os gates em [testes e versões](testes-versoes.md). Uma alteração de texto/código no GitHub não atualiza automaticamente um APK já instalado. Para documentar a monografia, registrar commit, origem dos dados, ambiente e resultado observado em vez de atribuir ensaios anteriores ao novo código.
