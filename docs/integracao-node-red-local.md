# Integração Node-RED local

Fluxo operacional: cliente → backend autenticado → Node-RED → ESP virtual. O telefone precisa alcançar o backend, não o editor Node-RED.

## Preparar uma instância

O projeto usa uma instalação vizinha em `../samahi-node-red`, fora do repositório do app. Se ela já existe, confira os caminhos/configuração e preserve seus fluxos. Para uma instalação nova, execute a partir da raiz do repositório:

```powershell
New-Item -ItemType Directory -Path ..\samahi-node-red -Force
Set-Location ..\samahi-node-red
npm init -y
npm install --save-exact node-red@5.0.8
New-Item -ItemType Directory -Path data -Force
```

5.0.8 é a versão registrada no ambiente do projeto, não uma afirmação de versão mais recente. A instalação usa o registry npm e cria package/lock próprios. Se precisar outra versão, valide os fluxos antes de adotá-la.

Crie `settings.js` nessa pasta (o arquivo **não é** uma cópia literal de settings.example.cjs, pois o caminho muda):

```javascript
module.exports = {
  uiHost: "127.0.0.1",
  uiPort: 1880,
  flowFile: "flows.json",
  functionGlobalContext: {
    samahi: require("../tcc-maquete-app/integration/node-red/simulator.cjs").instance,
  },
  httpNodeCors: {
    origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
    methods: "GET,POST,OPTIONS",
  },
};
```

`settings.example.cjs` no repositório supõe o módulo ao lado do settings; ajuste o caminho ao copiar. Se renomear a pasta do repositório, atualize o require. Na instalação nova, copie o fluxo e inicie:

```powershell
Copy-Item ..\tcc-maquete-app\integration\node-red\flows.json .\data\flows.json
npx node-red --userDir ./data --settings ./settings.js
```

Em instalação que já tem fluxo, use importação pelo editor e confira duplicatas em vez de sobrescrever o arquivo. Abra `http://127.0.0.1:1880`, confira a aba SAMAHI, faça Deploy e veja o tick de 2 segundos. Reinicie o processo após alterar simulator/shared para recarregar módulos.

## Interfaces

Base interna `/api/v1/rooms/quarto-01`:

| Método/caminho | Uso |
| --- | --- |
| GET `/telemetry` | Última amostra e idade |
| POST `/commands` | Controle com commandId e ACK |
| POST `/simulation` | Alterar entradas/cenários de ensaio |
| POST `/reset` | Reiniciar estado virtual; preserva luz na instância com storage |

[Contrato OpenAPI](api/node-red.openapi.json) e [explicação dos contratos](api/README.md). Endpoints internos **não têm autenticação de aplicação**. Mantenha 1880 em loopback; CORS não impede acesso por outro programa. Backend usa esse endereço interno, valida e filtra a resposta antes de atender o usuário.

## Verificação local não destrutiva

```powershell
Invoke-RestMethod http://127.0.0.1:1880/api/v1/rooms/quarto-01/telemetry
Invoke-RestMethod http://127.0.0.1:3001/health
```

Depois faça login no app, abra o quarto e envie uma alteração permitida. A resposta atual usa `source: node-red-simulator` e `status: applied_in_simulator`; não é confirmação de hardware.

## Cenários de ensaio

Use os Injects do editor ou POST simulation. Eles alteram a instância compartilhada por todos os usuários: avisar a equipe e registrar o ensaio. Exemplo em ambiente de ensaio:

```powershell
$body = @{ gasRawAdc = 2500; gasUnavailable = $false } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:1880/api/v1/rooms/quarto-01/simulation -ContentType application/json -Body $body
```

Cenários: normal, offline (503), stale (para amostragem e envelhece leitura), timeout (504 para comando). `gasUnavailable` distingue falha de leitura de nível detectado. LDR permanece telemetria, com `dark = ldrRawAdc >= 1500`; não comanda mais a iluminação. A polaridade deve ser conferida no circuito físico, não copiada de uma hipótese de ligação.

O script `integration/node-red/check-api.cjs` executa cenários e muda estado; rode somente em instância de ensaio apropriada. Para editar nós, altere `build-flow.cjs` e gere `flows.json` com `node integration/node-red/build-flow.cjs` na raiz.

## Integração física pendente

O firmware Wokwi histórico não é a implementação deste serviço. Antes de substituir a origem virtual, definir junto com Gabriel transporte, payload/qualidade da leitura, tempo, identidade, segurança, PWM, agenda local e ACK de aplicação. Backend e cliente hoje exigem os identificadores virtuais no contrato; essa substituição exige mudança coordenada e evidências reais.
