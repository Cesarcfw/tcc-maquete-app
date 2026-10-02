# v0.3.0 — protótipo interativo com React Native Paper

## Escopo e decisão

Responsável: César. Interface executável no projeto Expo existente, com componentes React Native Paper 5.15.3 e temas próprios claro/escuro. A proposta visual anterior foi convertida em comportamento local demonstrável. Figma permanece como registro de planejamento.

Identidade compartilhada: navegação inferior no celular, menu lateral no computador, cartões e formulários adaptados ao espaço. Ilustração do quarto feita em componentes nativos, sem copiar imagens dos sites de referência.

## Implementado

- Painel com iluminação liga/desliga, intensidade 0–100%, sensores simulados e indicador Manchester manual.
- Confirmação simulada antes de atualizar o estado; desligar e religar restaura a última intensidade positiva.
- Perfis fictícios César (administrador), Gabriel e Matheus; criação de outros perfis sem acesso inicial.
- Permissões por pessoa, ambiente e grupo: sem acesso, visualizar ou controlar. Sensores e histórico só permitem leitura. Administração não ignora as concessões de funções.
- Administrador configura um ambiente e dispositivo de exemplo, testa e salva a conexão localmente e pode desativá-la.
- Histórico de comandos identificado por perfil; cenários normal, offline, leitura antiga e sem confirmação.
- Trocar perfil ou alterar concessões cancela comandos pendentes para evitar aplicação posterior na sessão errada.
- Tema claro/escuro e redução de animações, com atenção à preferência do sistema. Animação de iluminação após confirmação.

## Limitações

Dados, usuários, teste de conexão e confirmações são simulados. Não há autenticação, senha, convite, recuperação, persistência, API, proteção no servidor ou ESP32 real. Recarregar reinicia a sessão. Permissões locais demonstram a regra; a versão integrada deverá validá-las no backend. Um ambiente demonstrativo, sem cadastro de vários ambientes nesta entrega. Gás e fechadura aparecem como futuras expansões desabilitadas. Manchester é seleção manual de sinalização; não classifica pacientes.

## Validação realizada

- `npm run lint`: passou, sem avisos.
- `npm run typecheck`: passou.
- `npm test`: seis testes de domínio passaram, incluindo isolamento de acesso por ambiente/grupo e rejeição de controle em grupos de leitura.
- `npm run export:web`: passou; exportação estática local em `dist`.
- Navegador web: 320, 390 e 1440 px; temas claro e escuro; navegação inferior e lateral.
- Luz 25%, apagar e religar: retorno a 25% após confirmação; envio pendente mantém estado anterior.
- Offline: controles bloqueados e estado preservado. Sem confirmação: 100% solicitado, resultado de falha e permanência em 25%.
- Administrador concede controle de iluminação a Matheus: controle disponível após trocar perfil, Manchester continua restrito e administração não aparece.
- Conexão: salvar bloqueado antes do teste; teste simulado concluído habilita salvar, com mensagem de configuração salva.
- Novo perfil: campos vazios rejeitados; nome/e-mail fictícios válidos criam perfil sem concessões iniciais.
- Em 320 px, rótulos da matriz abreviados para Não/Ver/Usar para evitar truncamento; legenda explica as opções.

Teste em Android/iOS nativos ainda pendente. Capturas web mobile não comprovam execução em aparelho. Vídeos/GIFs ainda devem ser gravados. A inspeção não constitui teste automatizado completo de todos os formulários.

Auditoria de dependências: 12 alertas (8 moderados e 4 altos) na cadeia de ferramentas Expo. Atualização compatível de node-forge mantém 1.4.0 e não resolve os alertas. Não foi aplicada correção forçada com troca incompatível do Expo. Reavaliar antes de disponibilização integrada.

## Evidências para a monografia

**TIRE PRINT DESTA PARTE:** painel web claro/escuro e mobile; identificação de simulação; controle de intensidade; módulo Manchester; matriz de permissões e painel do usuário restrito; confirmação e falha de comandos.

Capturas: `docs/capturas/v0.3.0-web-claro.png`, `v0.3.0-web-escuro.png`, `v0.3.0-mobile-claro.png` e `v0.3.0-mobile-escuro.png`.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** alternar tema; luz 25% → desligar → religar; trocar Manchester para laranja; enviar comando sem confirmação e observar preservação; administrador alterar permissão e trocar para o usuário; configurar/testar conexão. Descrever esses registros como simulação local.

## Referências verificadas

- [React Native Paper — instalação](https://oss.callstack.com/react-native-paper/docs/guides/getting-started): componentes e configuração do provedor.
- [React Native Paper — temas](https://oss.callstack.com/react-native-paper/docs/guides/theming): temas claro/escuro e escala de animações.
- [Código e licença MIT do React Native Paper](https://github.com/callstack/react-native-paper).
- Referências visuais e Manchester permanecem em `docs/referencias.md` e `docs/manchester.md`. Usadas como inspiração documentada, sem reprodução de imagens proprietárias.

Código próprio e documentação produzidos com apoio do Codex. Para a monografia, revisar o texto, confrontar os resultados com os registros e citar as fontes externas utilizadas.
