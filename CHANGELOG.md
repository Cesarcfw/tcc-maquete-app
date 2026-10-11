# Histórico de versões

## 0.4.1 — APK de teste com integração Node-RED

- Preparação de APK interno Android com redesign SAMAHI e cliente HTTP Node-RED; versão Android 3.
- HTTP sem TLS permitido apenas no perfil EAS preview para ensaio na rede local; demais perfis o desativam.
- Build começa em demonstração interna, sem embutir IP do computador; endereço editável em Conexões.
- Arquivos .env locais excluídos do envio ao EAS. Equipamento real, teste físico Android e acesso LAN do Node-RED permanecem pendentes.
- Compilação EAS concluída FINISHED; APK disponível e integridade/estrutura básica verificadas. Link, hash e roteiro em docs/apk-v0.4.1.md, PR #9.

## Em desenvolvimento — integração Node-RED local

- Fluxo funcional com ESP virtual, sensores a cada 2 segundos, API HTTP v1 e controles de entradas para testes.
- App web envia luz, intensidade, modo automático, Manchester virtual e reconhecimento de gás pela API; valida confirmação e consulta telemetria periodicamente.
- Teste de conexão por HTTP para endpoints configurados; demo interna anterior preservada quando não há endpoint real.
- Timeout, offline, leitura antiga e mensagens inválidas não geram aplicação otimista. Sem hardware, autenticação real ou publicação em produção.
- Documentação, fluxo exportável, configuração de exemplo, testes e evidências em docs/integracao-node-red-local.md.

## 0.4.0 — SAMAHI, redesign Stitch em revisão

- Nova identidade SAMAHI, temas clínicos claro/escuro, navegação adaptada, planta esquemática e painel baseado nas telas fornecidas por César.
- Seleção, busca e cadastro local de quartos/leitos; rejeição de leito/dispositivo duplicado e validação do endereço. Novos ambientes exigem concessão explícita para outros usuários.
- Estado, cenários e até 30 eventos independentes por ambiente, com cancelamento ao trocar de ambiente/perfil.
- Busca/filtros funcionais no histórico; administração de conexões e permissões adaptada.
- Evidências acadêmicas removidas do produto e mantidas em docs. Valores de gás/latência/firmware/estatísticas inventados no export não incorporados.
- Preservados Manchester manual, confirmação simulada dos comandos, gás independente, reconhecimento e animação da faixa com movimentos reduzidos.
- Quatro PNGs inválidos e inconsistências de nomes/cabeçalhos do material original registradas em docs/redesign-stitch-samahi.md.
- Controle de intensidade web com teclado e valor acessível correto; controle nativo preservado. Iluminação aparece primeiro no painel do celular.
- Código candidato; sem release final, publicação de produção ou novo APK nesta etapa.

## Documentação — arquitetura da base v0.3.0

- Documentação de Arquitetura de Software reconstruída a partir da main 47398c1: contexto, módulos, dados, fluxos, permissões, gás/Manchester, distribuição, decisões, limites e proposta de integração claramente separada.
- Manual de estudo e manutenção com mapa de alterações, exemplos, roteiro de testes, explicação ao orientador e marcações de prints/vídeos/GIFs.
- Corrigida a numeração histórica em CONTRIBUTING: v0.2/v0.3 são entregas de protótipo; Node-RED/ESP32 continuam futuros. Sem alteração no código do app ou na versão 0.3.0.

## 0.3.0 — protótipo interativo em revisão

- Web v0.3.0 publicada em https://tcc-maquete-app.vercel.app, projeto Vercel vinculado ao GitHub; configuração de build/exportação em dist e exclusão de artefatos locais. Acesso HTTP sem login e fluxo de luz/gás conferidos. Configuração proposta na branch feat/publicacao-vercel.
- APK Android v0.3.0 (1) gerado com sucesso no EAS preview, projeto vinculado à conta cesarcfw e exclusões de artefatos/documentação no envio; instalação e teste nativo ainda pendentes.
- Ao voltar ao aplicativo, faixa de gás desliza para a direita em 380 ms e fundo escurecido desaparece junto; movimentos reduzidos fecham imediatamente.
- Alerta ambiental sobreposto de uma borda à outra da tela, com faixas pretas/amarelas em cima e embaixo em loop contínuo e velocidade constante; reconhecimento independente e triagem do paciente explícita.
- Sensor de gás incluído: sem detecção, detectado e indisponível; laboratório e grupo Sensores.
- Borda pulsante Manchester anotada para a etapa visual após validar funções.

- React Native Paper, temas claro/escuro e movimentos reduzidos.
- Perfis fictícios, criação local e concessões por ambiente/grupo.
- Administração de conexão simulada e cancelamento de comandos ao trocar sessão.
- Oito testes de domínio e registro de validação/evidências em docs/registro-v0.3.0.md.
- Sem autenticação real, persistência ou integração ESP32 nesta etapa.

## Planejamento — protótipo Figma de contas e permissões

- 35 telas editáveis mobile/web e 217 ligações de navegação no Figma.
- Propostas de conta por convite, gestão de conexões e acesso por pessoa, ambiente e grupo de funções.
- Registro de referências, critérios de autorização, evidências e limitações em docs/prototipo-figma-contas-permissoes.md.
- Documentação de planejamento: não altera a versão ou o código executável do aplicativo.

## 0.2.0 — prévia visual em revisão

- Identidade escura inspirada nas referências escolhidas por César, implementada com componentes próprios.
- Celular: navegação inferior fixa, cartões em uma coluna e atalhos de intensidade maiores.
- Tablet: navegação inferior e cartões em duas colunas quando houver espaço.
- Computador: navegação lateral fixa e painel em duas colunas.
- Áreas seguras com react-native-safe-area-context; mesma simulação e regras da versão anterior.
- Documentação da origem visual, registro de validação e capturas separadas por tamanho de tela.

## 0.1.0-preview.3 — ajuste Manchester

- Indicador com as cinco cores e respectivos nomes das prioridades do Protocolo de Manchester.
- Laranja e amarelo adicionados; seleção manual e desligado como comando separado de apagar o LED.
- Referência GBCR e roteiro de evidências documentados em docs/manchester.md.

## 0.1.0 — candidato em revisão

- Painel de sensores simulados.
- Luz: ligar/desligar, slider 0 a 100% e atalhos de intensidade.
- Indicador externo azul, verde, vermelho e desligado.
- Cenários normal, sem comunicação, dado antigo e comando sem confirmação.
- Registro da atividade da sessão e roteiro de capturas.
- Documentação, testes de domínio e validação automática por PR.

Validação Android e integração real não realizadas nesta entrega.
