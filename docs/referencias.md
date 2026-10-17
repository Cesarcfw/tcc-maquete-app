# Referências técnicas e padrões de documentação

Fontes primárias para estudo e atribuição. Lista consolidada na revisão de 17/10/2026; links servem para consultar a tecnologia, não para comprovar resultados do SAMAHI. Os comportamentos específicos são sustentados pelo código/testes e registros versionados deste repositório. Documentação “latest” de uma biblioteca pode diferir da versão fixada no lockfile.

## Estrutura documental

| Fonte | Uso no projeto |
| --- | --- |
| [arc42 — Overview](https://arc42.org/overview/) | Organização proporcional das visões e preocupações da arquitetura |
| [C4 model](https://c4model.com/) | Referência para contexto e contêineres; Mermaid é a notação usada nos guias |
| [OpenAPI Specification 3.1.1](https://spec.openapis.org/oas/v3.1.1.html) | Estrutura dos dois contratos JSON; não foi usado como gerador/validador de runtime |
| [Michael Nygard — Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) | ADR com contexto, decisão e consequências |
| [GitHub — GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow) | Branches curtas, PR e revisão |
| [Semantic Versioning 2.0.0](https://semver.org/) | Formato das versões e cuidado com evolução 0.x |
| [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) | Organização de alterações para pessoas; registros anteriores preservados |
| [Redocly — lint](https://redocly.com/docs/cli/commands/lint) | Verificação estrutural dos contratos documentados |

Não há alegação de certificação ISO, conformidade integral arc42/C4 ou adoção exaustiva de um processo regulado. Diagramas e ADRs foram produzidos para explicar o código existente.

## Tecnologias e operação

| Fonte | Assunto |
| --- | --- |
| [Expo — Create a project](https://docs.expo.dev/get-started/create-a-project/) | Base de criação |
| [Expo — SDK 57](https://docs.expo.dev/versions/v57.0.0/) | Referência da versão usada; conferir compatibilidade nos manifests/lockfiles |
| [Expo — Develop websites](https://docs.expo.dev/workflow/web/) | Desenvolvimento/exportação web |
| [Expo — Build APKs](https://docs.expo.dev/build-reference/apk/) | Perfil APK interno |
| [Expo — Environment variables](https://docs.expo.dev/guides/environment-variables/) | Valores EXPO_PUBLIC incorporados ao cliente |
| [React Native — Introduction](https://reactnative.dev/docs/getting-started) | Base móvel |
| [Callstack — React Native Slider](https://github.com/callstack/react-native-slider) | Controle deslizante |
| [AsyncStorage — repositório oficial](https://github.com/react-native-async-storage/async-storage) | Persistência local; implementação instalada 2.2.0 conferida para comportamento web |
| [Better Auth — Express](https://www.better-auth.com/docs/integrations/express) | Handler de autenticação |
| [Better Auth — Bearer](https://www.better-auth.com/docs/plugins/bearer) | Token e cabeçalhos |
| [Better Auth — Admin](https://www.better-auth.com/docs/plugins/admin) | Recursos de administração usados internamente pelo backend |
| [Better Auth — Database](https://www.better-auth.com/docs/concepts/database) | Esquema e dados de autenticação |
| [Node.js — SQLite](https://nodejs.org/api/sqlite.html) | DatabaseSync e acesso ao arquivo |
| [SQLite — VACUUM](https://www.sqlite.org/lang_vacuum.html) | VACUUM INTO no backup |
| [Node-RED — Configuration](https://nodered.org/docs/user-guide/runtime/configuration) | settings e contexto global |
| [Node-RED — Messages](https://nodered.org/docs/user-guide/messages) | Fluxos/payload |
| [MDN — Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) | Conversão da hora para America/Sao_Paulo |
| [Vercel — Deployments](https://vercel.com/docs/deployments) | Publicação da interface; não descreve uma API SAMAHI hospedada |
| [Android — Adaptive icons](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive) | Ícone adaptativo |

## Tema e referências visuais

- [GBCR — nota técnica de julho de 2024](https://www.gbcr.org.br/wp-content/uploads/2024/07/Nota-Tecnica-GBCR-Pais-preocupados-mal-estar.pdf): referência das cinco cores. Não valida clinicamente o aplicativo.
- [Creative Tim — Vision UI Dashboard React](https://demos.creative-tim.com/vision-ui-dashboard-react/#/dashboard) e [Mohammad Shimul — Smart Home Dashboard](https://dribbble.com/shots/26401049-Smart-Home-Dashboard): referências visuais escolhidas por César na fase inicial; não usar como fonte de requisitos clínicos.
- Telas do export Stitch fornecido pela equipe orientaram o redesign. [Registro de implementação](redesign-stitch-samahi.md) e [identidade visual](identidade-visual/README.md) identificam os assets do projeto.

## Autoria e uso acadêmico

Base inicial: template Expo blank-typescript, licença preservada em LICENSE. Código/documentos específicos desenvolvidos neste projeto com apoio do Codex e revisão da equipe. Referenciar bibliotecas e imagens conforme a utilização; não atribuir às fontes decisões próprias como limiar virtual ADC 2000, agenda 07:00/19:00 ou escolha do SQLite.

A monografia precisa distinguir fundamentação externa, decisão de projeto, implementação, ensaio observado e pendência. Não transformar capacidade declarada pela biblioteca em desempenho medido do app, nem captura web em evidência de hardware.
