# SAMAHI 0.7.0 — APK integrado com ESP físico

Preparação em 19/11/2026, branch feat/apk-v0.7.0, sobre a integração física do PR #25. Android versionCode **6**, pacote **com.cesarcfw.tccmaqueteapp**, projeto Expo existente. Build interna de APK, sem publicação em loja ou release final.

## Conteúdo e operação

Inclui login real, ambientes/permissões, DHT22/MQ-2, luz/intensidade, quatro cores e confirmação física por ACK. Reconhecer o aviso de gás não interrompe a sinalização local; agenda Dia/Noite depende do Node-RED ligado. Ver [integração física](integracao-esp-fisico.md).

Perfil preview fixa APP_VARIANT=integrated e EXPO_NO_DOTENV=1. Arquivos .env, banco/segredos do backend, entregas e documentos são excluídos do envio ao EAS. Não há conta de avaliação embutida nessa edição. O endereço do backend continua configurável e salvo no aparelho.

1. Instalar como atualização do SAMAHI integrado anterior, preservando dados. A edição SAMAHI Avaliação tem outro pacote e pode coexistir.
2. Manter ESP e computador na mesma rede; iniciar backend e Node-RED atuais. O APK abre sem Expo Go/Metro, mas precisa dos serviços para login e funções reais.
3. Em Configurar conexão, usar http://IP-DO-PC:3002 quando essa for a porta da instância; não usar localhost/127.0.0.1 do telefone para apontar ao computador.
4. Verificar conexão, entrar com conta existente e abrir Quarto 01. Selecione os controles e confira o equipamento real.

## Verificação e aceite

Os testes de software e a leitura real da API estão registrados no guia de integração. Uma compilação concluída não comprova instalação Android ou acionamento físico. Registrar separadamente esses resultados.

**TIRE PRINT DESTA PARTE:** versão instalada, configuração de conexão sem credenciais, sensores reais e confirmação do comando.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** app e placa juntos, luz em diferentes intensidades, desligar/religar, triagem, reconhecimento de alerta sem interromper pisca, desconexão/retorno e reabertura preservando preferências.

## Rastreabilidade da compilação

Build em preparação; identificador, resultado, artefato e SHA-256 serão registrados após a execução. Comando: `npx --yes eas-cli@latest build --platform android --profile preview --non-interactive`.

Fonte primária: [Expo — Build APKs](https://docs.expo.dev/build-reference/apk/).
