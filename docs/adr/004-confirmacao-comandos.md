# ADR-004 — Comando com confirmação

**Status:** adotado no código 0.6.0; registro retrospectivo em 17/10/2026.

## Contexto

Uma ação na tela pode falhar durante rede/aplicação; mudar o estado antes da resposta produz indicação enganosa.

## Decisão

Usar commandId, pendência, validação do ACK, resposta persistida e auditoria. Manter estado reportado em erro.

## Alternativas

Atualização otimista sem reconciliação foi rejeitada como regra para comandos da maquete. Não há broker/transação distribuída na solução atual.

## Consequências

Timeout é resultado incerto. Idempotência vale para a chave/corpo confirmados no backend; não garante exatamente uma vez no dispositivo. Concorrência entre clientes ainda pode alterar o estado em seguida.

## Evidência

`src/hooks/useAuthenticatedDevice.ts`, `backend/server.mjs` commands. [Arquitetura](../arquitetura.md) · [índice ADR](README.md).
