# Gerar e distribuir o APK interno

Build atual documentada: [SAMAHI 0.6.0](apk-v0.6.0.md). Esta página descreve o procedimento; não inicia uma nova build nem declara aceite físico.

## Pré-requisitos

Conta Expo autenticada no EAS CLI, projeto vinculado, dependências instaladas, configuração revisada e gates aprovados. Não enviar senha/token no chat nem versionar credenciais. EAS é serviço externo de build: execução pode depender das condições/limites da conta.

Na raiz do repositório:

```powershell
npx --yes eas-cli@latest login
npx --yes eas-cli@latest whoami
npx --yes eas-cli@latest project:info
```

Antes de gerar, conferir commit e status Git. O perfil `preview` de `eas.json` usa distribuição internal, buildType apk e não é developmentClient. `app.config.js` habilita HTTP local via plugin nesse perfil. A variável legada de Node-RED presente no perfil não substitui o endereço do backend autenticado, que pode ser configurado no login.

```powershell
npx --yes eas-cli@latest build --platform android --profile preview
```

Usar o identificador retornado para acompanhar e baixar o artefato no Expo. Não trocar o keystore sem planejar atualização: assinatura diferente pode impedir instalar por cima da versão existente. Reutilizar a configuração da conta/projeto autorizada.

## Instalar e conferir

Baixe o APK pelo link de distribuição, confirme versão/code/pacote/hash com o registro, instale em Android compatível e permita a instalação pela origem escolhida quando o sistema solicitar. O APK já contém a interface; não precisa Expo Go ou Metro para abri-la. Backend e Node-RED continuam necessários para dados e controle.

Configure no app a origem do backend alcançável pelo telefone, por exemplo `http://IP-DO-PC:3002`. Não use 127.0.0.1 para apontar ao PC. Execute o [roteiro de aceite](teste-app-integrado.md), inclusive encerramento/reabertura, agenda, falhas e permissões.

## Identidade e rastreabilidade

Pacote Android atual: `com.cesarcfw.tccmaqueteapp`. Build 0.6.0 registrada com versionCode 5. Registre build id, commit, perfil, horário, URL, tamanho e SHA-256 do artefato; não chame outro APK de “o mesmo” apenas porque tem o mesmo nome visível.

```powershell
Get-FileHash -Algorithm SHA256 .\entregas\SAMAHI-v0.6.0-android.apk
```

Arquivos em `entregas/` e dados/segredos do backend são excluídos do Git; `.easignore` também limita o pacote enviado ao EAS. Revisar conteúdo e variáveis públicas antes de uma nova build. Uma mudança no README não exige nova build; uma alteração no bundle/configuração nativa exige nova distribuição para alcançar o APK instalado, salvo se houver atualização OTA configurada e validada — não é o fluxo assumido aqui.

Fonte: [Expo — Build APKs](https://docs.expo.dev/build-reference/apk/).
