# Registro de verificação — rede ESP/notebook

Data: 22/11/2026. Branch `feat/rede-esp-notebook`, firmware `samahi-ap-sta-2026.11.22`. [Procedimento de operação](rede-esp-notebook.md).

## Resultados locais

- Compilação final para `esp32:esp32:esp32`, core 3.3.12, sem upload: **1.028.070 bytes de programa (78% de 1.310.720)** e **53.032 bytes de RAM estática (16% de 327.680)**. Isso não mede RAM dinâmica sob carga. Também foram avaliados pelo compilador os static_assert do alarme de gás preservado.
- `npm run typecheck`, `npm test` (**31 testes**) e `npm run export:web`: aprovados. Não foram alteradas telas do app.
- `node --test backend/test/*.test.mjs integration/node-red/physical-runtime.test.cjs`: **8 testes aprovados**, incluindo 3 verificações do banner e os ensaios existentes de autenticação/permissões, histórico, cliente nativo Bearer, cadeia física autenticada e HTTP/UDP/ACK sintéticos.
- A primeira execução desses ensaios HTTP no ambiente restrito falhou com `EACCES` nas conexões de loopback. A repetição com acesso local autorizado passou, usando bancos e portas temporários; não utilizou a placa nem a conta real.
- `node scripts/test-phone.mjs --apk --prepare --host 192.168.1.9`: mostrou a interface Wi-Fi 2, backend em `http://192.168.1.9:3002` e rota `/health`. Foi apenas preparação, sem iniciar serviços. O IP vale para esse PC/rede naquele momento.
- Lint e referências locais da documentação: aprovados. Arquivos reais `wifi_config.h`, `ota_config.h` e `network_config.h` permanecem ignorados pelo Git. Binários de compilação ficam fora do repositório e contêm credenciais; não distribuir.

## Não comprovado nesta etapa

Não houve gravação nem teste físico AP/STA/portal/OTA; não foi comprovada persistência NVS na placa, passagem de canal, mudança de sub-rede ou coexistência dos clientes. Não foi iniciado o conjunto real no notebook da apresentação, aplicada regra de firewall nem gerado novo APK. O fluxo Node-RED e o banco reais foram preservados. O iniciador foi conferido em modo de preparação; validação interativa completa, inclusive Enter/Ctrl+C, deve ser feita no ensaio físico.

## Aceite pendente

1. Gravar e conferir firmwareVersion.
2. Conectar notebook e telefone ao AP; salvar IP real no portal, iniciar serviços e abrir `/health` no telefone.
3. Validar login, sensores e controles com ACK. Repetir após reiniciar ESP, notebook e app.
4. Configurar Wi-Fi externo; demonstrar AP ainda habilitado, escolher caminho de rede e atualizar IPs. Verificar recuperação com senha incorreta/roteador indisponível.
5. Validar que o alerta de gás segue local, sem notebook; agenda depende do Node-RED. Testar apenas pelo procedimento de bancada acordado.
6. **TIRE PRINT DESTA PARTE** do console e portal sem credenciais; **MOSTRE FUNCIONANDO EM VÍDEO OU GIF** a sequência completa, registrando resultados reais e versão.
