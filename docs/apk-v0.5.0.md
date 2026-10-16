# SAMAHI 0.5.0 — APK interno Android

Preparação em 16/10/2026. Android versionCode 4; pacote com.cesarcfw.tccmaqueteapp. Mesma assinatura remota do projeto Expo. Não é release final nem publicação em loja.

## Conteúdo

Versão atual com entrada real, permissões por quarto/grupo, backend Express/Better Auth com SQLite local, painel Stitch, administração e comandos confirmados pelo ESP virtual do Node-RED. O banco fica no computador, não dentro do APK. Sessão do cliente em memória; endereço do servidor editável na entrada.

Túnel e publicação externa não fazem parte desta build. Perfil preview permite HTTP local apenas para ensaio em rede confiável. Arquivos .env, banco, segredo de autenticação, backend e evidências não entram no arquivo enviado ao EAS.

## Instalar e configurar

1. Instalar o APK pelo link da build concluída. Deve atualizar o SAMAHI anterior usando o mesmo pacote e assinatura. Não desinstalar para contornar erro sem conferir a mensagem.
2. Abrir pelo ícone; não depende de Expo Go ou Metro para carregar a interface.
3. Manter backend e Node-RED no PC. Usar o iniciador de integração e escolher o Wi-Fi do telefone; no APK, em **Configurar conexão**, informar `http://IP-DO-PC:3002`, conforme exibido pelo iniciador. O iniciador também abre Expo, mas o APK não usa esse servidor.
4. **Testar servidor**, entrar com sua conta e abrir Quarto 01. O endereço inicial 127.0.0.1 não representa o PC quando usado no telefone; substituir pelo IP correto. Não confundir demonstração isolada com integração autenticada.
5. Executar o [roteiro de validação](teste-app-integrado.md): luz, religar, LDR automático, sensores, Manchester, gás, histórico e permissões. O simulador atual atende somente quarto-01.

O dispositivo real ainda precisa ser integrado com Gabriel. Dados simulados e confirmações simuladas permanecem identificados na interface.

TIRE PRINT DESTA PARTE: aplicativo instalado, versão e painel com fonte simulada, sem senhas/tokens.

MOSTRE FUNCIONANDO EM VÍDEO OU GIF: abrir pelo ícone com Metro desligado, login, luz 25% → apagar → religar, alerta de gás e Manchester independente; reconexão ao backend.

## Build

Perfil preview, Android APK, distribution internal, developmentClient false. Build enviada em 16/10/2026: `6851f9d1-ca11-496a-9c29-8ccb68880160`, código do commit `48da039`, branch feat/auth-local. Conta/projeto: @cesarcfw/tcc-maquete-app. Keystore remota existente reutilizada; sem nova chave ou publicação em loja.

[Acompanhar build](https://expo.dev/accounts/cesarcfw/projects/tcc-maquete-app/builds/6851f9d1-ca11-496a-9c29-8ccb68880160).

Envio de aproximadamente 6 MB aceito pelo EAS; não havia variáveis Plain text/Sensitive configuradas no ambiente preview. Perfil carregou apenas EXPO_PUBLIC_NODE_RED_URL com o marcador de demonstração. Banco, segredo e .env locais excluídos pelo .easignore.

Build concluída com status **FINISHED**. [Baixar APK 0.5.0](https://expo.dev/artifacts/eas/HDOHizpcVc3dFH2AUxe68TaEyjDg2cFyN4J9PR4dJkE.apk).

Cópia local: entregas/SAMAHI-v0.5.0-android.apk. Tamanho: 73.623.630 bytes. SHA-256: `A5A7BA243AF6A49923E1CA04D00517CCEA461976F262DC864955A712A0B0D1B5`.

Contêiner APK aberto e entradas AndroidManifest.xml (9.700 bytes) e classes.dex (9.610.480 bytes) conferidas. Lint, tipos, 14 testes e exportação web passaram antes do processamento. A conclusão da compilação e a inspeção estrutural não comprovam instalação, rede ou controles no aparelho. Instalação e controles no APK permanecem pendentes de teste no telefone.

Referência primária: [Expo — gerar APK instalável](https://docs.expo.dev/build-reference/apk/).
