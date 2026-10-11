# SAMAHI v0.4.1 — APK de teste Android

## Objetivo e configuração

APK interno do app atual: redesign Stitch e integração HTTP com o ESP virtual no Node-RED. Android versionCode 3, pacote com.cesarcfw.tccmaqueteapp e mesma assinatura do projeto Expo. Não é release final ou publicação em loja.

O perfil preview permite HTTP sem TLS para testar o Node-RED local. O plugin plugins/withLocalNetwork.js altera o manifesto Android somente nesse perfil; outros perfis definem usesCleartextTraffic=false. Configuração dinâmica em app.config.js. Referência: https://docs.expo.dev/versions/latest/sdk/build-properties/ e https://docs.expo.dev/config-plugins/introduction/.

O build inicia com https://servico.exemplo, marcador da demonstração interna. Nenhum IP do PC fica embutido; eas.json define esse valor e .easignore exclui arquivos .env locais. No app, César deve editar o quarto-01 em Conexões e informar http://IP-DO-NOTEBOOK:1880. Atualmente o backend atende somente quarto-01. O endpoint configurado não é persistido após encerrar completamente o processo do app.

## Teste no telefone

1. Instalar o APK e abrir pelo ícone; não precisa de Expo Go ou servidor Metro.
2. Validar temas, navegação, intensidade e alertas em demonstração interna.
3. Notebook e telefone na mesma rede; configurar o Node-RED para aceitar a rede local e proteger o editor/API. A configuração atual é somente loopback; este APK não modifica firewall ou o servidor.
4. Editar a conexão do quarto-01 com o IP real do notebook, testar conexão e salvar.
5. Conferir fonte Node-RED simulado, temperatura/umidade e comandos de luz/intensidade/automático/indicador.
6. Alterar entradas de sensores no Node-RED e conferir atualização no telefone. Testar interrupção e recuperação sem apresentar comando como aplicado em falha.

TIRE PRINT DESTA PARTE: ícone instalado, conexão do quarto, origem dos dados e confirmação. Registrar modelo do aparelho e versão Android.

MOSTRE FUNCIONANDO EM VÍDEO OU GIF: abrir sem Metro, mudar intensidade, apagar/religar, controlar Manchester e reconhecer gás sem mudar triagem; testar perda e recuperação da API.

## Limites e resultados

Login/permissões demonstrativos e estado em memória. Hardware real e transporte ESP continuam pendentes. Compilação não comprova instalação, funcionamento Android nem acesso LAN. Resultados do build serão registrados após retorno do EAS.

## Compilar

Build iniciado em 11/10/2026: 1a20d872-02fb-4c41-9f89-74a1abec83c6, perfil preview, Android v0.4.1 (3). Mesma chave remota do APK anterior. Acompanhamento: https://expo.dev/accounts/cesarcfw/projects/tcc-maquete-app/builds/1a20d872-02fb-4c41-9f89-74a1abec83c6.

Validação local: lint, tipos, 14 testes e exportação web aprovados. Manifesto Android introspectado: preview true e production false para usesCleartextTraffic. Instalação física e conexão móvel permanecem pendentes.

`npx --yes eas-cli@latest build --platform android --profile preview --non-interactive --no-wait`

Referência do APK: https://docs.expo.dev/build-reference/apk/.
