# Evidências técnicas e material para monografia

Evidências ficam fora da interface operacional do app. Base atual 0.6.0; a origem dos dados continua virtual. [Pacote fechado de Matheus](material-matheus-v0.6.0/SAMAHI_v0.6.0_documentacao_para_Matheus.md) e [catálogo de figuras](material-matheus-v0.6.0/catalogo_figuras.md).

## Registro mínimo

Para cada captura/ensaio: ID, requisito, data, versão/commit, build se houver, ambiente (web/Expo Go/APK), aparelho/viewport, origem dos dados, preparação, passos, esperado, observado, arquivo e responsável. Falha também é resultado: documentar sem substituir por uma expectativa. Use dados fictícios e não capture senha, token, cookie, auth-secret ou banco real.

| ID | Conteúdo para registrar | Requisito e limite |
| --- | --- | --- |
| EV01 | Login e catálogo | RF01/RF04; ocultar dados pessoais |
| EV02 | Permissões de leitura e controle | RF02/RF03; mostrar bloqueio no servidor |
| EV03 | Luz 0%, religar e intensidade | RF06; indicar ACK virtual |
| EV04 | Agenda, período, pausa manual e retomada | RF07/RF08; relógio Brasília e persistência |
| EV05 | Gás normal/detectado/unavailable e reconhecimento | RF09/RF11; não afirmar gás tóxico ou ppm |
| EV06 | Indicador Manchester independente | RF10; não afirmar classificação de paciente |
| EV07 | Offline/stale/timeout e recuperação | RF11/RQ02; observação depende de consulta |
| EV08 | Endereço, tema e movimento após reabrir | RF12; novo login esperado |
| EV09 | APK instalado e fluxo ponta a ponta | RF14; aparelho/Android/build identificados |
| EV10 | Restauração no notebook e rede de apresentação | RQ04; só considerar aprovado após ensaio real |

**TIRE PRINT DESTA PARTE:** arquitetura, trecho de concessões/redaction, ACK correlacionado, modelo de dados sem registros sensíveis e telas dos casos acima. Legendas devem informar o que a figura demonstra e o que permanece simulado.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** comando pendente → confirmação → falha sem confirmação; agenda virando com app fechado; alerta de gás reconhecido ainda ativo; permissões e bloqueio; persistência após reiniciar.

## Convenção de arquivos

Exemplo: `EV04_2026-10-17_v0.6.0_android-agenda.mp4`. Nome não substitui ficha do ensaio. Arquivos pesados devem ser compartilhados com acesso definido pela equipe; evitar inflar o histórico Git com gravações desnecessárias. Nunca alterar data/legenda para parecer que uma captura antiga pertence a uma build nova.

Na monografia, separar método, implementação, resultado observado e trabalho futuro. Diagramas são documentação técnica; não são prova de execução. Captura de viewport mobile no navegador não prova teste no telefone. A documentação de uma biblioteca sustenta o uso da tecnologia, mas não prova o desempenho do SAMAHI.
