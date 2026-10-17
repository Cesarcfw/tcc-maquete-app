# ADR-002 — Backend local com SQLite

**Status:** adotado no código 0.6.0; registro retrospectivo em 17/10/2026.

## Contexto

Login, concessões, ambientes e histórico precisam sobreviver à sessão e ser verificados fora da interface. A demonstração será inicialmente em PC/notebook.

## Decisão

Usar Node.js/Express/Better Auth e SQLite local; separar backend do bundle estático.

## Alternativas

Contas só no cliente não oferecem autorização confiável; banco remoto exigiria operação/conectividade adicional. SQLite atende o cenário local atual, sem comparação de desempenho com Postgres.

## Consequências

Backup inclui banco e segredo; não há alta disponibilidade. Evolução do esquema precisa migração explícita. HTTPS/rede ampliada continuam pendentes.

## Evidência

`backend/core.mjs`, `backend/server.mjs`, `backend/backup.mjs`. [Arquitetura](../arquitetura.md) · [índice ADR](README.md).
