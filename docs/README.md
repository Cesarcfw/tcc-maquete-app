# Documentação do SAMAHI

Base técnica: código do aplicativo **0.6.0**, backend **0.1.0**, esquema próprio SQLite **1**, protocolo virtual **1**. Revisão documental: **17/10/2026**. Versões de dependências são declaradas nos manifests e fixadas nos lockfiles; não equivalem à versão de um serviço instalado fora do repositório.

## Guias atuais

| Necessidade | Documento |
| --- | --- |
| Entender a solução e seus limites | [Arquitetura](arquitetura.md) |
| Encontrar e modificar o código | [Manual de desenvolvimento](manual-desenvolvimento.md) |
| Entender bibliotecas e versões | [Tecnologias](tecnologias.md) |
| Saber o que deve funcionar | [Requisitos e aceitação](requisitos.md) |
| Instalar e configurar | [Instalação](instalacao-configuracao.md) |
| Integrar Node-RED | [Integração local](integracao-node-red-local.md) |
| Consumir as APIs | [Contrato e OpenAPI](api/README.md) |
| Entender banco e persistência | [Modelo de dados](modelo-dados.md) |
| Entender contas e permissões | [Autenticação](autenticacao-persistencia-local.md) |
| Avaliar proteção e riscos | [Segurança](seguranca.md) e [relato privado](../SECURITY.md) |
| Fazer backup e resolver problemas | [Operação](operacao.md) |
| Testar e entregar versões | [Testes e versões](testes-versoes.md) |
| Usar no telefone | [Teste integrado](teste-app-integrado.md) e [APK](gerar-apk.md) |
| Publicar a interface web | [Vercel](publicacao-vercel.md) |
| Capturar material acadêmico | [Evidências](evidencias.md) |
| Consultar escolhas técnicas | [ADRs](adr/README.md) |
| Consultar termos/fontes | [Glossário](glossario.md) e [referências](referencias.md) |

Detalhes de funcionalidades: [Dia/Noite](modos-dia-noite.md), [histórico](historico-alertas.md), [preferências](preferencias-locais.md), [Manchester](manchester.md), [interface](interface-produto.md) e [identidade visual](identidade-visual/README.md). Esses registros contêm ensaios datados da implantação de cada recurso; a situação de distribuição atual está no [registro do APK 0.6.0](apk-v0.6.0.md).

## Registros históricos e entregas fechadas

Não usar documentos desta seção como instrução atual de instalação.

- Versões: [0.1.0](registro-v0.1.0.md), [0.2.0](registro-v0.2.0.md), [0.3.0](registro-v0.3.0.md); [redesign Stitch](redesign-stitch-samahi.md) e [protótipo de contas](prototipo-figma-contas-permissoes.md).
- Builds: [APK 0.4.1](apk-v0.4.1.md), [APK 0.5.0](apk-v0.5.0.md). Build não significa aceite funcional.
- Documentação anterior preservada: [arquitetura v0.3](arquitetura-v0.3.0.md), [manual v0.3](manual-desenvolvimento-v0.3.0.md), [autenticação inicial](autenticacao-persistencia-registro-inicial.md), [Node-RED inicial](integracao-node-red-registro-inicial.md), [APK inicial](gerar-apk-registro-inicial.md), [Vercel inicial](publicacao-vercel-registro-inicial.md), [evidências iniciais](evidencias-registro-inicial.md) e [teste móvel inicial](teste-app-integrado-registro-inicial.md).
- [Pacote fechado para Matheus — 0.6.0](material-matheus-v0.6.0/SAMAHI_v0.6.0_documentacao_para_Matheus.md): PDF, DOCX, Markdown e figuras. Mantido como fotografia da entrega; não reescrito por esta revisão.

## Convenções de manutenção

Arquitetura organizada com inspiração no arc42, diagramas de contexto/contêineres inspirados no C4, APIs em OpenAPI 3.1.1 e decisões em ADR. São práticas adotadas de forma proporcional ao projeto, sem declaração de certificação ou conformidade integral com norma.

O código e testes são a fonte do comportamento implementado. Cada PR que alterar contrato, dado persistido ou operação deve atualizar os documentos correspondentes, CHANGELOG, cartão e registro de evidências. Uma proposta futura deve estar identificada como pendente; aprovação de build, teste web e aceite físico são estados diferentes.
