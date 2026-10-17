# SAMAHI

**Sistema de Automação e Monitoramento de Ambientes Hospitalares Inteligentes.** Aplicativo web e Android para consultar sensores, controlar iluminação e operar o indicador externo de uma maquete de quarto. Desenvolvido na frente de software do TCC de Ciência da Computação da UDF.

## Estado atual

Referência desta documentação: **aplicativo 0.6.0**, backend 0.1.0 e protocolo do dispositivo virtual 1. Há login real, permissões verificadas no servidor, SQLite e comunicação HTTP com Node-RED. A integração atual atende **quarto-01 / ESP32-quarto-01 por simulação**; o ESP físico ainda precisa ser integrado. O APK 0.6.0 foi gerado; a aceitação completa no aparelho instalado é uma atividade separada.

- Iluminação: ligar/desligar, intensidade 0–100% e programação Dia/Noite em `America/Sao_Paulo`.
- Temperatura, umidade, gás e estado de comunicação.
- Indicador manual com cinco cores de Manchester e opção de apagar, independente dos alertas de gás.
- Contas, cadastro de ambientes, concessões por grupo e histórico persistente.
- Temas claro/escuro, redução de movimento e endereço do backend preservados no dispositivo.

Não há classificação clínica automática, identificação de gás tóxico ou prontuário. Cadastrar um ambiente não provisiona um novo dispositivo.

## Começar pelo computador

Pré-requisitos: **Node.js 24.15 ou superior da série 24**, npm e Node-RED configurado com os arquivos deste repositório. Execute na raiz:

```powershell
npm ci
npm --prefix backend ci --ignore-scripts
npm --prefix backend run setup
```

O setup é executado uma única vez, em instalação vazia, para criar o administrador. Não há senha padrão. Depois use três terminais:

| Terminal | Comando/local | Serviço |
| --- | --- | --- |
| 1 | Iniciar Node-RED configurado; veja o guia abaixo | `127.0.0.1:1880` |
| 2 | `npm --prefix backend start` | `127.0.0.1:3001` |
| 3 | `npm run web -- --port 8081` | Interface web em `localhost:8081` |

Na tela de login, configure `http://127.0.0.1:3001` e entre com a conta criada. O frontend isolado não oferece o fluxo operacional completo.

- [Instalação e configuração detalhada](docs/instalacao-configuracao.md)
- [Instalar o fluxo Node-RED](docs/integracao-node-red-local.md)
- [Testar no telefone e na rede local](docs/teste-app-integrado.md)
- [Gerar e instalar APK](docs/gerar-apk.md) · [registro do APK 0.6.0](docs/apk-v0.6.0.md)

## Documentação técnica

O [índice de documentação](docs/README.md) organiza os guias atuais, decisões e registros históricos. Comece por:

1. [Arquitetura e fluxos](docs/arquitetura.md).
2. [Mapa do código e manutenção](docs/manual-desenvolvimento.md).
3. [Requisitos e critérios de aceitação](docs/requisitos.md).
4. [APIs e contratos OpenAPI](docs/api/README.md).
5. [Modelo de dados](docs/modelo-dados.md) e [autenticação](docs/autenticacao-persistencia-local.md).
6. [Segurança](docs/seguranca.md), [operação e backup](docs/operacao.md), [testes e versões](docs/testes-versoes.md).

## Verificar uma alteração

```powershell
npm run lint
npm run docs:check
npm run typecheck
npm test
npm run export:web
npm --prefix backend test
```

Consulte o roteiro antes de testar cenários que alteram dados. Exportação web e testes automatizados não comprovam funcionamento do APK instalado ou do hardware.

## Colaboração e autoria

César: app/backend; Gabriel: hardware e firmware; Matheus: monografia. Todos apoiam as demais frentes.

[Contribuição](CONTRIBUTING.md) · [Segurança e relato privado](SECURITY.md) · [Changelog](CHANGELOG.md) · [Fontes e padrões adotados](docs/referencias.md)

[Trello da equipe](https://trello.com/b/GiwurIG1/tcc-monografia-aplicativo-e-maquete) · [Notion do aplicativo](https://app.notion.com/p/3ecc1303cee08168a95bf47b2694b67d)

A base foi criada com o template Expo `blank-typescript`; sua licença permanece em [LICENSE](LICENSE). Referências visuais e fontes técnicas são identificadas na documentação. Revisar o material acadêmico antes da incorporação à monografia.
