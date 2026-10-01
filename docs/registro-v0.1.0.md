# Registro de desenvolvimento — v0.1.0

## Problema e entrega

Era necessário transformar o pré-projeto em um app que pudesse ser navegado e avaliado antes da integração física. Foram implementadas as telas Painel, Configurações e Evidências, com sensores simulados, iluminação de 0 a 100%, indicador externo e cenários de falha.

## Decisões

- React Native/Expo/TypeScript para manter uma base móvel com prévia no navegador.
- Simulador local para permitir revisar a interface antes da disponibilidade do hardware.
- Separar a confirmação de um comando do valor solicitado, preservando o reportado em falhas.
- Usar GitHub flow, PR e documentação por versão para registrar a evolução de César.

## Validação

Verificações realizadas no Windows:

- ESLint sem erros ou avisos.
- TypeScript sem erros.
- Quatro testes de domínio aprovados: intensidade/restauração, intervalo válido, leitura antiga e independência do indicador.
- Exportação web gerada pelo Expo.
- No navegador: intensidade de 25% confirmada; desligar/religar restaurou 25%; slider alterou para 50%; indicador mudou para verde.
- Sem comunicação: controles de luz e intensidade desabilitados e leitura preservada.
- Falha de comando: tentativa de 100% expirou após 5 s e manteve 50% reportado.
- Recuperação: voltou a operação normal mantendo 50%, sem executar o comando falho.
- Dado antigo: aviso com leitura de 18 s e controles pausados.
- Largura web de 390 px: documento sem transbordamento horizontal. Isto verifica disposição web em largura móvel, sem substituir teste Android.
- GitHub Actions: primeira execução do fluxo Validar aplicativo concluída com sucesso no PR #1. Novos commits precisam passar pelo fluxo novamente.

Capturas estáticas: [painel](capturas/v0.1.0_E01_painel_web.jpg), [desconexão](capturas/v0.1.0_E05_sem_comunicacao_web.jpg), [falha de comando](capturas/v0.1.0_E06_falha_comando_web.jpg) e [leitura antiga](capturas/v0.1.0_E08_dados_antigos_web.jpg). A captura de largura 390 px mostra a primeira área visível do painel. Para documentar todo o painel móvel, registrar também a continuação após rolar a tela.

Vídeos/GIFs ainda não coletados. Android e integração física ainda não testados.

## Dependências

O npm audit reportou 10 alertas moderados na cadeia de dependências Expo/uuid/xcode, sem alertas altos ou críticos na consulta. A correção automática sugeria trocar para uma versão muito anterior do Expo, incompatível com o projeto; não foi aplicada. Registrar a revisão das dependências antes da integração/entrega final. Esses alertas de dependências não representam um teste de segurança completo do aplicativo.

## Evidências

Ver [roteiro](evidencias.md). Prints e vídeos devem informar o uso de dados fictícios. Fontes externas: [referências](referencias.md).

## Limites e próxima entrega

Sem integração física, servidor configurável, login ou histórico persistente. Próxima etapa: revisão de César, ajustes de telas e validação do contrato de integração.
