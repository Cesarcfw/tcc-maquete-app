# SAMAHI v0.4.0 — redesign baseado no Stitch

Status: candidata em revisão. Responsável pelo aplicativo: César. Base de trabalho: branch `feat/stitch-samahi`, derivada da documentação v0.3.0. Não houve merge, release final, atualização do APK ou publicação de produção por esta tarefa.

Registro de acompanhamento: [Notion](https://app.notion.com/p/3eec1303cee08144b50ff720997414bb) e [card em revisão no Trello](https://trello.com/c/4jfv2Oc6).

## Origem e escopo

César forneceu `stitch_maquete_conectada_redesign/`: 15 propostas de telas com HTML/PNG e dois DESIGN.md. São referências visuais, não código confiável para executar nem resultados de experimentos. A implementação continua em React Native/Expo, com React Native Paper já usado no projeto, sem Tailwind/CDNs em tempo de execução. O logo SAMAHI foi copiado do PNG válido fornecido para assets/samahi-logo.png. As fontes de sistema permanecem nesta etapa; não foram instaladas as fontes remotas do HTML.

SAMAHI significa Sistema de Automação e Monitoramento de Ambientes Hospitalares Inteligentes. Slug do Expo, identificador Android, repositório e projeto de distribuição foram preservados; o nome de exibição e a versão candidata mudaram para SAMAHI 0.4.0. versionCode 2 é configuração para o próximo build, não prova de novo APK.

## Auditoria do material fornecido

- Quatro arquivos chamados screen.png são texto de 28 bytes (`<FIFE Image failed to fetch>`), não imagens: cadastro desktop, cadastro mobile, painel mobile claro, conexões e dispositivos. Os respectivos HTMLs foram lidos para recuperar a estrutura. Os originais foram preservados.
- SAMAHI, NexoConecta e Maquete Conectada aparecem misturados. A implementação usa SAMAHI.
- Painel mobile escuro contém cabeçalho/identidade repetidos. O aplicativo usa um cabeçalho global; a identificação do quarto fica no conteúdo.
- Imports da fonte Material Symbols são duplicados em HTMLs. Não foram transplantados; o aplicativo usa seu provedor de ícones.
- Há elementos estáticos ou manipuladores vazios: busca, filtros, botões de exportar, sincronizar, cadastro e seleção. Os controles implementados possuem ação; não foram adicionados botões sem comportamento.
- Valores como 682 ppm, 22 ms, 99,3%, 142 eventos, firmware 2.4.1, pressão/escala de conforto e confirmação física não são medidos na base. Foram removidos. O histórico mostra contagens dos eventos locais e confirmações explicitamente simuladas.
- Manchester estava associado a falhas/pressão/manutenção no DESIGN.md Operations. No código, Manchester continua seleção manual do indicador do paciente; gás, conectividade e comandos têm estados independentes.
- Classificação de gás tóxico, limiar ADC, calibração, associação de pacientes, fluxos de atendimento e métricas clínicas não foram implementados. Exigem requisitos e ensaios próprios.
- Instruções acadêmicas e seção Evidências foram retiradas da interface. A documentação e os roteiros permanecem em docs, Notion e Trello.

## Telas implementadas

- Perfis fictícios, sem senha ou autenticação.
- Quartos: cartões, busca por nome/leito/ala/dispositivo, filtros habilitado/desativado e estado vazio.
- Painel: planta ilustrada sem escala; controle da iluminação com 0–100%, retorno confirmado e atalhos; temperatura/umidade; estado do gás; indicador Manchester manual.
- Páginas dedicadas de iluminação, sensores e Manchester; no celular, atalhos no painel.
- Histórico por ambiente: busca de ação/usuário, filtros de informações/confirmações/falhas e linha do tempo.
- Conta: permissões do quarto selecionado, tema, reduzir animações e laboratório de simulação.
- Conexões: seletor de ambiente, dados locais, editar/testar, desativar e reativar.
- Cadastro/edição: nome, leito, ala, dispositivo e URL. Valida campos, duplicidade de leito/dispositivo e HTTP/HTTPS sem credenciais.
- Usuários: seleção/criação fictícia e concessão imediata por ambiente e grupo; sensores/histórico não recebem controle.
- Alerta de gás: mantém a faixa de borda a borda, movimento contínuo e saída à direita existentes; reconhecer não normaliza a detecção. Um aviso permanece após fechar enquanto a detecção do quarto selecionado continuar.

## Diferenças de arquitetura

`src/domain/rooms.ts` define RoomDefinition, initialRooms, roomVisible e roomError. Metadados dos ambientes e perfis ficam no coordenador DemoApp, em memória.

`useSimulator(environmentId)` agora guarda sessões em um mapa por id. Cada sessão tem device, scenario, pending, notice e até 30 logs. O relógio atualiza o recebimento dos ambientes em cenário normal/timeout a cada segundo. Ao trocar de ambiente ou perfil, o timer de comando pendente é cancelado e a geração é invalidada; um retorno antigo não aplica comando em outro quarto. Ao voltar a um quarto, seu último estado e histórico permanecem durante esta instância. O reset afeta somente o quarto selecionado.

`DemoApp.tsx` coordena navegação, perfis, catálogo, cadastro e permissões. Componentes Brand, Panel, Note, Blueprint, Metric e Dashboard compõem a apresentação. A paleta compartilhada continua em theme.ts. Blueprint é um esquema em Views, não render de CAD nem gêmeo digital validado.

`LightSlider.web.tsx` usa input range do navegador, com teclado, valor e estado desabilitado acessíveis. Isso corrige o controle web da biblioteca que não expunha esses atributos corretamente. `LightSlider.tsx` conserva o controle nativo para Android/iOS. No celular, iluminação vem antes de sensores, Manchester e planta; desktop usa duas colunas. O logo fornecido tem uma base branca para manter contraste no tema escuro.

Novo ambiente concede as funções somente ao criador; outros usuários precisam de concessão explícita. Administração não ignora canAccess nos comandos. roomVisible permite ao administrador configurar o catálogo sem conceder automaticamente leituras ou comandos. A matriz local é apenas demonstração, não proteção de dados reais.

Teste de conexão valida campos e aguarda 700 ms de simulação. Edição, navegação, troca de perfil/ambiente e mudança de cenário invalidam o teste pendente. Não existe fetch, MQTT, WebSocket, backend, storage, login real ou hardware conectado.

Alertas são apresentados para o quarto selecionado e para usuários com leitura de sensores. Não há central de alarmes de todos os quartos nem notificações em segundo plano. O histórico é limitado e volátil; não é trilha de auditoria persistente.

## Critérios de verificação e evidências

TIRE PRINT DESTA PARTE: painel desktop claro/escuro, celular, cadastro com erro de duplicidade, matriz por ambiente, histórico filtrado, modo offline com último estado preservado. Identificar versão, plataforma web e simulação.

MOSTRE FUNCIONANDO EM VÍDEO OU GIF: 25% → apagar → religar; confirmação atrasada e timeout; detectar gás → reconhecer → voltar → reabrir; trocar quarto sem misturar estados; conceder acesso a um novo ambiente e trocar perfil; três ciclos da faixa com redução de animações.

Capturas web responsivas não comprovam funcionamento nativo. Nenhum teste com sensor real ou novo APK foi realizado nesta tarefa. A pasta docs/capturas guarda somente evidências efetivamente capturadas, com o contexto descrito no registro de validação.

## Referências

Referência visual principal: arquivos fornecidos por César na pasta stitch_maquete_conectada_redesign, preservados nesta branch.

- [React — estado de componentes](https://react.dev/learn/state-a-components-memory).
- [React — useEffect](https://react.dev/reference/react/useEffect).
- [React Native Paper — temas](https://oss.callstack.com/react-native-paper/docs/guides/theming).
- [React Native — Animated](https://reactnative.dev/docs/animated) para a animação de gás já existente.
- [Expo — exportação web](https://docs.expo.dev/deploy/web/).
- [Referência Manchester e limites do indicador](manchester.md).
- [Arquitetura histórica v0.3.0](arquitetura.md) e [manual histórico](manual-desenvolvimento.md), agora acompanhados deste registro.

## Validação da candidata

- Código: lint sem avisos, TypeScript e exportação web aprovados; 11 testes de domínio aprovados, incluindo três de cadastro/concessões por ambiente.
- Navegador web: painel revisado em 320, 390, 768 e 1440 px. Em 320 px, body e controles não excederam a largura disponível. Temas claro/escuro conferidos. Nenhum erro de console observado; avisos de depreciação/fallback de animação de Paper/React Native Web continuam presentes.
- Luz: 65% → 25% confirmado; timeout de 5 s preservou 25%. Teclado alterou 25% → 26% com confirmação. Quarto 02 permaneceu em 50%, independentemente do Quarto 01. Troca durante um comando de 100% cancelou o comando e preservou 26% no quarto de origem.
- Cadastro: leito L-01 repetido foi recusado; L-02 e dispositivo distinto permitiram criar um segundo ambiente; teste de conexão apresentou retorno explicitamente simulado. Matheus continuou vendo apenas o primeiro quarto e sua luz permaneceu somente leitura.
- Histórico: filtro Confirmações e busca por 26% retornaram somente a confirmação correspondente. O histórico é volátil; cancelamentos passam a ser registrados como informação.
- Gás: detectar, reconhecer e fechar foram conferidos; reconhecimento manteve a detecção e Manchester. A saída à direita e o aviso persistente continuam; não foram gravados GIFs nem medidos ciclos nesta tarefa.
- Capturas reais: [desktop claro](capturas/v0.4.0-desktop-claro.png), [desktop escuro](capturas/v0.4.0-desktop-escuro.png), [mobile escuro](capturas/v0.4.0-mobile-escuro.png), [histórico filtrado](capturas/v0.4.0-historico-filtrado.png) e [gás](capturas/v0.4.0-gas-desktop.png). Todas são navegador web com dados de simulação.
- Pendente: revisão de César/equipe, gravações, teste Android/iOS desta versão, persistência, autenticação e integração física. A web publicada e o APK anterior continuam v0.3.0 até uma publicação autorizada.
