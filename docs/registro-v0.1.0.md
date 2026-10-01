# Registro de desenvolvimento — v0.1.0

## Problema e entrega

Era necessário transformar o pré-projeto em um app que pudesse ser navegado e avaliado antes da integração física. Foram implementadas as telas Painel, Configurações e Evidências, com sensores simulados, iluminação de 0 a 100%, indicador externo e cenários de falha.

## Decisões

- React Native/Expo/TypeScript para manter uma base móvel com prévia no navegador.
- Simulador local para permitir revisar a interface antes da disponibilidade do hardware.
- Separar a confirmação de um comando do valor solicitado, preservando o reportado em falhas.
- Usar GitHub flow, PR e documentação por versão para registrar a evolução de César.

## Validação

Preencher os resultados reais após as verificações. Não considerar execução Android concluída apenas porque o bundle web foi gerado.

## Evidências

Ver [roteiro](evidencias.md). Prints e vídeos devem informar o uso de dados fictícios. Fontes externas: [referências](referencias.md).

## Limites e próxima entrega

Sem integração física, servidor configurável, login ou histórico persistente. Próxima etapa: revisão de César, ajustes de telas e validação do contrato de integração.
