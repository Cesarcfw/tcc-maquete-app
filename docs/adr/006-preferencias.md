# ADR-006 — Preferências sem credenciais

**Status:** adotado no código 0.6.0; registro retrospectivo em 17/10/2026.

## Contexto

Endereço, tema e redução de movimento devem ser recuperados ao abrir o aplicativo, sem salvar senha/token junto.

## Decisão

Persistir snapshot versionado com whitelist, validação na leitura e fila de escrita; hidratar antes do login. Token permanece em memória.

## Alternativas

Salvar todo o estado de UI levaria dados transitórios/sensíveis ao armazenamento. Sessão persistente exigiria desenho específico e não foi implementada.

## Consequências

Reabrir exige login. Limpeza de dados/origem remove preferências. Falha de armazenamento precisa ficar visível; não salvar campo inválido.

## Evidência

`src/services/preferences.ts`, `src/hooks/usePreferences.ts`. [Arquitetura](../arquitetura.md) · [índice ADR](README.md).
