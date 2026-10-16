# SAMAHI

Sistema de Automação e Monitoramento de Ambientes Hospitalares Inteligentes. Aplicativo web/Android de César para sensores e controles da maquete, com visual Stitch, contas reais, permissões, backend local e SQLite. O Node-RED atende o ESP virtual do Quarto 01; integração física pendente. Alterações desta branch exigem revisão e nova distribuição para chegar ao APK instalado.

## O que experimentar

- Temas claro/escuro, contas e permissões por ambiente/grupo verificadas no servidor.
- Administrador gerencia ambientes e usuários; dados persistidos localmente.

- Painel com temperatura, umidade e indicação de atualização.
- Luz do quarto: ligar/desligar, intensidade 0 a 100% e atalhos.
- Modos Dia/Noite: horários de Brasília e intensidade por período. Manual pausa a programação; LDR permanece apenas como sensor.
- Indicador externo com as cinco cores de Manchester e opção de apagar, com seleção manual.
- Histórico de ações, gás, falhas de comunicação e recuperação. Cenários de ensaio ficam no Node-RED.
- Seleção, busca e cadastro persistente de ambientes. Cadastrar um quarto não cria um dispositivo; o serviço virtual atual atende apenas quarto-01.
- Roteiros de prints e vídeos em docs, fora da interface do aplicativo.

## Executar

Node.js 24 LTS e npm. Na pasta do projeto:

```sh
npm ci
npm run web
```

Para iniciar o ambiente móvel: `npm start`. O teste Android precisa de dispositivo/emulador e ambiente Expo compatível com SDK 57; verificar o fluxo oficial antes de considerar a execução móvel validada. Neste registro, a prévia web foi o ambiente utilizado.

```sh
npm run lint
npm run typecheck
npm test
npm run export:web
```

A exportação fica em dist, sem publicação automática. Recarregar pede novo login; contas, concessões e histórico permanecem no banco. Inicie também backend e Node-RED conforme [integração local](docs/teste-app-integrado.md). Após atualizar a programação, reinicie ambos para carregar o código novo.

## Documentação

- [Modos Dia e Noite — horários, contrato, persistência e evidências](docs/modos-dia-noite.md)
- [Autenticação e banco locais](docs/autenticacao-persistencia-local.md)
- [Histórico de falhas e alertas](docs/historico-alertas.md)

- [Publicação web no Vercel](docs/publicacao-vercel.md)
- [Preparação e geração do APK de teste](docs/gerar-apk.md)
- [Documentação completa da arquitetura atual](docs/arquitetura.md)
- [Manual de estudo e manutenção do aplicativo](docs/manual-desenvolvimento.md)
- [Registro da versão atual e evidências](docs/registro-v0.3.0.md)
- [Registro histórico v0.1.0](docs/registro-v0.1.0.md)
- [Roteiro de evidências](docs/evidencias.md)
- [Referências técnicas reais](docs/referencias.md)
- [Como desenvolver por versões](CONTRIBUTING.md)
- [Histórico de alterações](CHANGELOG.md)
- [Notion — documentação do aplicativo](https://app.notion.com/p/3ecc1303cee08168a95bf47b2694b67d)
- [Notion — arquitetura completa v0.3.0](https://app.notion.com/p/3eec1303cee081729a05d0416329f1a9)
- [Notion — manual de estudo e manutenção](https://app.notion.com/p/3eec1303cee081a68c30d4d2f3c6d77b)
- [Trello — tarefas da equipe](https://trello.com/b/GiwurIG1/tcc-monografia-aplicativo-e-maquete)

main recebe entregas revisadas por PR. Branches feat/, fix/ e docs/ para mudanças. Tags identificam as versões; não são criadas branches permanentes para cada número de versão.

## Origem

Base gerada com o template blank-typescript do Expo; sua licença é preservada em LICENSE. Código específico de interface, simulação e documentação desenvolvido neste projeto com apoio do Codex. Ver docs/referencias.md para fontes e limites de uso acadêmico.
