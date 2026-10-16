# SAMAHI — interface do produto

## Decisão e escopo

César informou que os fluxos da versão anterior funcionaram em seu ensaio e solicitou uma interface sem referências a teste ou demonstração, mantendo o Node-RED atual. Esta mudança antecipa a limpeza visual: ela não depende mais da integração física, como constava no planejamento anterior.

A interface foi preparada como candidata para revisão. Não foi publicada uma release final nem recompilado o APK nesta entrega. O APK 0.5.0 já distribuído contém a interface anterior.

## Alterações

- Removido Explorar demonstração e o aviso correspondente na entrada. O painel exportado exige um workspace autenticado.
- Retirados rótulos de simulação do catálogo, cabeçalho, sensores, luz, indicador, histórico, confirmação e rodapé.
- Alerta de gás mantém faixa/animação e passa a usar o título ALERTA DE GÁS.
- Consulta administrativa apresenta idade da leitura sem exibir identificadores internos de origem.
- Verificar conexão substitui Testar servidor. A consulta de saúde continua disponível.
- Mensagens legadas de indisponibilidade/timeout são traduzidas no cliente para linguagem do serviço; códigos HTTP e respostas originais no servidor não mudam.
- Controles de cenários e perfis fictícios não são acessíveis pelo fluxo do produto. Implementações históricas internas permanecem no repositório; não há atalho de demonstração na entrada.
- Planta esquemática preservada como ilustração do ambiente.

## O que significa conectado e confirmado

Conectado significa que o backend recebeu uma leitura recente do serviço configurado. Comando confirmado pelo serviço significa que houve resposta válida com o mesmo identificador. Esses textos não afirmam confirmação de um ESP32 físico.

Node-RED permanece gerando telemetria virtual. Os identificadores `source: node-red-simulator`, `status: applied_in_simulator`, sua validação e o evento persistente `command_confirmed_simulator` foram preservados. A interface traduz esses detalhes para linguagem de operação; a documentação e a auditoria técnica mantêm a distinção entre simulação e equipamento real.

Não foram alterados o fluxo Node-RED, o backend, o banco real, as permissões ou a lógica de confirmação. A integração física futura exige adaptar transporte, origem e confirmação nas camadas envolvidas.

## Evidências para a monografia

**TIRE PRINT DESTA PARTE:** login sem atalho, catálogo, painel, histórico e conta, com temas claro/escuro. Capturas web em `docs/evidencias/interface-produto/`.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** login → quarto → intensidade → confirmação → gás/reconhecimento → histórico → logout.

Identificar figuras como interface web com serviço Node-RED virtual; registrar commit. Viewport de celular no navegador não equivale a APK instalado. Dados/conta de ensaio não representam pacientes reais.

## Verificação

- Lint, tipos, 14 testes existentes e exportação web aprovados.
- Conferência web com banco e conta descartáveis, em portas próprias: login, catálogo, luz 25% confirmada, histórico, conta e administração.
- Alerta de gás, reconhecimento e retorno conferidos. Layout responsivo em 390 × 844 com temas claro/escuro e sem textos de simulação nas telas revisadas.
- Revisão de César e execução de um novo APK instalado pendentes. O ensaio informado por César se refere à versão anterior à mudança visual.

Dados como ala/nome do ambiente são cadastros persistidos: esta alteração não os reescreve. O administrador pode editá-los em Ambientes.
