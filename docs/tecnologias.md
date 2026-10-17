# Tecnologias e dependências

Referência dos manifests na revisão do app 0.6.0. A versão declarada (com `~`/`^`) define intervalo; a resolução exata reproduzível está no `package-lock.json` correspondente. Não executar atualização geral de pacotes sem revisar compatibilidade.

## Cliente

| Tecnologia | Declaração | Responsabilidade |
| --- | --- | --- |
| Expo | ~57.0.26 | Ferramentas, desenvolvimento e exportação |
| React | 19.2.3 | Composição e ciclo de vida da interface |
| React Native | 0.86.3 | Interface nativa |
| React Native Web | ^0.21.2 | Renderização web |
| React DOM | 19.2.3 | Integração do alvo web |
| TypeScript | ~6.0.3 (desenvolvimento) | Tipagem estática |
| React Native Paper | ^5.15.3 | Componentes e tema |
| React Native Slider | 5.2.0 | Intensidade de iluminação |
| AsyncStorage | 2.2.0 | Preferências persistentes locais |
| Safe Area Context | ~5.7.0 | Áreas seguras da tela |
| Expo Vector Icons | ^15.1.1 | Ícones |
| Expo Status Bar | ~57.0.1 | Barra de status |

Entradas em `package.json`; sem biblioteca de navegação dedicada: a composição e seleção de telas são controladas pelo estado da aplicação. Não há Redux, WebSocket, Firebase ou cliente PostgreSQL implementado apenas por existir uma necessidade futura de dados.

## Servidor e dispositivo virtual

| Tecnologia | Declaração | Responsabilidade |
| --- | --- | --- |
| Node.js | >=24.15.0 no backend; CI série 24 | Runtime, HTTP, arquivos e node:sqlite |
| Express | 5.1.0 | API do domínio/middleware |
| Better Auth | 1.7.10 | Contas, credenciais, sessões e recursos administrativos |
| cors | 2.8.5 | Cabeçalhos de origens permitidas |
| SQLite | Embutido no Node; versão depende do runtime | Banco em arquivo; não tem pacote npm de servidor separado |
| Node-RED | 5.0.8 na instalação local registrada | Fluxo HTTP e amostragem do ESP virtual; instalação separada |

O backend tem `package.json` e lock próprios. Node-RED da pasta vizinha tem dependências próprias e não é instalado pelo `npm ci` do aplicativo. O módulo do simulador usa apenas módulos Node e a regra local compartilhada.

## Desenvolvimento e entrega

ESLint, TypeScript, tsx/Node test runner e Prettier estão declarados nas devDependencies. GitHub Actions executa verificações; Expo EAS gera o APK; Vercel recebe a exportação estática. Contas nesses serviços, plugins de edição e ferramentas usadas para produzir documentos não são dependências de execução do app.

O validador Redocly é executado sob demanda por `npx`, sem adicionar dependência de runtime. O verificador `docs:check` usa Node padrão e roda na CI. Registrar versão do CLI em ensaios futuros quando reprodutibilidade exata da ferramenta externa for necessária.

## Atualização e licenças

1. Conferir recomendação de compatibilidade da versão Expo usada e notas das bibliotecas afetadas.
2. Atualizar manifest/lock e validar ambos os alvos, além dos testes de backend quando pertinentes.
3. Revisar mudanças de API, esquema e configuração; não substituir lock por uma instalação não documentada.
4. Preservar licenças e avisos dos componentes; o arquivo LICENSE existente corresponde à base Expo. Esta lista não é uma auditoria completa de todas as licenças transitivas.

Links oficiais por tecnologia estão em [referências](referencias.md). [Arquitetura](arquitetura.md) explica como os componentes se relacionam.
