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

Dados, usuários, teste de conexão e confirmações são simulados. Não há autenticação, senha, convite, recuperação, persistência, API, proteção no servidor ou ESP32 real. Recarregar reinicia a sessão. Permissões locais demonstram a regra; a versão integrada deverá validá-las no backend. Um ambiente demonstrativo, sem cadastro de vários ambientes nesta entrega. Fechadura permanece como expansão futura. Manchester é seleção manual de sinalização; não classifica pacientes.

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

## Ajustes após teste do usuário no telefone

César informou que testou no telefone; sistema operacional e roteiro completo ainda não informados.

Sensor de gás incluído no escopo atual e implementado no painel: sem detecção, gás detectado e sensor indisponível. Cenários fictícios na Conta, disponíveis a perfis com leitura do grupo Sensores. Offline ou leitura antiga preservam o último estado e identificam a falta de leitura atual; o laboratório bloqueia novas injeções. Eventos ficam no histórico. Nenhuma leitura em ppm ou limite físico definido: sensor, gás-alvo e calibração serão acordados com Gabriel. Manchester permanece independente do alerta de gás.

**TIRE PRINT DESTA PARTE:** cartão de gás em alerta e sem dados. **MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** Conta → testar gás detectado → painel; depois indisponível e offline. Usar dados simulados na descrição.

**Visual para depois das funções:** borda fina referente ao quarto, com brilho pulsante suave na cor Manchester ativa. Implementar só após funções validadas, respeitando redução de movimentos; indicador apagado não deve pulsar. Anotação de melhoria, ainda não implementada.

Verificação complementar: lint, tipos, sete testes e exportação web passaram. Novo teste confirma que comandos de luz/Manchester preservam detecção de gás.

## Alerta ambiental e triagem separados

Manchester representa somente a classificação manual de triagem do paciente. O sensor de gás tem seu próprio estado, aviso e reconhecimento; não muda a classificação, a cor do LED externo nem o futuro brilho da borda Manchester.

Faixa preta/amarela com movimento contínuo suave nas listras para detecção de gás simulada. Respeita redução de movimentos com listras estáticas. Disponível nas telas para perfis autorizados a ler sensores, enquanto a detecção permanece ativa. Reconhecer registra evento, mantém a detecção e não apaga o aviso; uma nova ocorrência após normalização exige novo reconhecimento. Offline mantém o aviso da última detecção e informa falta de leitura atual. Não afirma toxicidade ou identifica o gás com um sensor genérico.

**TIRE PRINT DESTA PARTE:** faixa de gás com LED Manchester verde preservado, captura docs/capturas/v0.3.0-gas-faixa.png. **MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** definir Manchester verde, simular gás detectado, reconhecer e observar faixa persistente; retornar a sem detecção e provocar nova ocorrência. Respeitar a identificação de simulação no vídeo.

Verificação: lint, tipos, oito testes e exportação web passaram. No navegador, detecção e reconhecimento mantiveram Manchester verde e faixa visível. Teste nativo desta alteração ainda pendente.

## Aviso sobreposto com duas faixas

A apresentação atual substitui o aviso dentro da página por uma faixa sobre toda a interface, com fundo escurecido. A faixa vai da borda esquerda à direita da tela, sem margens laterais ou cantos arredondados; texto e botões permanecem centralizados em área de até 820 px. Listras pretas e amarelas ficam em cima e embaixo e percorrem direções opostas em loop infinito, com velocidade constante e ciclo de três segundos. A repetição desloca exatamente um intervalo de listras, para continuidade visual. A animação usa o controlador JavaScript compartilhado entre web e aplicativo e é interrompida ao fechar o aviso. Com movimentos reduzidos, fica estática.

Reconhecer mantém a janela aberta e a detecção ativa. Depois, “Voltar ao aplicativo” fecha apenas a janela; o cartão continua indicando gás detectado e oferece “Ver alerta de gás” para reabri-la. Uma nova ocorrência exige reconhecimento novamente. O aviso não altera Manchester nem identifica toxicidade.

**TIRE PRINT DESTA PARTE:** faixa de ponta a ponta no computador e celular: `docs/capturas/v0.3.0-gas-faixa-inteira.png` e `docs/capturas/v0.3.0-gas-faixa-inteira-mobile.png`. As capturas gas-sobreposto anteriores registram o formato de janela substituído. **MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** detectar gás na Conta, mostrar movimento das duas faixas por pelo menos três ciclos, reconhecer, voltar ao painel e reabrir; mostrar redução de movimentos com listras estáticas. Identificar a demonstração como simulação.

Verificação desta alteração: lint, tipos, oito testes e exportação web passaram. No navegador, conferidos reconhecimento, retorno ao painel com detecção mantida, reabertura e layout em 390 px. Validação nativa e gravação ainda pendentes.

Revisão de largura e loop: lint, tipos, oito testes e exportação web passaram novamente. Faixa conferida em 1280 e 390 px. Na web, limites laterais em 0 e 1280 px; deslocamentos das listras continuaram mudando em observações separadas após vários ciclos. Capturas mostram faixa sem margens laterais. Esse registro não substitui a gravação nem validação em Android/iOS nativos.

## Saída da faixa para a direita

“Voltar ao aplicativo” desloca a faixa inteira para a direita em 380 ms, ao mesmo tempo que retira o fundo escurecido. A janela fecha ao concluir a animação, sem apagar a detecção nem alterar Manchester. O botão fica desabilitado durante a saída para evitar acionamentos repetidos. Ao reabrir, a faixa retorna à posição inicial. Com movimentos reduzidos, o fechamento é imediato. O retorno físico do Android usa o mesmo fechamento após reconhecimento; validação nativa desse gesto ainda pendente.

**TIRE PRINT DESTA PARTE:** captura intermediária real da saída em `docs/capturas/v0.3.0-gas-saida-direita.png`. **MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** reconhecer, voltar ao aplicativo, observar deslocamento para a direita e painel com detecção preservada; reabrir e repetir com movimentos reduzidos. Captura estática não comprova duração ou fluidez do movimento.

Verificação: lint, tipos, oito testes e exportação web passaram. Na web, saída observada em 1280 e 390 px, retorno à página, detecção mantida, reabertura e fechamento sem animação com movimentos reduzidos. A imagem foi capturada durante a transição. Teste em Android/iOS e gravação ainda pendentes.
