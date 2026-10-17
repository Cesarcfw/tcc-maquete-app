# APIs e contratos de integração

Referência: cliente 0.6.0, backend 0.1.0, protocolo virtual 1. Contratos em **OpenAPI 3.1.1**, serializados em JSON para leitura por ferramentas:

- [Backend autenticado](backend.openapi.json) — API consumida pelo cliente.
- [Node-RED interno](node-red.openapi.json) — serviço virtual e cenários de ensaio.

Os arquivos descrevem o comportamento esperado a partir do código; não geram rotas nem fazem validação automática do runtime. Para abrir em um visualizador OpenAPI, importe o arquivo local sem enviar banco/token. Validação estrutural em [testes](../testes-versoes.md).

## 1. Camadas e autenticação

Base do backend: `http://127.0.0.1:3001` no PC; no telefone, origem LAN configurada, normalmente porta 3002. Corpo JSON nas rotas de domínio limitado a 32 KB pelo Express. As rotas Better Auth usam o handler próprio montado antes desse parser.

`GET /health` é público. Login usa `POST /api/auth/sign-in/email`; o cliente lê `set-auth-token` e envia `Authorization: Bearer ...` nas próximas requisições. Token não é necessariamente JWT. No web há também `credentials: include`; no nativo `omit`. Rotas de autenticação são da biblioteca: seus erros podem conter `code`/`message`, não o envelope `{error}` do domínio. Este contrato lista apenas as três rotas auth consumidas pelo aplicativo, não toda a API exposta pela biblioteca.

O handler nativo `/api/auth/admin` é bloqueado. Não há signup público no fluxo atual. [Regras de conta e concessões](../autenticacao-persistencia-local.md).

## 2. Inventário do backend

| Método | Rota | Regra |
| --- | --- | --- |
| GET | `/health` | Público, identifica processo |
| POST | `/api/auth/sign-in/email` | Email/senha, limitação de tentativas |
| POST | `/api/auth/sign-out` | Sessão |
| POST | `/api/auth/change-password` | Sessão + senha atual; cliente revoga outras sessões |
| GET | `/api/me` | Conta e suas concessões |
| GET/POST | `/api/users` | Admin; listar/criar user |
| PUT | `/api/users/{userId}/grants/{roomId}` | Admin; quatro grupos completos |
| POST | `/api/users/{userId}/disable` | Admin; bloqueia comum e remove sessões |
| POST | `/api/users/{userId}/enable` | Admin; reativa |
| POST | `/api/users/{userId}/password` | Admin; nova senha para comum, remove sessões |
| GET | `/api/rooms` | Admin vê todos, usuário vê concedidos |
| POST | `/api/rooms` | Admin; cadastro não cria hardware |
| PUT | `/api/rooms/{roomId}` | Admin; id imutável |
| GET | `/api/rooms/{roomId}/telemetry` | Algum grupo light/sensors/indicator autorizado; campos filtrados |
| POST | `/api/rooms/{roomId}/commands` | Concessão conforme kind; aguarda ACK |
| GET | `/api/rooms/{roomId}/history` | history:read; últimos 100, id decrescente |

Sem acesso ao quarto, 404 pode ocultar existência. Quarto inativo gera 409 nas funções. Admin não ignora concessões operacionais.

## 3. Telemetria

Node-RED entrega tipo/protocolo/fonte, identidade, sequência, uptime, sampledAt ISO UTC, idade, sensores/qualidade, ADC, luz/agenda, indicador, cenário e capacidades. O backend retorna apenas identidade/tempo e campos dos grupos concedidos, conforme schema `Telemetry` filtrado. Não assumir que todos os campos estão presentes em uma resposta ao usuário.

| Campo/regra | Significado |
| --- | --- |
| `source` | Atualmente exatamente `node-red-simulator` |
| `sampleAgeMs` | Idade informada pelo serviço; ≥10000 caracteriza stale |
| `gasRawAdc` | Inteiro 0–4095, não ppm |
| `gasStatus` | clear/detected/unavailable; threshold virtual 2000 |
| `gasAcknowledged` | Reconhecimento não limpa detecção nem desliga buzzer virtual |
| `ldrRawAdc`, `dark` | Informação de luminosidade; virtual escuro ≥1500, sem controlar luz |
| `lightMode` | manual ou scheduled |
| `lightingPeriod` | day/night quando programado, null no manual |
| `capabilities.hardware` | false no payload interno; não é integração física |

Limite relevante: o backend checa identidade/fonte e idade na leitura, mas não valida cada valor contra o schema completo. O cliente autenticado também não reutiliza automaticamente o parser estrito do caminho legado direto. Não atribuir ao OpenAPI uma proteção que não está no runtime.

## 4. Comandos

Envelope:

```json
{
  "commandId": "app-1760000000000-exemplo",
  "command": { "kind": "light", "on": true, "intensity": 65 }
}
```

`commandId` é identificado por ator/quarto no backend. Backend aceita `[A-Za-z0-9_-]`, Node-RED aceita `[A-Za-z0-9-]`: **use letras, números e hífen**, até 80 caracteres. Essa diferença de validação existe no código atual; underscore pode passar pelo backend e ser rejeitado pelo dispositivo virtual.

| kind | Corpo | Permissão |
| --- | --- | --- |
| light | on boolean; intensity inteiro 0–100; on deve equivaler a intensity > 0 | light:control |
| lightingSchedule | enabled boolean; schedule com timeZone, dayStart, nightStart, dayIntensity, nightIntensity | light:control |
| indicator | color red/orange/yellow/green/blue/off | indicator:control |
| acknowledgeGas | Sem campos adicionais necessários | sensors:read |

Agenda:

```json
{
  "commandId": "app-1760000000001-exemplo",
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

HH:mm 00:00–23:59, inícios diferentes, intensidades inteiras 0–100. Agenda pode atravessar meia-noite. Comando manual pausa programação; agenda reativada aplica período atual.

Resposta esperada contém `type: command_result`, mesmo commandId, `status: applied_in_simulator` e telemetry. O cliente só substitui o estado reportado após ACK compatível. Para agenda, backend também compara modo e cada campo da configuração devolvida. Não há promessa de comparação completa do estado aplicado para cada outro kind.

### Repetição e falha

Backend grava pending antes do envio; confirmed após resposta válida; unconfirmed em falha. Um ID já confirmado com `JSON.stringify(command)` idêntico retorna resposta persistida, com redaction atual. A serialização não é canônica: mudar a ordem de propriedades pode resultar em conflito, mesmo com valores equivalentes. IDs pending/unconfirmed ou conteúdo diferente retornam 409.

Não há retry automático de comando incerto nem garantia exatamente uma vez no Node-RED. Timeout pode ocorrer depois de aplicação; consulte estado antes de decidir nova ação/ID. Cache de ACK não representa uma nova leitura do dispositivo, nem controle exclusivo entre usuários concorrentes.

## 5. Erros e tempos

Rotas de domínio retornam JSON `{ "error": "mensagem" }` nos erros tratados. Better Auth e respostas de rota inexistente podem ter outros formatos. Cliente tem timeout 8 s, backend→Node-RED 5 s; amostragem/polling configurados em cerca de 2 s, sem garantia rígida de latência.

400 inválido; 401 sessão; 403 privilégio/origem; 404 ausente/oculto; 409 conflito/inativo/antigo; 413 corpo grande; 429 limite auth; 500 falha interna; 502 incompatibilidade; 503 indisponibilidade; 504 timeout reportado pelo virtual. Alguns erros são propagados do upstream; não há catálogo estável de códigos de erro de negócio além do HTTP/mensagem atual. Mensagens 5xx do domínio são mascaradas.

## 6. Node-RED e evolução

Base interna `/api/v1/rooms/{roomId}` com GET telemetry, POST commands, POST simulation e POST reset. Somente quarto-01 é servido. Não há autenticação própria nesses endpoints: manter em loopback. [Instalação e cenários](../integracao-node-red-local.md).

Rotas do backend ainda não têm prefixo de versão; dispositivo virtual tem `/api/v1` e protocolVersion 1. Mudança incompatível requer PR explícito, revisão de clientes/firmware, OpenAPI e testes. Integração física vai exigir adaptar checagem de fonte/ACK e identidade, não apenas trocar o endereço.
