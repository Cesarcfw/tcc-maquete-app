# Backend local do SAMAHI

Node.js 24.15+ da série 24, Express e Better Auth com SQLite local. Manifest do backend 0.1.0; esquema próprio 1. Não é servidor PostgreSQL e não é o processo Node-RED.

Na raiz do repositório:

```powershell
npm --prefix backend ci --ignore-scripts
npm --prefix backend run setup
npm --prefix backend start
```

Setup somente em instalação vazia; cria admin sem senha padrão. Servidor padrão `http://127.0.0.1:3001`, Node-RED interno `http://127.0.0.1:1880`. O app aponta ao backend. Dados por padrão em `backend/data/`; personalize com as variáveis documentadas, que não são carregadas de `.env` automaticamente.

```powershell
npm --prefix backend test
npm --prefix backend run backup
```

Testes usam SQLite temporário e HTTP local. Backup contém banco/segredo e arquivo de luz quando existente; manter privado. Não copiar somente o `.sqlite` aberto para transferir a instalação.

## Documentação

- [Instalação e variáveis](../docs/instalacao-configuracao.md)
- [Arquitetura](../docs/arquitetura.md), [API](../docs/api/README.md) e [OpenAPI do backend](../docs/api/backend.openapi.json)
- [Contas e permissões](../docs/autenticacao-persistencia-local.md)
- [Modelo de dados](../docs/modelo-dados.md)
- [Segurança](../docs/seguranca.md), [operação/restore](../docs/operacao.md) e [testes](../docs/testes-versoes.md)

`server.mjs` exporta `createApp(options)` para testes; `core.mjs` cria schema/auth/serviços; `setup.mjs` inicializa a instalação; `backup.mjs` usa VACUUM INTO. SIGINT/SIGTERM fecham o listener e a conexão do banco. Mudanças de servidor exigem reiniciar o processo.
