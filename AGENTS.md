# Contexto do projeto

App de César para todas as funções disponibilizadas na maquete. Monografia é responsabilidade de outra frente; este repositório documenta o desenvolvimento do app.

## Regras de trabalho

- Português na interface e nos documentos da equipe.
- Distinguir dados simulados e confirmação simulada de equipamento real.
- Luz: ligar/desligar e intensidade de 0 a 100%; zero desliga e religar restaura a última intensidade positiva.
- Não apresentar comando como aplicado antes de confirmação; preservar o estado reportado em falha.
- Mudanças em branches `feat/`, `fix/` ou `docs/`, com PR para main. Não publicar release final sem revisão de César.
- Documentar cada mudança em docs e CHANGELOG. Manter Notion e Trello alinhados dentro da autorização da sessão.
- Registrar evidências com marcações “TIRE PRINT DESTA PARTE” e “MOSTRE FUNCIONANDO EM VÍDEO OU GIF”.
- Referências externas precisam de fonte primária e link funcional; não inventar resultados.
- Verificação: npm run typecheck, npm test e npm run export:web. Teste móvel deve ser registrado separadamente.
