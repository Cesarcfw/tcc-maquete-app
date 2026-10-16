# SAMAHI 0.6.0 — APK interno Android

Android versionCode **5**, pacote `com.cesarcfw.tccmaqueteapp`. Base: `main` em `0f3d519`, com alterações até o PR #17 incorporadas. Preparação em branch `feat/apk-v0.6.0`. Mesma conta/projeto Expo e assinatura remota existentes. Distribuição interna, sem publicação em loja ou release final.

## Conteúdo

- Login, ambientes, permissões e histórico persistentes no backend.
- Interface sem acesso à demonstração; Node-RED ainda é serviço virtual, sem comprovação de hardware físico.
- Falhas de gás/comunicação e recuperação registradas no histórico conforme consultas do app.
- Iluminação manual e modos Dia/Noite por horários de Brasília/intensidades; comando manual pausa programação.
- Logo SAMAHI separada por tema, novo ícone instalado/adaptativo/temático e favicon web.
- Endereço do servidor, tema e Reduzir animações salvos localmente e restaurados ao reabrir.

## Instalação e operação

1. Baixar o APK desta versão e instalar como atualização do SAMAHI anterior. Conferir mensagem caso haja erro; não desinstalar para contorná-lo sem registrar o problema.
2. Reiniciar backend e Node-RED usando o código atual, para alinhar o protocolo de iluminação. Preservar banco, segredo e configuração operacional existentes. O automático por LDR foi substituído por horários; não manter serviço antigo concorrente.
3. Abrir o aplicativo pelo ícone. Ele carrega sem Expo Go ou Metro; backend e Node-RED devem continuar no computador para login, dados e comandos.
4. Telefone e PC na mesma rede. Em **Configurar conexão**, informar `http://IP-DO-PC:3002` se essa for a porta da sua instância. Confirmar IP/porta reais; `127.0.0.1` no telefone não é o PC. Aguardar **Endereço salvo neste aparelho** e usar **Verificar conexão**.
5. Entrar com sua conta. Reabrir preserva preferências; o token não foi incluído no armazenamento local e a entrada continua exigindo autenticação.

Banco SQLite e segredos do backend não são enviados ao EAS nem embutidos no APK. Perfil `preview` permite HTTP local; túnel/publicação do backend não fazem parte desta compilação.

## Roteiro de aceite no telefone

- Registrar versão/build, modelo e Android. Conferir ícone instalado, recorte do launcher e ícone temático quando o aparelho oferecer essa opção.
- Escolher conexão/tema/redução de animações, aguardar salvamento, fechar completamente e reabrir. Conferir retenção mesmo com backend indisponível.
- Entrar, conferir quartos e permissões, ligar/desligar luz, ajustar intensidade e religar recuperando última intensidade positiva.
- Configurar Dia/Noite, conferir modo/intensidade confirmados, manual e retomada. Serviço/PC precisam estar ativos e com relógio sincronizado.
- Conferir temperatura/umidade/gás; ativar gás no serviço virtual e conferir faixa animada, reconhecimento e retorno ao app. Manchester deve permanecer independente.
- Interromper/retomar serviço virtual, mantendo consulta do quarto; conferir falha/recuperação no histórico sem repetições indevidas.
- Testar logout e restrições de uma conta com permissões limitadas.

**TIRE PRINT DESTA PARTE:** ícone instalado, conexão restaurada, programação confirmada, alerta e histórico, sem senhas/tokens.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** abrir pelo ícone sem Metro → conexão/login → luz/manual/horários → gás e Manchester independente → histórico → fechar/reabrir e conferir preferências. Na monografia, identificar Node-RED como origem virtual destas evidências.

## Compilação e verificações

Perfil `preview`, `distribution: internal`, `developmentClient: false`, `android.buildType: apk`. Comando: `npx --yes eas-cli@latest build --platform android --profile preview --non-interactive`.

Estado inicial deste registro: compilação ainda não enviada. ID, link, hash e resultado serão acrescentados após confirmação pelo EAS. Conclusão da build e inspeção do APK não comprovam instalação/rede/funcionamento no aparelho.

Manuais relacionados: [preferências](preferencias-locais.md), [modos Dia/Noite](modos-dia-noite.md), [histórico de alertas](historico-alertas.md), [identidade](identidade-visual/README.md) e [integração móvel](teste-app-integrado.md).

Referência primária: [Expo — gerar e instalar APK](https://docs.expo.dev/build-reference/apk/).
