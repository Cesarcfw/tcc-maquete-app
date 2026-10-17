# ADR-005 — Programação de luz no serviço

**Status:** adotado no código 0.6.0; registro retrospectivo em 17/10/2026.

## Contexto

A equipe substituiu controle por LDR por Dia/Noite com horários e intensidades configuráveis em Brasília, inclusive com app fechado.

## Decisão

Aplicar agenda no serviço virtual, compartilhar validador/cálculo de período, salvar configuração em arquivo e permitir pausa manual.

## Alternativas

Agenda apenas no telefone pararia ao fechar o app; LDR automático deixou de ser a regra requerida. Relógio/agenda no firmware físico ainda precisam ser definidos.

## Consequências

Depende do relógio do host e do processo/tick Node-RED. Falha ao persistir não deve confirmar. Sensores/gás/Manchester permanecem independentes.

## Evidência

`shared/lighting-schedule.cjs`, `integration/node-red/simulator.cjs`. [Arquitetura](../arquitetura.md) · [índice ADR](README.md).
