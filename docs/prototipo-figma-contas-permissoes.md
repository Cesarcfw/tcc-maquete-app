> **Registro histórico.** Reflete a etapa/versão indicada, não a situação operacional atual. Consulte o [índice da documentação atual](README.md).

# Protótipo Figma — mobile, web, contas e permissões

## Entrega e estágio

[Arquivo editável no Figma](https://www.figma.com/design/2GyVNXx5eKZSRGbgjdJBKv/TCC-Maquete-conectada?node-id=8-58).

35 telas: 19 mobile em 390 × 844 e 16 web em 1440 px de largura. Existem 217 ligações de navegação configuradas. Textos, vetores, cartões e componentes são editáveis; as telas não são imagens achatadas. Foram criados seis componentes locais e 37 variáveis, incluindo primitivas, cores semânticas, espaços e raios. Tipografia Manrope, com estilos compartilhados. O aplicativo existente usa a fonte de sistema; Manrope é uma decisão proposta para a próxima implementação visual.

Esta é uma proposta de interface. Não altera o aplicativo executável ou sua versão e não implementa autenticação, autorização, integração física ou persistência. Os formulários mostram exemplos estáticos. Os comandos levam a estados genéricos de demonstração; o slider não calcula intensidade no Figma e a seleção de uma cor não altera um equipamento.

## Como apresentar

No Figma, selecione uma tela e use **Apresentar**. Pontos de entrada sugeridos:

- [Login mobile](https://www.figma.com/design/2GyVNXx5eKZSRGbgjdJBKv/TCC-Maquete-conectada?node-id=8-2).
- [Painel mobile](https://www.figma.com/design/2GyVNXx5eKZSRGbgjdJBKv/TCC-Maquete-conectada?node-id=8-58).
- [Painel web](https://www.figma.com/design/2GyVNXx5eKZSRGbgjdJBKv/TCC-Maquete-conectada?node-id=9-229).
- [Permissões web](https://www.figma.com/design/2GyVNXx5eKZSRGbgjdJBKv/TCC-Maquete-conectada?node-id=9-359).

O celular tem conteúdo rolável e navegação inferior fora da rolagem. O computador tem menu lateral, duas colunas no painel e matriz de permissões. A identidade e os grupos de funções são compartilhados, enquanto a composição respeita cada aparelho.

## Funções atuais preservadas no desenho

- Iluminação: ligar, desligar e intensidade de 0 a 100%. Na implementação, zero desliga e religar restaura a última intensidade positiva.
- Temperatura e umidade: leitura com origem simulada identificada e indicação de atualização.
- Manchester: escolha manual de vermelho/emergente, laranja/muito urgente, amarelo/urgente, verde/pouco urgente ou azul/não urgente. Apagar o indicador é uma ação separada. O app não realiza classificação clínica.
- Histórico e estados: aguardando confirmação, confirmado, indisponibilidade e acesso limitado. Na implementação, não atualizar estado antes da confirmação, preservar o último estado em falha e não reenviar comandos cancelados ao reconectar.

## Contas e administração propostas

Contas por convite, entrada com e-mail/senha e recuperação de acesso. O administrador cadastra ambientes, associa dispositivos, configura o serviço de integração, testa a conexão, gerencia usuários e concede permissões. Usuários comuns recebem somente os ambientes e grupos autorizados. O protótipo inclui cadastro ilustrativo de conexão, convite e confirmação de desativação.

Modelo proposto de autorização: **pessoa + ambiente + grupo de funções + ação**. O papel de administrador concede ações administrativas; a concessão de funções de uso do ambiente deve continuar explícita e verificável. O escopo inicial é a instalação da maquete, sem exigir uma plataforma para múltiplas organizações.

| Grupo | Sem acesso | Visualizar | Controlar |
|---|---|---|---|
| Iluminação | Ocultar estado e negar comandos | Consultar estado/intensidade | Consultar e alterar luz/intensidade |
| Sensores | Não consultar leituras | Consultar temperatura/umidade | Não se aplica a sensores de leitura |
| Indicador Manchester | Ocultar estado e negar comandos | Consultar cor/prioridade | Consultar, selecionar cor e apagar indicador |
| Histórico | Não consultar eventos | Consultar eventos do ambiente permitido | Não se aplica ao histórico |
| Gás e fechadura | Indisponíveis inicialmente | Definir após aprovação do hardware | Definir ações específicas em etapa futura |

Sem concessão explícita, negar acesso. A interface reflete as regras, mas o backend deve validar cada solicitação e cada ambiente/dispositivo solicitado. Credenciais de integração não devem ser disponibilizadas aos usuários comuns. Registrar autoria e resultado das ações quando houver persistência real. Esses requisitos são propostas de arquitetura, não mecanismos já implementados.

Para entrada na monografia: diferenciar autenticação (identificar a pessoa) de autorização (verificar o que ela pode fazer). Adaptar o texto e citar a fonte consultada.

## Possíveis expansões

Gás, fechadura e alertas aparecem como possibilidades dependentes do hardware e de validação da equipe. Não foram apresentados valores de gás, limites de segurança ou medições reais fictícias. Não há cadastro de pacientes ou prontuários neste escopo.

## Referências e autoria

Links consultados na elaboração. A composição, textos e ilustração vetorial do quarto foram produzidos para este projeto; não houve importação de imagens de telas de terceiros como entrega.

1. [Creative Tim — Vision UI Dashboard React](https://demos.creative-tim.com/vision-ui-dashboard-react/#/dashboard): referência já escolhida pela equipe para aparência de painel escuro e organização em cartões.
2. [Mohammad Shimul — Smart Home Dashboard](https://dribbble.com/shots/26401049-Smart-Home-Dashboard): referência escolhida pela equipe para agrupamento de ambiente, sensores e controles.
3. [Home Assistant — Dashboards](https://www.home-assistant.io/dashboards/): referência funcional de visão resumida por ambiente e controles de dispositivos.
4. [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): suporte às decisões de acesso mínimo, negação por padrão e validação de permissões em cada solicitação.
5. [GBCR — Nota técnica com quadro de prioridades Manchester](https://www.gbcr.org.br/wp-content/uploads/2024/07/Nota-Tecnica-GBCR-Pais-preocupados-mal-estar.pdf): fonte para cores e prioridades. Consultar também docs/manchester.md.

Foi inspecionado o Material 3 Design Kit disponível no Figma e um estilo Body da biblioteca da equipe. Como a composição solicitada utiliza identidade e tipografia próprias, foram criados componentes locais com tokens, em vez de aplicar a aparência desses recursos importados. Nenhum componente publicado da equipe foi alterado.

## Evidências para a monografia

**TIRE PRINT DESTA PARTE:** painel mobile e painel web, mostrando mesmas funções em composições diferentes; matriz de acesso; cinco prioridades Manchester; estrutura editável com componentes e tokens.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** navegação entre conta, ambientes e painel; rolagem mobile mantendo a navegação inferior; caminho de comando para confirmação ou falha; conexão e convite como fluxos de demonstração. Identificar explicitamente que os dados e as ações são simulados.

Depois da implementação real, registrar separadamente testes de bloqueio de acesso no backend, controle de intensidade com retorno do ESP32 e reconexão. Não usar o protótipo como evidência desses testes.

## Verificação e limitações

- Criação e edição confirmadas no arquivo fornecido pelo usuário.
- Estrutura final inspecionada em todas as 35 telas: textos Manrope e nenhuma imagem raster da interface. Contagens e IDs preservados no ledger local em design-work.
- Revisão visual de login e painel mobile, painel web e permissões. Corrigidos altura das linhas, contraste das opções selecionadas, largura da navegação e rolagem mobile.
- Ligações aceitas pela API do Figma. Execução de todos os fluxos no player e revisão da equipe ainda pendentes; formulários e seletores são ilustrativos.
- A última chamada foi bloqueada pelo limite do conector no plano Starter. Pontos de início nomeados e uma anotação adicional ficaram pendentes. As telas e as ligações das chamadas anteriores foram salvas; é possível selecionar uma tela e usar Apresentar.
- Nesta entrega não foram executados testes do app, pois não houve alteração de código executável.

## Próximas etapas

1. César/equipe revisarem as telas e aprovarem escopo inicial de contas e grupos.
2. Implementar os componentes visuais no Expo mantendo os comportamentos atuais.
3. Escolher e implementar autenticação, autorização por ambiente e persistência.
4. Integrar serviço de comandos e ESP32, com confirmação e falhas explícitas.
5. Registrar evidências reais e atualizar a monografia com resultados observados.
