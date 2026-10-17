# Instalação e configuração

## Requisitos

- Node.js **24.15+ da série 24** (backend usa `node:sqlite`), npm e Git.
- Node-RED em processo separado com `functionGlobalContext` e fluxo deste projeto; não basta abrir o editor vazio.
- Para Expo Go, versão compatível com Expo SDK 57 e telefone na mesma rede privada. Para APK instalado não é necessário Metro.
- No Windows, os comandos abaixo são PowerShell. Execute a partir da raiz do repositório, exceto onde indicado.

## Instalação inicial

```powershell
npm ci
npm --prefix backend ci --ignore-scripts
npm --prefix backend run setup
```

Informe nome, email e senha de 12 a 128 caracteres no terminal. O setup recusa instalações com usuários existentes. Não o use para recuperar senha. Banco e segredo são criados em `backend/data/`, porque `npm --prefix backend` executa o script no diretório do backend.

Prepare [Node-RED](integracao-node-red-local.md), inicie-o, e em outros terminais:

```powershell
npm --prefix backend start
```

```powershell
npm run web -- --port 8081
```

Abra a interface e configure conexão `http://127.0.0.1:3001`. `/health` identifica o backend, mas não comprova comunicação com Node-RED. Faça login e abra o Quarto 01 para validar a cadeia.

## Variáveis de configuração

O backend lê `process.env`: **não carrega `.env` automaticamente**. Defina variáveis no terminal que inicia cada processo. Valores públicos `EXPO_PUBLIC_*` entram no bundle do cliente e não devem conter segredos.

| Variável | Processo | Padrão/uso |
| --- | --- | --- |
| `SAMAHI_HOST` | Backend | `127.0.0.1` (interface de escuta) |
| `SAMAHI_PORT` | Backend | `3001` |
| `SAMAHI_PUBLIC_URL` | Backend | `http://127.0.0.1:3001`; base do Better Auth, ajustar junto com porta/host público |
| `SAMAHI_NODE_RED_URL` | Backend | `http://127.0.0.1:1880`; acesso servidor → Node-RED |
| `SAMAHI_DATA_DIR` | Backend/setup/backup | `data`, relativo ao diretório de execução; preferir absoluto ao personalizar |
| `SAMAHI_ORIGINS` | Backend | Lista separada por vírgulas; padrão permite HTTP localhost/127.0.0.1 em 8081/8082 |
| `SAMAHI_NODE_RED_STATE_FILE` | Node-RED e backup | Padrão `backend/data/node-red-lighting.json` resolvido a partir do código; fornecer o mesmo caminho aos dois processos se personalizado |
| `EXPO_PUBLIC_BACKEND_URL` | Expo | Endereço inicial; fallback `http://127.0.0.1:3001`. Preferência válida já salva tem prioridade |
| `EXPO_PUBLIC_NODE_RED_URL` | Código legado | Não configura o transporte da entrada autenticada atual |
| `EAS_BUILD_PROFILE` | Build Expo | Perfil `preview` ativa configuração Android de HTTP local |

Exemplo manual para rede privada, **substitua o IP pelo IP real do computador**:

```powershell
$env:SAMAHI_HOST = '192.168.1.9'
$env:SAMAHI_PORT = '3002'
$env:SAMAHI_PUBLIC_URL = 'http://192.168.1.9:3002'
$env:SAMAHI_ORIGINS = 'http://localhost:8081,http://192.168.1.9:8081'
npm --prefix backend start
```

No telefone, `127.0.0.1` aponta para o próprio telefone. Use `http://IP-DO-PC:3002`. Campo aceita somente uma origem HTTP(S), sem caminho extra, credenciais, query ou fragmento. [Iniciador e firewall](teste-app-integrado.md).

## Scripts Windows

| Arquivo | Função |
| --- | --- |
| `Configurar-Administrador.cmd` | Setup inicial do backend |
| `Iniciar-Backend.cmd` | Backend com configuração padrão/ambiente atual |
| `Iniciar-App-Integrado.cmd` | `test:phone`: backend LAN 3002, Metro 8082, reutiliza Node-RED existente ou inicia instalação vizinha configurada |
| `Liberar-Acesso-App.cmd` | Regra Windows específica para o teste, com elevação e opção de remoção |
| `Iniciar-App-Node-RED.cmd` | Iniciador legado da integração direta; não é a receita operacional da entrada com login |

## Dependências e atualização

Use `npm ci` nos dois pacotes, preserve lockfiles e revise compatibilidade Expo antes de atualizar React/React Native isoladamente. Não é necessário instalar PostgreSQL, Redis, Docker ou DBeaver para executar esta versão. DBeaver é um visualizador opcional para SQLite.

Após atualizar módulos do simulador, reinicie Node-RED para recarregar o `require`; reinicie backend para carregar código de servidor e recarregue o cliente. Preserve `backend/data/`. [Backup e restauração](operacao.md).
