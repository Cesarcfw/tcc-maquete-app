# Histórico de versões

## 0.5.0 — APK interno gerado para revisão

- Aplicativo atual com login real, permissões, SQLite no backend, painel Stitch e integração local autenticada com o ESP virtual do Node-RED.
- Android versionCode 4, mesmo pacote/assinatura do projeto. Perfil preview produz APK instalável com HTTP local para ensaios; não é publicação em loja ou release final.
- Túnel HTTPS não incluído. O endereço do backend permanece editável em Configurar conexão. Banco, credenciais e arquivos .env locais ficam fora do envio EAS.
- Build EAS concluída FINISHED, APK baixado e estrutura básica/hash conferidos. Link e instalação em docs/apk-v0.5.0.md. Instalação e execução do APK no aparelho continuam pendentes; o teste anterior no Expo Go não substitui essa validação.

## Em desenvolvimento — autenticação e persistência locais

- Iniciador de teste integrado no telefone: seleciona rede, reutiliza Node-RED, abre backend em 3002 e Expo Go em 8082 com endereço do servidor e IP do QR configurados. Instâncias existentes preservadas; regras de firewall específicas e removíveis para a sub-rede local.
- Cliente nativo usa Bearer sem cookies; botão Testar servidor na entrada. Nova suíte de integração reproduz requisições nativas e verifica login, controles, sensores, gás, histórico e logout com banco descartável. Roteiro e limites em docs/teste-app-integrado.md.
- Entrada centralizada horizontal e verticalmente como a demonstração, com rolagem em telas menores. Campos web recebem esquema de cor e estilos de preenchimento automático compatíveis com o tema, incluindo foco; implementação nativa separada sem CSS.
- Administração integrada ao layout Stitch: usuários com busca e cadastro em diálogo, permissões por ambiente com salvamento explícito, cartões de conexões, cadastro/edição de quartos e segurança da conta. Temas compartilhados com a entrada; versões mobile empilham os cartões sem sobreposição.
- Componentes Panel/Note compartilhados entre painel, entrada e administração; removida a página administrativa que duplicava os controles de operação. Configuração do servidor fica recolhida na entrada; o celular prioriza o formulário.
- Correção da regressão visual: painel Stitch restaurado com login real, quartos persistidos e telemetria/comandos autenticados; formulários administrativos acessíveis pelo menu. Entrada reutiliza logo e planta do projeto.
- Backend Express/Better Auth com SQLite local: contas, sessões, quartos, dispositivos, concessões e auditoria persistentes.
- Entrada por email/senha, cadastro pelo administrador, troca/redefinição de senha, desativação/reativação e revogação de sessões.
- Autorizações por quarto/grupo verificadas no servidor e campos da telemetria filtrados; administrador não ignora concessões de operação.
- Comandos mediados pelo backend com confirmação e deduplicação; Node-RED continua sendo simulador, sem hardware real.
- Nova entrada autenticada no app; demonstração antiga disponível isolada de chamadas de rede. Sessão do cliente somente em memória.
- Inicialização do administrador por terminal com senha oculta; backup consistente e roteiro de transferência para notebook.
- Documentação/evidências em docs/autenticacao-persistencia-local.md. Teste Android/LAN/HTTPS, novo APK e revisão da equipe pendentes.

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
