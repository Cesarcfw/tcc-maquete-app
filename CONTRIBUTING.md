# Desenvolvimento por versões

Usamos GitHub flow: main contém entregas revisadas. Cada alteração acontece em uma branch curta, com PR. Trello concentra as tarefas; Issues são usadas para defeitos reproduzíveis, sem duplicar todo o planejamento.

## Procedimento

1. Escolher o cartão no Trello e criar `feat/nome`, `fix/nome` ou `docs/nome` a partir de main.
2. Implementar uma mudança coerente; commits `feat:`, `fix:`, `docs:` ou `test:` com mensagens concretas.
3. Atualizar os testes necessários e executar typecheck, testes e exportação web.
4. Atualizar CHANGELOG e docs. Registrar versão, commit, teste, limites e roteiro de evidências no Notion.
5. Abrir PR com link do cartão e evidências; mover o cartão para Em revisão.
6. César revisa; depois da aprovação, integrar e criar tag/release. Ajustar package.json e app.json juntos.

## Numeração

Versões 0.x indicam desenvolvimento inicial. As entregas atuais são 0.1.0 (base simulada), 0.2.0 (identidade visual) e 0.3.0 (protótipo interativo com temas, perfis e permissões locais, gás e distribuição web/APK). Node-RED e ESP32 ainda não estão integrados; versões futuras serão definidas pelo escopo aceito. Correções sem novo escopo incrementam o terceiro número. Identificar prévias explicitamente, por exemplo `v0.3.0-preview.1`; não criar tag/release final sem revisão de César.

## Credenciais e autoria

Não versionar senhas ou tokens. Preservar as licenças dos componentes. A documentação diferencia texto autoral, decisões da equipe e referências externas. A revisão acadêmica deve ser feita pela equipe antes do uso na monografia.
