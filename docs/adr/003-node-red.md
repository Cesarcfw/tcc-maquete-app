# ADR-003 — Node-RED atrás do backend

**Status:** adotado no código 0.6.0; registro retrospectivo em 17/10/2026.

## Contexto

Sensores e comandos precisam de contrato ensaiável antes do ESP físico; as permissões devem ser aplicadas uniformemente.

## Decisão

Cliente operacional chama backend autenticado; backend chama Node-RED em loopback, que executa dispositivo virtual e cenários.

## Alternativas

Acesso direto do app ao Node-RED contornaria concessões do backend. Firmware físico continua outra frente e não foi substituído por um stub apresentado como real.

## Consequências

Node-RED precisa permanecer restrito ao host. A integração física exige substituir origem/ACK de forma coordenada, não apenas trocar URL.

## Evidência

`backend/server.mjs` upstream/redact; `integration/node-red/`. [Arquitetura](../arquitetura.md) · [índice ADR](README.md).
