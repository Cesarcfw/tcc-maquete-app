# Documentação do SAMAHI

A referência deste código é o aplicativo **1.0.0**, o backend **0.1.0**, o esquema SQLite **1** e o protocolo de telemetria **1**. Os manifests e lockfiles identificam as dependências do código. A preparação do APK está registrada no [guia da candidata 1.0.0](apk-v1.0.0.md).

| Cenário | Onde começar |
| --- | --- |
| Operar a maquete com a placa | [Integração física](integracao-esp-fisico.md) e [rede do ESP](rede-esp-notebook.md) |
| Apresentar com o notebook | [Pacote privado](pacote-notebook.md), [APK integrado](apk-v1.0.0.md) e [roteiro no telefone](teste-app-integrado.md) |
| Desenvolver sem o ESP | [Instalação local](instalacao-configuracao.md) e [Node-RED simulado](integracao-node-red-local.md) |
| Explorar interface sem servidor | [Edição offline para avaliação](demo-orientador-offline.md) |
| Consultar os resultados e evidências | [Rede e notebook](rede-esp-notebook-validacao.md), [evidências](evidencias.md) e [revisão documental](verificacao-documentacao.md) |

## Guias atuais

Entrega privada preparada em 22/11/2026: [pacote portátil para o notebook Windows x64](pacote-notebook.md), com runtime, dependências e snapshots. O ZIP fica fora do GitHub.

Operação preparada em 22/11/2026: [rede própria do ESP, Wi-Fi configurável e notebook](rede-esp-notebook.md). Novo inicializador para APK instalado mostra a URL de conexão. Consultar o guia para distinguir compilação e ensaio físico.

Integração disponível na main: [ESP físico](integracao-esp-fisico.md), com ponte UDP/ACK, tratamento dos sensores e instalação local. Para os ensaios virtuais, use o guia de [Node-RED simulado](integracao-node-red-local.md).

Rastreabilidade Android: [candidata 1.0.0](apk-v1.0.0.md), versionCode 7, e [compilação anterior 0.7.0](apk-v0.7.0.md), versionCode 6. Os registros distinguem compilação, instalação e aceite no telefone.

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

Detalhes de funcionalidades: [Dia/Noite](modos-dia-noite.md), [histórico](historico-alertas.md), [preferências](preferencias-locais.md), [Manchester](manchester.md), [interface](interface-produto.md) e [identidade visual](identidade-visual/README.md). Esses registros contêm ensaios datados da implantação de cada recurso; a situação de distribuição atual está no [registro do APK 0.7.0](apk-v0.7.0.md).

## Registros históricos e entregas fechadas

Não usar documentos desta seção como instrução atual de instalação.

- Versões: [0.1.0](registro-v0.1.0.md), [0.2.0](registro-v0.2.0.md), [0.3.0](registro-v0.3.0.md); [redesign Stitch](redesign-stitch-samahi.md) e [protótipo de contas](prototipo-figma-contas-permissoes.md).
- Builds: [APK 0.4.1](apk-v0.4.1.md), [APK 0.5.0](apk-v0.5.0.md). Build não significa aceite funcional.
- Documentação anterior preservada: [arquitetura v0.3](arquitetura-v0.3.0.md), [manual v0.3](manual-desenvolvimento-v0.3.0.md), [autenticação inicial](autenticacao-persistencia-registro-inicial.md), [Node-RED inicial](integracao-node-red-registro-inicial.md), [APK inicial](gerar-apk-registro-inicial.md), [Vercel inicial](publicacao-vercel-registro-inicial.md), [evidências iniciais](evidencias-registro-inicial.md) e [teste móvel inicial](teste-app-integrado-registro-inicial.md).
- [Registro da entrega para Matheus — 0.6.0](material-matheus-v0.6.0/SAMAHI_v0.6.0_documentacao_para_Matheus.md): texto e figuras da entrega. O PDF e o DOCX originais estão na [tag v0.6.0](https://github.com/Cesarcfw/tcc-maquete-app/tree/v0.6.0/docs/material-matheus-v0.6.0).

## Convenções de manutenção

Arquitetura organizada com inspiração no arc42, diagramas de contexto/contêineres inspirados no C4, APIs em OpenAPI 3.1.1 e decisões em ADR. São práticas adotadas de forma proporcional ao projeto, sem declaração de certificação ou conformidade integral com norma.

O código e testes são a fonte do comportamento implementado. Cada PR que alterar contrato, dado persistido ou operação deve atualizar os documentos correspondentes, CHANGELOG, cartão e registro de evidências. Uma proposta futura deve estar identificada como pendente; aprovação de build, teste web e aceite físico são estados diferentes.
