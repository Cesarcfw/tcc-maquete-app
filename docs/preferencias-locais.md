> **Situação atual:** recurso incluído no código 0.6.0 e no [APK registrado](apk-v0.6.0.md). Ensaios abaixo são registros da etapa de implementação; aceite completo do APK instalado e integração física permanecem separados. Consulte o [índice atual](README.md).

# Preferências locais — conexão, tema e animações

## Necessidade e comportamento

César solicitou que configurações do aplicativo continuem disponíveis ao fechar e reabrir. Antes, endereço do backend, tema e preferência de animações existiam apenas no estado React e eram perdidos ao encerrar.

Agora, **Configurar conexão salva automaticamente cada endereço válido**, sem depender do login ou da disponibilidade do servidor. Ao terminar de editar, aguardar a mensagem **Endereço salvo neste aparelho**. Reabrir restaura esse endereço, o tema claro/escuro e a opção Reduzir animações. Um rascunho incompleto/inválido mostra aviso e não substitui o último endereço válido. A validação sintática não garante que o servidor exista; Verificar conexão continua fazendo essa conferência por HTTP.

Alterações válidas são gravadas durante a edição; não é necessário apertar Entrar. URL é normalizada, sem barra final e sem espaços externos. Não aceita caminho, parâmetros, fragmento, usuário/senha embutidos ou protocolo diferente de HTTP(S). A troca do endereço na entrada não muda o endpoint de uma sessão já aberta.

## Onde cada dado fica

| Dado                                                              | Local e ciclo de vida                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Endereço, tema, redução de animações                              | AsyncStorage no aparelho; implementação web usa localStorage da origem    |
| Contas, quartos, permissões, auditoria                            | SQLite do backend; fonte de verdade já existente                          |
| Horários e intensidade Dia/Noite                                  | Arquivo operacional do serviço Node-RED, conforme docs/modos-dia-noite.md |
| Senha e token da sessão do cliente                                | Memória do cliente; não são gravados nesta configuração                   |
| Texto de busca, tela aberta, rascunhos de formulário e telemetria | Estado transitório, reconstruído por interação/leitura do servidor        |

Preferências são desta instalação/perfil de navegador, compartilhadas pelas contas que usam essa instalação. Não sincronizam entre telefone e computador. Na web, domínio/protocolo/porta diferentes têm armazenamento separado: localhost, IP local e Vercel não compartilham o mesmo valor. Limpar dados do site/app pode apagar preferências; reinstalação, modo privado e políticas do navegador podem afetar retenção.

## Implementação para manutenção

- `src/services/preferences.ts`: formato versionado 1, chave `@samahi/preferences/v1`, leitura defensiva e fila de gravação. Seleciona explicitamente os campos permitidos, ignorando campos desconhecidos. JSON corrompido, versão desconhecida ou campos inválidos usam padrões seguros por campo/registro; não quebram a entrada.
- `src/hooks/usePreferences.ts`: hidrata antes de liberar a interface, mantém preferências atuais e estado da gravação; não grava padrões por efeito ao montar. Cada ação do usuário produz uma foto completa das preferências. Revisão impede que resultado de operação antiga sobrescreva o aviso da operação mais recente.
- `src/domain/backendAddress.ts`: validação única de URL, usada pelo backend cliente e pela persistência. `src/services/backend.ts` mantém a exportação anterior para compatibilidade.
- `src/ui/ConnectedApp.tsx`: campo em edição separado do valor válido persistível. Exibe salvamento/erro e restaura o endereço antes do login. Padrão inicial continua `EXPO_PUBLIC_BACKEND_URL`, ou `http://127.0.0.1:3001` quando ausente; preferência local válida tem prioridade.
- `src/ui/DemoApp.tsx`: tema e preferência de reduzir animações vêm do mesmo estado persistente do componente de entrada. O pedido do sistema operacional para reduzir movimento continua prevalecendo.

Não foi adicionado login automático. A alteração não grava credenciais nem replica controles físicos no aparelho. Estado confirmado de luz/gás/Manchester continua vindo do serviço; reabrir não reenvia comandos antigos.

AsyncStorage é assíncrono e sem criptografia; escolhido somente para estas preferências não secretas. Aguarde a confirmação antes de encerrar o processo: fechamento forçado durante gravação pendente não oferece garantia de conclusão. Falha de leitura gera aviso para conferir endereço; falha de gravação mantém a alteração em memória e informa que ela pode não voltar na próxima abertura. Editar novamente ou mudar uma preferência tenta gravar a configuração completa outra vez.

## Testes e evidências

Verificado: lint, TypeScript, **24 testes aprovados** e exportação web. Seis testes novos cobrem reabertura com novo store, normalização, exclusão de senha/token, dados inválidos/versão desconhecida, não sobrescrever endereço válido, ordem de gravações rápidas e recuperação após falha. Testes de persistência usam armazenamento injetado; o teste web abaixo usa o armazenamento real do navegador.

Navegador isolado em `127.0.0.1:8094`, backend/serviço virtual e banco descartável: endereço alterado para `http://127.0.0.1:3104`, tema claro selecionado, saúde verificada; aba fechada e aberta novamente. Endereço/tema restaurados. Rascunho `http:` não substituiu configuração ao recarregar. Login, opção Reduzir animações ativada, recarga, novo login e confirmação da opção ainda ligada. Capturas em `docs/evidencias/preferencias-locais/`. Serviços do usuário e banco real não foram usados.

**TIRE PRINT DESTA PARTE:** Configurar conexão com endereço restaurado e tema escolhido; Conta com Reduzir animações preservado. Não incluir senha/token nas evidências.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** mudar endereço/tema → aguardar confirmação de salvamento → fechar completamente → reabrir → mostrar mesmo endereço/tema → entrar → mostrar a preferência de acessibilidade preservada.

### Validação pendente no telefone

1. Abrir o código atualizado no Expo Go, ou instalar o APK 0.6.0, que inclui a dependência nativa AsyncStorage. APK antigo não recebe a funcionalidade sozinho.
2. Configurar o endereço LAN real do computador, aguardar salvamento e escolher tema/redução de animações.
3. Fechar o aplicativo pelo gerenciador do telefone e abrir novamente. Conferir endereço/tema; entrar e conferir a opção de animações.
4. Repetir com o servidor desligado: configuração deve continuar disponível; a conexão pode falhar normalmente.
5. Registrar aparelho, Android, versão/build e resultado. Ensaio no navegador não comprova retenção em APK físico. Na etapa inicial desta funcionalidade não houve build; posteriormente ela foi incluída no APK 0.6.0, conforme o registro vinculado no início.

## Referências

- [Expo — AsyncStorage](https://docs.expo.dev/versions/latest/sdk/async-storage/): armazenamento persistente assíncrono, plataformas, Expo Go e instalação compatível. A CLI selecionou a versão 2.2.0 para este projeto.
- [Repositório oficial AsyncStorage](https://github.com/react-native-async-storage/async-storage): projeto e código-fonte. Para o comportamento específico desta entrega, foi conferido também o arquivo instalado `node_modules/@react-native-async-storage/async-storage/src/AsyncStorage.ts` da versão 2.2.0, que usa localStorage na web; a documentação da branch principal pode tratar versões posteriores.

Texto próprio para apoiar a monografia; adaptar ao relato da equipe e distinguir testes virtuais de validação física.
