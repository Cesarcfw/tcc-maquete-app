# ADR-001 — Cliente compartilhado Expo

**Status:** adotado no código 0.6.0; registro retrospectivo em 17/10/2026.

## Contexto

A equipe precisa de navegador e Android com funções equivalentes e composição adequada a cada aparelho.

## Decisão

Usar Expo/React Native/TypeScript com componentes e domínio compartilhados, adaptando layout e interação.

## Alternativas

Dois clientes separados aumentariam manutenção; um site apenas não atende a distribuição APK desejada. Não foi feito benchmark entre frameworks.

## Consequências

Mudanças de UI podem afetar web e Android; validação em um alvo não comprova o outro. Atualizações precisam respeitar compatibilidade do SDK Expo.

## Evidência

`App.tsx`, `src/ui`, `package.json`, `app.config.js`. [Arquitetura](../arquitetura.md) · [índice ADR](README.md).
