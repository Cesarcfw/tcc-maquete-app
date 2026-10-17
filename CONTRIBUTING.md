# Como contribuir

## Fluxo

1. Escolher tarefa no Trello e conferir dependências. Criar branch curta `feat/`, `fix/` ou `docs/` a partir de main atualizada. Se depender de PR aberto, informar base e ordem de integração.
2. Implementar uma mudança coerente, com mensagens `feat:`, `fix:`, `docs:`, `test:` ou `build:` que descrevam a ação.
3. Atualizar regras/contratos/testes pertinentes e documentação no mesmo PR. Não usar confirmação virtual como prova física.
4. Executar os gates abaixo; registrar ambiente e resultado. Não escrever que o teste Android passou sem executá-lo.
5. Atualizar CHANGELOG, cartão e registro técnico no Notion; incluir evidências e limitações.
6. Abrir PR; César revisa a integração e a distribuição. Não criar release final sem sua revisão.

## Preparar e validar

```powershell
npm ci
npm --prefix backend ci --ignore-scripts
npm run lint
npm run docs:check
npm run typecheck
npm test
npm run export:web
npm --prefix backend test
```

Para API documentada, validar os dois OpenAPI conforme [guia de testes](docs/testes-versoes.md). Para mudança de rede/UX/dispositivo, executar roteiro manual no cenário afetado. Testes automatizados devem usar instância/SQLite temporários; não apagar dados da equipe para “limpar” teste.

## Convenções técnicas

- Português em interface e documentação da equipe; identificadores de contrato podem permanecer em inglês.
- Tipos e regras puras em domínio/shared; I/O nos serviços; hooks orquestram ciclo de vida; UI reflete dados reportados.
- Validação e autorização no servidor para toda operação protegida.
- Luz: 0% desliga; religar restaura última positiva. Manual pausa horários; LDR não disputa controle.
- Sem confirmação, preservar último estado reportado. Manchester e alerta de gás são independentes.
- Não editar apenas o JSON gerado do Node-RED; manter gerador coerente.
- Não alterar esquema persistido sem plano de migração/backup/teste.

## Documentação necessária por mudança

| Mudança | Atualizar |
| --- | --- |
| HTTP/payload/permissão | `docs/api`, autenticação e requisitos |
| Tabela/arquivo/preferência | Modelo de dados, operação e migração pertinente |
| Configuração/iniciador | Instalação, telefone, rede e solução de problemas |
| Escolha estrutural | Arquitetura e ADR com contexto/consequências |
| Função/visual | Guia da função e roteiro de evidências |
| Build/distribuição | APK/Vercel, versão/commit/hash e validação separada |

Usar as marcações **TIRE PRINT DESTA PARTE** e **MOSTRE FUNCIONANDO EM VÍDEO OU GIF** para orientar evidências, fora da interface do produto. Citar fonte primária funcional quando utilizar informação externa; separar decisão da equipe de afirmação da fonte.

## Versionamento e credenciais

Formato SemVer, série 0.x em desenvolvimento; [procedimento de versões](docs/testes-versoes.md). Ajustar manifests e configurações de build juntos, sem afirmar que o manifest do backend deve ter o mesmo número do app. Changelog preserva registros antigos e abre seção Não lançado para alterações ainda sem distribuição.

Não versionar `.env`, senhas, tokens, keystores, banco, segredo ou backups. Preservar licenças e autoria de dependências/assets. [SECURITY.md](SECURITY.md) descreve relato privado de vulnerabilidade. Antes de usar texto na monografia, a equipe deve revisar redação, atribuição, resultados e limitações.
