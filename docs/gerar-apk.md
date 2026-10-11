# APK de teste — Maquete conectada

## Versão atual

Preparação v0.4.1 (Android 3), SAMAHI com redesign e cliente Node-RED. Build 1a20d872-02fb-4c41-9f89-74a1abec83c6 iniciado no EAS; consultar docs/apk-v0.4.1.md para estado final e roteiro de teste. As informações v0.3.0 abaixo são histórico.

## Estado da preparação

Projeto Expo SDK 57. Perfil `preview` em `eas.json` gera APK Android para instalação direta, com JavaScript incluído e sem cliente de desenvolvimento. Identificador Android: `com.cesarcfw.tccmaqueteapp`; versão do app 0.3.0 e código Android inicial 1. Sem publicação em loja nesta etapa.

O plugin Expo fornece orientações de trabalho. Login confirmado por `whoami` na conta pessoal `cesarcfw`. Projeto vinculado por `eas init`: `extra.eas.projectId` real `0462f5be-cde2-4860-9e93-e2776fca94f7`, owner `cesarcfw`. [Projeto no Expo](https://expo.dev/accounts/cesarcfw/projects/tcc-maquete-app).

`.easignore` exclui dependências, exportações, entregas, documentação/capturas e arquivos locais de credenciais do envio para compilação. O primeiro APK foi gerado; instalação e funcionamento no telefone ainda não foram validados.

Primeiro build EAS: `6e8055fe-cf1d-494b-b0fc-7517dae4bc7f`, perfil preview/Android, versão 0.3.0 (1). Estado final verificado: FINISHED, sem erro reportado. Chave Android criada e mantida no serviço de credenciais do Expo. Arquivo enviado de aproximadamente 2,2 MB. [Registro da compilação e instalação](https://expo.dev/accounts/cesarcfw/projects/tcc-maquete-app/builds/6e8055fe-cf1d-494b-b0fc-7517dae4bc7f).

[Baixar APK v0.3.0](https://expo.dev/artifacts/eas/zACYGqGyc33SKWsEtvaxTN-o849zUknvSeVqBanlbkM.apk). Cópia local: `entregas/Maquete-conectada-v0.3.0-android.apk`, 73.540.306 bytes (aproximadamente 73,5 MB). O APK é uma entrega gerada e não entra no Git. Build concluído não comprova comportamento no dispositivo: teste nativo ainda pendente.

Arquivo baixado e aberto como contêiner APK; presença de AndroidManifest.xml e classes.dex conferida. SHA-256: `A39FB43D8229EDC426F410865B02E11F43144F6398297944D656DB4B085330F4`. Essa verificação registra integridade e estrutura básica, sem substituir instalação ou validação da assinatura Android no dispositivo.

## Gerar e compartilhar

Na pasta do projeto, conferir a conta:

```powershell
npx --yes eas-cli@latest whoami
```

Se não estiver autenticado, César faz login no terminal local, sem enviar senha ou token no chat:

```powershell
npx --yes eas-cli@latest login
```

Vincular o projeto à conta e iniciar o perfil de teste:

```powershell
npx --yes eas-cli@latest init
npx --yes eas-cli@latest build --platform android --profile preview
```

O primeiro build pode solicitar criação da chave de assinatura Android. A chave deve ser preservada para atualizar a mesma instalação. Acompanhar o resultado no endereço retornado pelo EAS; apenas um resultado concluído com artefato APK comprova a compilação. Enviar o link de instalação à equipe somente depois de verificar a primeira instalação. Não é necessário usar a Play Store ou manter o computador ligado para executar este perfil.

O EAS utiliza os recursos da conta. A página de preços consultada em 02/10/2026 apresenta até 15 builds Android e 15 iOS no plano Free, com fila de baixa prioridade. A cota restante desta conta ainda não foi verificada. Não contratar plano pago para esta etapa sem autorização.

Preparação verificada localmente: tipos, oito testes de domínio e exportação web passaram. Compilação EAS concluída; validação da instalação e do funcionamento permanece pendente.

Histórico em 02/10/2026: `eas whoami` inicialmente retornou `Not logged in`; após login local feito por César, confirmou a conta cesarcfw. Só então foram criados o projeto, a chave e o build.

## Conferência no Android

**TIRE PRINT DESTA PARTE:** app instalado com nome/ícone, versão e identificação dos dados simulados; registrar modelo do telefone e versão do Android.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** abrir pelo ícone com computador desligado; ligar/desligar luz e ajustar intensidade; mudar triagem Manchester; simular gás, reconhecer, fechar com saída à direita e reabrir; comparar com movimentos reduzidos. Registrar permissões e cenários offline/sem confirmação.

Os perfis e dados permanecem simulados e não compartilhados entre colegas. A hospedagem web escolhida é Vercel; EAS Build será usado para o APK. A validação web não substitui a execução nativa.

## Referências

- [Expo — primeiro build](https://docs.expo.dev/build/setup/).
- [Expo — gerar e instalar APK](https://docs.expo.dev/build-reference/apk/).
- [Expo — distribuição para testes](https://docs.expo.dev/build/internal-distribution/).
- [Expo — excluir arquivos da compilação](https://docs.expo.dev/build-reference/easignore/).
- [Expo — preços e limites](https://expo.dev/pricing).
