# SAMAHI

**Sistema de Automação e Monitoramento de Ambientes Hospitalares Inteligentes.** Aplicativo web e Android para consultar sensores, controlar iluminação e operar o indicador externo de uma maquete de quarto. Desenvolvido na frente de software do TCC de Ciência da Computação da UDF.

## Estado atual

Referência do aplicativo: **1.0.0**, backend 0.1.0 e protocolo de telemetria 1. O aplicativo inclui a [integração física quarto-01 / ESP32-bancada](docs/integracao-esp-fisico.md), com ACK, sensores, sinalização local e agenda no gateway. O simulador e a edição offline continuam disponíveis para ensaios separados. Consulte o [registro do APK 1.0.0](docs/apk-v1.0.0.md) para instalação e aceite no telefone.

- Iluminação: ligar/desligar, intensidade 0–100% e programação Dia/Noite em `America/Sao_Paulo`.
- Temperatura, umidade, gás e estado de comunicação.
- Indicador manual simplificado com vermelho, amarelo, verde, azul e opção de apagar, independente dos alertas de gás. Não representa o conjunto completo de Manchester.
- Contas, cadastro de ambientes, concessões por grupo e histórico persistente.
- Temas claro/escuro, redução de movimento e endereço do backend preservados no dispositivo.

Não há classificação clínica automática, identificação de gás tóxico ou prontuário. Cadastrar um ambiente não provisiona um novo dispositivo.

Há uma [edição de avaliação offline para o orientador](docs/demo-orientador-offline.md), com conta de teste pré-configurada e pacote Android separado. Use `Iniciar-Demo-Orientador.cmd` para explorar a interface web sem backend; essa edição não controla hardware.

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
- [Instalar o fluxo simulado](docs/integracao-node-red-local.md) ou [ativar o ESP físico](docs/integracao-esp-fisico.md)
- [Testar no telefone e na rede local](docs/teste-app-integrado.md)
- [Gerar e instalar APK](docs/gerar-apk.md) · [registro do APK 1.0.0](docs/apk-v1.0.0.md)

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

## Rede local para apresentação

Quem recebeu o [pacote privado do notebook](docs/pacote-notebook.md) pode usar o Node.js portátil, o backend e o Node-RED já preparados. Quem mantém uma instalação pelo repositório pode iniciar os dois serviços pelo `Iniciar-SAMAHI-Notebook.cmd`, sem Expo. O console mostra a URL do backend para o APK.

Conecte notebook e telefone à mesma rede e configure no [portal do ESP](docs/rede-esp-notebook.md) o caminho e o IP do notebook. César confirmou o funcionamento do Wi-Fi do ESP e do pacote do notebook. O [registro de validação](docs/rede-esp-notebook-validacao.md) distingue esse relato dos testes automatizados e dos cenários ainda sem evidência detalhada.
