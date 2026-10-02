# APK de teste — Maquete conectada

## Estado da preparação

Projeto Expo SDK 57. Perfil `preview` em `eas.json` gera APK Android para instalação direta, com JavaScript incluído e sem cliente de desenvolvimento. Identificador Android: `com.cesarcfw.tccmaqueteapp`; versão do app 0.3.0 e código Android inicial 1. Sem publicação em loja nesta etapa.

O plugin Expo fornece orientações de trabalho. O acesso da ferramenta de compilação à conta deve ser conferido separadamente por `whoami`. O projeto ainda precisa ser vinculado à conta por `eas init`, que grava o identificador real em `extra.eas.projectId`; não inventar esse identificador.

`.easignore` exclui dependências, exportações, entregas, documentação/capturas e arquivos locais de credenciais do envio para compilação. A configuração não comprova uma compilação nativa concluída. Ainda não há APK gerado ou validado no telefone.

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

Preparação verificada localmente: tipos, oito testes de domínio e exportação web passaram. Compilação EAS e validação do APK permanecem pendentes.

Conferência da ferramenta em 02/10/2026: `eas whoami` retornou `Not logged in`. Login local solicitado a César. Não foi criado projeto remoto, chave ou build antes da autenticação.

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
