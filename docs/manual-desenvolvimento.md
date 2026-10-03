# Manual de estudo e manutenção — Maquete conectada

## 1. Finalidade e base

Material para César compreender o aplicativo, editar manualmente e explicar o funcionamento à equipe e ao orientador. A base de código é a main `47398c1`, versão 0.3.0. Leia em conjunto com a [Documentação de Arquitetura](arquitetura.md).

Este manual não altera a implementação. Exemplos de novos recursos são roteiros de trabalho; só passam a existir depois de implementados, testados e integrados por PR. Use dados fictícios nas demonstrações.

## 2. Ordem de estudo recomendada

| Passo | Arquivo | O que você precisa conseguir explicar |
| --- | --- | --- |
| 1 | package.json e index.ts | Como o app inicia e quais comandos existem |
| 2 | App.tsx e começo de DemoApp.tsx | Como a raiz chega aos provedores e às telas |
| 3 | domain/maquette.ts | Diferença entre comando, estado confirmado e leitura |
| 4 | domain/access.ts | Como ambiente, grupo e nível definem uma concessão |
| 5 | hooks/useSimulator.ts | Onde ficam timers, histórico, pendência e cancelamento |
| 6 | UI DemoApp | Como clique vira comando e como dados viram cartões |
| 7 | GasAlarm.tsx e theme.ts | Como tema, animação e fechamento funcionam |
| 8 | tests e CI | O que os testes comprovam e seus limites |
| 9 | app.json, eas.json e vercel.json | Diferença entre executar, compilar e publicar |

Faça uma etapa de cada vez. Ao terminar um arquivo, procure onde seus símbolos são importados. Não é necessário decorar todas as linhas de JSX para entender o fluxo.

**TIRE PRINT DESTA PARTE:** mapa src e dependências. **MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** narre um comando de luz acompanhando UI → hook → domínio → UI.

## 3. Preparar e executar localmente

Abra um terminal na pasta `C:\Users\cesar\Documents\TCC\tcc-maquete-app`. O projeto usa Node 24 no CI e depende do npm/package-lock para instalação reproduzível.

```powershell
node --version
npm --version
git status --short
npm ci
npm run web
```

Abra o endereço local que o Expo informar; a porta pode mudar se outra estiver ocupada. Não assumir que localhost:8082 sempre é a instância certa. Atualização visual local não publica no Vercel nem muda o APK.

`npm start` inicia o ambiente Expo. Execução Android/iOS requer fluxo e ambiente compatíveis; consulte [gerar-apk.md](gerar-apk.md). APK gerado é um pacote instalado; não equivale a um servidor local acessível pelo colega.

Se o colega precisa testar a entrega publicada, use [o site](https://tcc-maquete-app.vercel.app). Alterações não integradas/publicadas devem ser testadas localmente ou na prévia do PR.

### Criar uma alteração isolada

Comece sem mudanças locais pendentes. Se houver mudanças, revise-as antes de trocar de branch.

```powershell
git fetch origin
git switch main
git pull --ff-only
git switch -c feat/nome-da-mudanca
```

Para correção use fix/; para documentação use docs/. O nome é um exemplo: escolha o escopo concreto. Não use reset/limpeza para descartar trabalho automaticamente. Não trabalhar na main com mudanças experimentais.

## 4. Encontrar cada parte sem se perder

Busca por função é mais estável que número de linha:

```powershell
rg -n "initialState|applyCommand|toggleLight|applyGasReading" src/domain/maquette.ts
rg -n "canAccess|initialUsers|emptyGrants" src/domain/access.ts
rg -n "function send|cancelPending|generation|selectScenario" src/hooks/useSimulator.ts
rg -n "function send|function setLevel|function addUser|function testConnection" src/ui/DemoApp.tsx
rg -n "Screen|mobileRoutes|desktop|wide|onSlidingComplete" src/ui/DemoApp.tsx
rg -n "closeAlarm|duration|useNativeDriver|strip|banner" src/ui/GasAlarm.tsx
```

Se rg não estiver disponível, use a busca de arquivos do editor. O app exportado por App.tsx é a raiz de DemoApp.tsx; editar somente App.tsx não altera as telas.

### Mapa por intenção

| Quero modificar | Primeiro arquivo | Outros pontos a conferir |
| --- | --- | --- |
| Texto/título de um cartão | DemoApp.tsx | Texto acessível, mobile e referências |
| Paleta claro/escuro | theme.ts | Cores fixas do aviso, Room e Manchester |
| Intensidade inicial/sensores iniciais | maquette.ts: initialState | Texto do reset e testes |
| Regra ao apagar/religar | maquette.ts: applyCommand/toggleLight | UI e maquette.test.ts |
| Atraso de comando e timeout | useSimulator.ts: send | Mensagens, testes do fluxo e documentação |
| Limite de leitura antiga | maquette.ts: connectionState | selectScenario e cenários de teste |
| Cor/rótulo Manchester | maquette.ts + indicatorColors na UI | Fonte, prioridades e independente do gás |
| Estados/reconhecimento de gás | maquette.ts + useSimulator.ts | Condição do overlay e gas.test.ts |
| Listras e saída de aviso | GasAlarm.tsx | Redução de movimentos e fechamento |
| Perfis/grants iniciais | access.ts: initialUsers | Segurança demonstrativa e matriz |
| Regra geral de concessão | access.ts: canAccess | setLevel, controles, access.test.ts |
| Criar perfil/e-mail | DemoApp.tsx: addUser | Campos/dialogue e emptyGrants |
| Conexão demonstrativa | DemoApp.tsx: testConnection/connection | Validação e resultado capturado |
| Nova tela | Screen/navIcons/navigate/JSX | Entradas desktop/mobile e acesso |
| Gravar dados entre aberturas | Nova camada de persistência | Não existe armazenamento atual |
| Enviar ao ESP32 | Nova camada de transporte | Não basta alterar endpoint |
| App versionado/distribuição | package.json/app.json/eas.json/vercel.json | Textos de versão, CI e release revisada |

## 5. Ler um fluxo completo: ajustar luz para 25%

1. O botão “25%” está no bloco de iluminação de DemoApp.
2. O evento produz `{ kind: "light", on: true, intensity: 25 }`.
3. A função send da UI identifica grupo light.
4. canAccess verifica o perfil, quarto-01 e control.
5. ready verifica online, conexão ativa e ausência de comando pendente.
6. A UI limpa draft e chama sim.send com o nome.
7. O hook trava busy e pending, escreve aviso e evento de solicitação.
8. Após 650 ms, confere se o comando pertence à geração atual.
9. applyCommand calcula novo DeviceState, preservando os demais campos.
10. O hook atualiza device, retira pendência e registra confirmação.
11. A UI lê device.intensity e redesenha número/slider/ilustração.
12. Room anima o brilho para o valor confirmado.

No timeout, os passos 9 e 10 de aplicação não acontecem: após 5 s o hook registra erro e preserva a luz. Durante o arraste, draft é intenção; device é estado confirmado. Não substituir um pelo outro.

### Ensaio para explicar em voz alta

“A interface monta um comando, valida a concessão e entrega ao simulador. O valor principal só muda quando o simulador confirma. A regra de domínio calcula o novo estado e preserva os demais dados. Na futura integração, a confirmação precisará vir do equipamento ou do serviço que o representa.”

Esta frase descreve a base atual; não afirmar que um ESP32 já respondeu.

## 6. Alterações pequenas: texto e paleta

### Mudar o título de um cartão

Localize `title="Iluminação do quarto"`, altere o texto e verifique no celular/desktop. Não mude a chave técnica light para traduzir um título: a chave é usada por comandos, grants e testes.

Confira o conteúdo e os labels de acessibilidade. Algumas frases aparecem em mais de uma tela; busque o texto para decidir quais devem mudar. Registre a alteração em CHANGELOG e no PR.

### Mudar a aparência

Em theme.ts, mude a paleta dark e light de forma coerente. primary é cor de destaque; onPrimary é cor do conteúdo sobre ela; surface/onSurface são fundo/conteúdo de cartões. Os nomes de tokens fazem parte do tema Paper.

Nem toda cor vem do tema: Manchester, aviso de gás, brilho da luminária e mensagens warning possuem cores locais. Mudar primary não muda automaticamente esses elementos.

Aumentar s.card.borderRadius muda cartões; s.page.maxWidth muda o espaço central. s.stack define empilhamento; wide/desktop escolhem a composição. Teste tela estreita, texto grande, rolagem e botões para evitar corte.

A borda pulsante Manchester pedida por César permanece futura. Ao implementá-la, use a cor de indicator, respeite concessão/read e movimentos reduzidos; não use a detecção de gás para modificar a triagem.

## 7. Alterar regras sem perder coerência

### Intensidade inicial

Para iniciar com 40%, em initialState mude lightOn=true, intensity=40 e lastPositiveIntensity=40. Ajuste também o texto do reset (“Luz em 65%...”) e a ilustração fixa da tela de escolha de perfil, se a proposta for exibir o mesmo inicial. Essa ilustração não lê sim.device hoje.

Reveja o teste de restauração que espera 65. Um teste deve comprovar a regra, não apenas repetir a implementação: confira desligar/religar e preservar o último valor positivo depois de outro comando.

### Atraso e timeout

Em send do hook, 650 representa atraso de sucesso e 5000 representa timeout. Se mudar o timeout, ajuste a mensagem “sem confirmação após 5 s” e o roteiro. Não afirmar resposta física medida a partir desse timer.

### Dados antigos

connectionState usa 10000 ms. selectScenario("stale") define uma leitura de 18000 ms atrás. Se o limite aumentar além desse valor, o cenário “Dados antigos” deixará de simular uma leitura antiga imediatamente. Alterar o limiar exige coordenar esse cenário e o teste de fronteira.

Teste um instante antes do limite, no limite e offline. Limite da leitura não é o mesmo que timeout de comando.

### Grupos e perfis

Modificar initialUsers muda apenas o início de uma nova instância. Perfis/grants já alterados naquela sessão continuam até recarregar. Sensor e histórico continuam apenas leitura pela regra canAccess, mesmo se alguém colocar control no objeto.

Nunca fazer admin retornar true para tudo sem discutir a regra: a arquitetura atual separa administração de concessão de funções. A integração real precisa repetir a autorização no servidor.

## 8. Adicionar um sensor: roteiro de implementação

Exemplo **proposto**: adicionar leitura de luminosidade em lux, se a equipe escolher hardware capaz de fornecê-la. Não há essa leitura hoje.

1. Definir com Gabriel modelo, unidade, limites, validade e significado de indisponível.
2. Acrescentar o campo tipado no DeviceState e valor fictício em initialState.
3. Decidir a representação de leitura inválida: não usar 0 como sinônimo de indisponível, pois 0 lux pode ser uma leitura válida.
4. Atualizar o simulador para produzir/alterar esse valor e seu estado de qualidade; o simples relógio não representa uma medição.
5. Criar cartão sob read("sensors"), com unidade e aviso de simulação.
6. Mostrar leitura antiga/indisponível preservando o último valor e sua qualidade.
7. Verificar se o modelo de um receivedAt global ainda basta; sensores com idades diferentes precisam de timestamp/qualidade próprios.
8. Incluir teste das regras de transição; testar offline e perfis sem concessão.
9. Atualizar tipo/contrato/documentação e registrar print/vídeo.

Para apenas mais uma leitura, pode reutilizar sensors; criar novo grupo só se houver necessidade de concessão separada. Se criar grupo, revisar Group, groups, groupLabels, emptyGrants, initialUsers, canAccess, matriz UI e testes. Não dar control a um sensor somente porque existe ferramenta de injeção no laboratório.

## 9. Adicionar uma função de controle

Exemplo **proposto**: fechadura. O cartão atual é desabilitado; não existe Command de fechadura.

Antes de codificar, a equipe deve definir estados, quem pode controlar, resposta do atuador, sensor de posição e comportamento de falha. “Enviei trancar” não comprova que a porta está fisicamente trancada.

Mapa de alterações: tipo de comando em maquette → estado do dispositivo → regra de transição → grupo/concessão em access → envio/ACK no hook → cartão/controle → testes → documentação. A autorização send da UI hoje usa ternário light/indicator; precisará de um mapeamento explícito para a nova kind. describeCommand também precisa cobrir o novo comando, assim como applyCommand.

Se acrescentar uma kind sem revisar esse ternário, ela pode cair no grupo errado. Use o TypeScript para localizar pontos que precisam ser atualizados, mas também procure lógica baseada nas duas opções antigas.

## 10. Adicionar uma tela e navegar

1. Adicionar a tela à união Screen.
2. Adicionar navIcons e título.
3. Adicionar o bloco JSX condicionado a screen.
4. Definir acesso no navigate e no próprio conteúdo.
5. Oferecer caminho de entrada no menu lateral.
6. Definir o caminho no celular: nova aba exige revisar mobileRoutes; alternativa é botão na Conta.
7. Revisar o cálculo de aba selecionada para telas auxiliares.
8. Conferir rolagem, mudança de tela, formulários abertos e comandos pendentes.
9. Se precisar Voltar/deep link/URL individual, adotar uma solução de navegação em uma etapa própria.

Hoje navigate limpa draft, mas não cancela todo comando só por trocar de tela. Troca de perfil/cenário ou concessão cancela. Não trocar essa política sem definir o comportamento desejado.

## 11. Estudar gás e alterar animações

São três informações distintas:

- gas: existe detecção?
- gasAcknowledged: a ocorrência foi reconhecida?
- gasOverlayClosed: esta instância ocultou a janela?

O cartão e o domínio não devem usar “janela fechada” como “sem gás”. Reconhecer não altera Manchester. Durante offline, o último detected permanece com aviso de ausência de leitura atual.

Em GasAlarm:

- motion controla o loop das listras.
- exit controla saída inteira/fade do fundo.
- closingRef bloqueia toque repetido imediatamente.
- closing desabilita o botão na renderização.
- strip(false)/strip(true) invertem a direção.
- onClose atualiza o pai e desmonta o componente.
- reduced desativa loop e usa fechamento imediato.

Para velocidade, mude duration=3000; para tempo de saída, duration=380. Se alterar a geometria das listras, mantenha o deslocamento igual ao período do padrão (atual: 40 de largura + 40 de espaço = 80). Caso contrário, o reinício do loop pode mostrar um salto.

Teste reconhecer, fechar, reabrir, repetir ocorrência após normalização, redução de movimentos e tela baixa/estreita. Mudança de tipo de gás ou prioridade de alerta exige hardware/contrato; não inferir toxicidade de detected.

## 12. Trocar simulador por comunicação real

Esta etapa é **proposta** e exige trabalho além deste manual.

1. Definir contrato com Gabriel e exemplos de estados/ACK/falhas.
2. Introduzir um adaptador separado da UI; evitar espalhar fetch em botões.
3. Validar payloads em runtime antes de transformá-los em DeviceState.
4. Identificar comando, dispositivo, ambiente e autoria.
5. Distinguir accepted de applied; correlacionar o retorno com o comando.
6. Atualizar estado apenas com retorno confirmado.
7. Modelar stale/offline/timeout e reconciliação do estado do dispositivo.
8. Adicionar autenticação e autorização confiáveis no backend.
9. Persistir o que precisa sobreviver e definir auditoria.
10. Testar serviço falso, backend e por fim hardware, registrando cada camada.

O endpoint do formulário atual não participa de send. Alterar https://servico.exemplo não faz o app acessar a rede. canAccess no cliente também não protege uma API.

Não reutilizar generation como prova de que um comando físico foi cancelado: o hardware pode já ter aplicado. Definir como o cliente abandona uma sessão, acompanha ACK tardio e reconcilia o estado.

## 13. Verificar antes de entregar

Execute os gates do repositório:

```powershell
npm run lint
npm run typecheck
npm test
npm run export:web
```

Oito testes atuais são de domínio. Não cobrem timers, JSX ou animação; testes do novo recurso devem verificar suas regras e falhas relevantes. Não afirmar cobertura total.

### Roteiro manual mínimo por mudança de controle

| Passo | Resultado esperado |
| --- | --- |
| Entrar como César | Painel e administração disponíveis |
| Luz 25%, apagar, religar | 25% após confirmação |
| Cenário Sem confirmação; solicitar 100% | Valor anterior preservado após 5 s |
| Offline / Dados antigos | Controle bloqueado, última leitura preservada |
| Enviar e trocar perfil durante pendência | Comando cancelado sem aplicar depois |
| Matheus tenta controlar luz | Somente leitura |
| César concede luz a Matheus e troca perfil | Controle permitido; Manchester continua sem acesso |
| Novo perfil | Sem concessões iniciais |
| Definir Manchester azul e detectar gás | Azul preservado |
| Reconhecer → voltar → reabrir | Detecção continua; saída à direita |
| Clear → detected | Novo reconhecimento necessário |
| Reduzir animações | Aviso sem listras móveis; saída imediata |
| Tela estreita e desktop | Navegação adequada e botões visíveis |

Registre ambiente, versão, commit e resultado real. Roteiro é plano de teste, não prova de execução. [Evidências existentes](registro-v0.3.0.md) e [publicação](publicacao-vercel.md).

## 14. Publicar a mudança corretamente

1. Revisar git diff e git diff --check.
2. Atualizar documentação e CHANGELOG para o recurso alterado.
3. Não incluir .env, tokens, .vercel, chaves, node_modules, dist ou APK no commit.
4. Commit e push da branch.
5. Abrir PR para main, com finalidade, validação, limitações e cartão Trello.
6. Conferir CI e prévia Vercel.
7. César revisa e faz merge.
8. Conferir a produção da main.
9. Para Android, gerar/distribuir novo build quando necessário; não presumir atualização automática do APK.

Correção compatível costuma mudar o terceiro número; novas funções mudam o escopo de versão conforme planejamento. Alterar package.json, app.json e os textos hardcoded de versão. Uma documentação nova, sem recurso, não exige mudar 0.3.0.

O fluxo EAS Build é separado: merge não compila APK pelo CI atual. Plano/cota da conta devem ser conferidos no momento de gerar.

## 15. Resolver problemas comuns

| Sintoma | Conferir |
| --- | --- |
| Alterei App.tsx e não achei a tela | As telas estão em src/ui/DemoApp.tsx |
| Minha alteração local não aparece no link público | Local e deployment são builds diferentes |
| Colega não vê minhas mudanças de luz | Estado é por instância; não há backend compartilhado |
| Slider mexe mas valor principal demora | draft é intenção; device muda após ACK simulado |
| Controles estão desabilitados | Concessão, cenário, conexão active e pending |
| Timestamp avança sem mudar temperatura | Valores são fixos; relógio é fictício |
| Novo perfil não consegue usar nada | emptyGrants inicia todos como none |
| Admin não controla certo grupo | admin não ignora concessões |
| Gás continua após fechar | Fechar janela não normaliza detecção |
| Não consigo reativar animação | Preferência do sistema tem prioridade pela combinação OR |
| Configurei endpoint, mas não há rede | Teste e configuração ainda são locais |
| Histórico desapareceu | Reset/recarregamento e limite de 30; sem persistência |
| Voltar do Android não navega para tela anterior | Não há pilha de navegação implementada |
| Site mudou, APK não | Build instalado separado; EAS Update não configurado |
| Build falhou | Ler erro da etapa; não aplicar atualização forçada de dependências sem diagnóstico |

Se o problema envolver timer/foco/animação, reproduza no ambiente em que ocorreu e informe passos, esperado, resultado, versão e dispositivo. Use o formulário de defeito do repositório.

## 16. Roteiro de explicação ao orientador

1. **Objetivo:** centralizar as funções que a maquete disponibilizar.
2. **Fase atual:** protótipo de interface com regras e falhas simuladas.
3. **Arquitetura:** UI coordena; hook mantém simulação; domínio calcula regras.
4. **Fluxo principal:** explicar comando, autorização, pending e confirmação.
5. **Dados:** explicar memória, valores fictícios e ausência de sincronização entre colegas.
6. **Permissões:** demonstrar grupo/ambiente; distinguir administração de controle.
7. **Alertas:** Manchester manual para triagem e gás ambiental independente.
8. **Distribuição:** mesmo código para web e APK, com layouts por largura.
9. **Verificação:** oito testes de domínio, CI/exportação e inspeções registradas; teste físico separado.
10. **Próxima integração:** transporte, ACK real, validação, backend e persistência.

Perguntas de autoavaliação:

- Em qual função o estado da luz é realmente alterado?
- Por que o slider precisa de draft e DeviceState?
- Por que busy e pending coexistem?
- O que generation protege? O que não protege no hardware?
- Quais diferenças há entre timeout, offline e stale?
- O que muda ao reconhecer versus fechar um alerta?
- Por que admin e grants são coisas distintas?
- O que reseta ao trocar perfil, ao resetar e ao recarregar?
- Qual é o papel do Vercel? Qual é o papel do EAS?
- Onde entraria uma API e quem validaria suas permissões?

Respostas esperadas estão nos fluxos da arquitetura; confira no código antes de ensaiar. Anote dúvidas específicas para revisão em equipe.

## 17. Registro acadêmico e manutenção da documentação

**TIRE PRINT DESTA PARTE:** funções de domínio, condição de concessão, fluxo de confirmação, diagrama e CI com resultado. Nunca capturar segredos de ambiente.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** uma demonstração narrada ligando requisito → evento → regra → resultado; incluir ao menos uma falha para explicar preservação de estado.

Para cada nova entrega, registrar: requisito, decisão, arquivos, versão/commit, ambiente, testes, limites, fontes e autoria. Atualizar arquitetura quando uma responsabilidade mudar. Guardar registros antigos como históricos; não usá-los como descrição atual sem identificar sua versão.

A monografia pode aproveitar essa estrutura após revisão de Matheus e César. Conceitos externos e ferramentas têm [fontes primárias na arquitetura](arquitetura.md#23-referências-primárias-e-documentos-relacionados); as decisões e os exemplos específicos foram escritos a partir do código do projeto.
