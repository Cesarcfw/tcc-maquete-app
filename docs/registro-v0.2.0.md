> **Registro histórico.** Reflete a etapa/versão indicada, não a situação operacional atual. Consulte o [índice da documentação atual](README.md).

# Registro de desenvolvimento — v0.2.0

## Objetivo e autoria

Aplicar a identidade visual escolhida por César sem perder as funções da maquete. O app e a web compartilham aparência e regras, mas organizam a interface conforme o espaço do aparelho. Implementação própria em React Native/Expo; nenhum código ou imagem dos dashboards de referência foi incorporado.

## Referências visuais

- [Creative Tim — Vision UI Dashboard React](https://demos.creative-tim.com/vision-ui-dashboard-react/#/dashboard): inspiração para fundo escuro, destaque azul, cartões e navegação lateral.
- [Mohammad Shimul — Smart Home Dashboard, Dribbble](https://dribbble.com/shots/26401049-Smart-Home-Dashboard): referência de composição modular para dispositivos e leituras.
- [Expo SDK 57 — safe-area-context](https://docs.expo.dev/versions/v57.0.0/sdk/safe-area-context/): biblioteca para acomodar barras, recortes e áreas seguras do aparelho.

Consulta das fontes: 01/10/2026. As referências servem como inspiração atribuída. Os layouts, desenho do quarto, componentes e comportamento implementados pertencem ao desenvolvimento deste projeto com apoio do Codex.

## Decisões e arquivos

- App.tsx: tema, composição, navegação compartilhada, status e dimensões dos controles.
- Até 759 px: uma coluna e navegação inferior fixa.
- De 760 a 1099 px: duas colunas com navegação inferior.
- A partir de 1100 px: menu lateral fixo e conteúdo em duas colunas.
- As larguras são decisões do projeto; não representam detecção do modelo físico do dispositivo. Um navegador de computador estreito também recebe o layout compacto.
- SafeAreaProvider/SafeAreaView: tratamento de áreas seguras; execução nativa ainda precisa de validação.
- package.json, package-lock.json e app.json: versão 0.2.0 e dependência safe-area-context compatível com Expo.
- Regras e simulador permanecem compartilhados; o indicador mantém cinco cores Manchester, seleção manual e opção de apagar.

## Verificações realizadas

- ESLint e TypeScript aprovados.
- Quatro testes de domínio aprovados.
- Exportação web gerada com sucesso.
- Navegador em 390 px: navegação inferior visível e sem transbordamento horizontal.
- Navegador em 320 px: documento sem transbordamento horizontal.
- Navegador em 820 px: duas colunas com navegação inferior, sem transbordamento horizontal.
- Navegador em 1440 px: menu lateral e painel em duas colunas.
- Em largura móvel: comando de 25% confirmado; desligar/religar restaurou 25%.
- Laranja confirmado sem alterar luz/sensores.
- Desconexão preservou as leituras e desabilitou switch e atalho de intensidade.

## Evidências para a monografia

**TIRE PRINT DESTA PARTE — V02-A:** painel do computador com menu lateral e duas colunas. Captura: capturas/v0.2.0_desktop1440_painel.jpg.

**TIRE PRINT DESTA PARTE — V02-B:** painel em 390 px com navegação inferior. Captura: capturas/v0.2.0_mobile390_painel.jpg. Trata-se de prévia web em largura móvel, não de execução Android.

**TIRE PRINT DESTA PARTE — V02-C:** continuação do painel móvel mostrando os controles. Registrar a largura, versão e estado confirmado.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF — V02-D:** alternar entre Painel, Configurações e Evidências; ajustar luz, trocar a cor Manchester e testar desconexão. Incluir o aviso de dados simulados e as confirmações. Vídeo/GIF ainda pendente.

## Limites e próxima ação

Android SDK/adb/emulador não encontrados no ambiente; execução Android não realizada. Validar em aparelho ou emulador antes de considerar o app móvel testado. Sensores e comandos são simulados; Node-RED/ESP32 permanecem pendentes. A consulta de dependências continua com 10 alertas moderados já documentados, sem altos/críticos na instalação. Revisão visual por César/equipe pendente.
