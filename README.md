# Maquete conectada

Aplicativo de César para reunir sensores e controles da maquete. **v0.3.0: protótipo interativo com React Native Paper e dados simulados**, candidata para revisão. Layout de celular, tablet e computador com identidade compartilhada. Nenhum ESP32 ou Node-RED conectado nesta versão.

## O que experimentar

- Temas claro e escuro, perfis fictícios e permissões por grupo de funções.
- César administra conexões e acessos; todas as alterações são locais nesta sessão.

- Painel com temperatura, umidade e indicação de atualização.
- Luz do quarto: ligar/desligar, intensidade 0 a 100% e atalhos.
- Indicador externo com as cinco cores de Manchester e opção de apagar, com seleção manual.
- Cenários: operação normal, desconexão, dado antigo e comando sem confirmação.
- Roteiro de prints e vídeos em Evidências.

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

A exportação fica em dist, sem publicação automática. O estado da sessão é perdido ao recarregar.

## Documentação

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
- [Trello — tarefas da equipe](https://trello.com/b/GiwurIG1/tcc-monografia-aplicativo-e-maquete)

main recebe entregas revisadas por PR. Branches feat/, fix/ e docs/ para mudanças. Tags identificam as versões; não são criadas branches permanentes para cada número de versão.

## Origem

Base gerada com o template blank-typescript do Expo; sua licença é preservada em LICENSE. Código específico de interface, simulação e documentação desenvolvido neste projeto com apoio do Codex. Ver docs/referencias.md para fontes e limites de uso acadêmico.
