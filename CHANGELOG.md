# Histórico de versões

## 0.3.0 — protótipo interativo em revisão

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
