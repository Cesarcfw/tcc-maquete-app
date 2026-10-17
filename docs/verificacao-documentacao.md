# Verificação da revisão documental

Revisão de 17/10/2026 sobre o código do app 0.6.0. Base Git: `c4d183a` (documentação entregue para Matheus); código da build Android: `94f0ea1`. Branch desta revisão: `docs/documentacao-tecnica-v0.6.0`. Não foi gerada nova build nem realizado novo teste físico.

## Escopo e método

Leitura de entradas do cliente, serviços/hooks, regras compartilhadas, rotas/middleware/schema do backend, simulador/fluxo Node-RED, scripts de operação e configuração de build/CI. Comparação dos guias existentes com esse comportamento; registros antigos preservados e identificados. Pacote fechado de Matheus mantido sem alteração.

Documentação estruturada por visões de arquitetura, requisitos, contratos, dados, segurança, operação e decisões. Os diagramas representam o código; não constituem evidência de hardware. As referências externas estão em [referencias.md](referencias.md).

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Aprovado |
| `npm run typecheck` | Aprovado |
| `npm test` | 24 testes aprovados |
| `npm --prefix backend test` | 3 suítes HTTP aprovadas, banco e dispositivo virtual temporários |
| `npm run export:web` | Aprovado, saída em dist |
| Redocly CLI, regras minimal, dois OpenAPI | Ambos válidos, sem erros ou avisos; 17 operações no backend e 4 no Node-RED |
| Links locais Markdown e referências OpenAPI | Verificação automatizada pelo script docs:check; sem consulta a URLs externas/âncoras |
| `git diff --check` | Verificação de whitespace antes do commit |

Na primeira execução restrita, o teste de persistência não conseguiu gravar no temporário do Windows e os testes HTTP receberam `EACCES` nas conexões locais. Repetidos com acesso aos recursos necessários, todos passaram. O warning “Invalid password” é produzido pelo caso negativo de login, não um login real da equipe.

## Limitações explicitadas

- Node-RED segue virtual e atende um quarto. ACK virtual é preservado no contrato/auditoria.
- Backend valida parcialmente a telemetria upstream; OpenAPI não é validação de runtime.
- Backend admite underscore em commandId; Node-RED não. Exemplos usam o subconjunto interoperável.
- Observação de gás/conexão depende de requisições; não há monitor de incidentes autônomo.
- Backup/restore do notebook e aceite completo do APK instalado exigem execução e registro separados.
- Nenhuma instância operacional da equipe precisou ser encerrada ou reconfigurada para esta revisão. Os testes HTTP abrem serviços descartáveis e os encerram ao terminar.

Para repetir: [testes e versões](testes-versoes.md). Contagens e saídas pertencem a esta revisão, não são promessa de resultado para qualquer instalação futura.
