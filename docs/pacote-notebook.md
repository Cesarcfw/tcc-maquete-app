# Pacote portátil do notebook

Preparação em 22/11/2026, branch `feat/pacote-notebook`, sobre `feat/rede-esp-notebook`. Destino informado por César: Windows 10 de 64 bits. Entrega privada para executar Node-RED e backend com o APK integrado no telefone; não é um instalador do aplicativo Android nem uma build final.

## Conteúdo e uso

O ZIP leva Node.js **24.22.3 win-x64**, backend/dependências, Node-RED **5.0.8**/dependências, módulos locais, fluxo físico, estado de iluminação e snapshots dos bancos/segredo. As dependências foram reinstaladas em uma pasta de entrega com `npm ci --omit=dev --ignore-scripts --no-audit --no-fund`, a partir dos lockfiles. Não foram copiadas as pastas node_modules do ambiente de desenvolvimento.

O Node portátil veio do [site oficial](https://nodejs.org/download/release/v24.22.3/), com SHA256 do ZIP conferido no `SHASUMS256.txt` oficial: `e612af99f626ab415ea225af6bce5c971feb448cb5cae250bb1c3fa50c5f7d9f`. A matriz do [Node 24](https://github.com/nodejs/node/blob/v24.22.3/BUILDING.md) lista Windows x64 a partir do Windows 10; não substitui o ensaio no notebook específico. O [Node-RED recomenda Node 24.x](https://nodered.org/docs/faq/node-versions).

1. Extrair toda a pasta **SAMAHI-Notebook** para um caminho curto e gravável, por exemplo `C:\SAMAHI`. Não executar dentro do ZIP nem separar suas subpastas.
2. Abrir **01-VERIFICAR-PACOTE.cmd**. Confere hashes dos arquivos fixos, dependências, fluxo físico e integridade dos dois bancos. Dados mutáveis não são comparados por hash após uso.
3. Conectar notebook e telefone à mesma rede e abrir **02-INICIAR-SAMAHI.cmd**. O iniciador usa o Node portátil, sem alterar o PATH global e sem abrir Expo. Mostra a URL para o APK e o IP a informar no portal do ESP. Enter repete a URL; Ctrl+C encerra somente os filhos iniciados ali.
4. Se necessário, executar **03-LIBERAR-ACESSO-TELEFONE.cmd** como administrador, após escolher a rede. O firewall permanece ativo; editor Node-RED local em 127.0.0.1:1880.
5. No telefone, usar a conta existente no APK integrado, com a URL mostrada pelo notebook. Ajustar o destino do ESP conforme o [guia de rede](rede-esp-notebook.md). A rede própria exige firmware AP+STA previamente gravado; o ZIP não grava a placa.

Não é necessário instalar VS Code, Node.js, Arduino IDE, Expo ou baixar dependências no notebook para essa execução. O APK precisa estar instalado no telefone. A edição offline Avaliação não controla a maquete; a interface do Vercel continua separada.

## Persistência e privacidade

O empacotador usa `VACUUM INTO` para cada SQLite, incluindo registros no WAL, e `PRAGMA integrity_check` no resultado. Copia o mesmo auth-secret do backend e verifica que fluxos, segredo e JSONs de estado não mudaram durante a captura. Os processos originais não são encerrados nem seus dados substituídos. Cada banco é consistente por si; a captura não é uma transação distribuída entre backend e coletor.

O ZIP inclui contas, hashes de senha, concessões, quartos, históricos e auth-secret. Se a configuração AP estiver disponível, inclui `PRIVADO/REDE-DO-ESP.txt` com nome/senha do AP e acesso ao portal; não inclui senha OTA nem credenciais do Wi-Fi externo. A saída não é criptografada e não deve ser publicada em GitHub, Trello, release ou link aberto. O repositório contém somente o gerador/modelos e documentação, nunca o pacote ou seus dados.

As cópias do PC e notebook são independentes, sem sincronização automática. Para uma transferência nova, usar outra pasta com serviços parados no destino, preservando backup do conjunto anterior; não sobrepor WAL/SHM em uso. Guardar o ZIP original como ponto de restauração e continuar trabalhando apenas na pasta extraída.

## Verificação realizada

- Node portátil executado diretamente, sem depender do Node global; manifesto/dependências e dois snapshots íntegros.
- Oito testes backend/transporte/banner executados com os módulos e Node do pacote: autenticação/permissões, histórico, cliente nativo, cadeia física com ACK sintético e saída de URL aprovados. Não enviam comandos ao ESP real.
- Ensaio adicional de restauração em dados/portas temporários: todos os tipos do fluxo completo carregaram; API física devolveu 503 sem ESP, sem fallback simulado; backend iniciou sobre cópia do snapshot preservando contas/quartos e respondeu health 200. Saídas UDP do ensaio foram limitadas ao loopback e injects desativados.
- Lint, tipagem, 31 testes do app e exportação web aprovados na fonte. A etapa não altera telas ou protocolo do dispositivo.
- Ainda não foi executado no notebook Windows 10 informado, nem foi comprovado o conjunto ESP + telefone + notebook nessa máquina. O uso inicial no destino é parte do aceite.

## Manutenção do empacotador

Gerador: [package-notebook.mjs](../scripts/package-notebook.mjs). Modelos do pacote: `scripts/notebook-package`. Ensaio isolado: [test-notebook-package.mjs](../scripts/test-notebook-package.mjs).

```powershell
node scripts/package-notebook.mjs --out C:\EntregaPrivada\SAMAHI-Notebook --runtime C:\Cache\node-v24.22.3-win-x64 --node-zip C:\Cache\node-v24.22.3-win-x64.zip --node-shasums C:\Cache\SHASUMS256.txt
C:\EntregaPrivada\SAMAHI-Notebook\runtime\node.exe C:\EntregaPrivada\SAMAHI-Notebook\scripts\check-package.mjs
C:\EntregaPrivada\SAMAHI-Notebook\runtime\node.exe scripts/test-notebook-package.mjs C:\EntregaPrivada\SAMAHI-Notebook
```

A pasta de saída deve ser nova. Fornecer runtime extraído do mesmo ZIP oficial cujo manifesto foi verificado. Preparar e conferir na máquina de origem; só depois compactar a entrega privada. O gerador instala dependências apenas na entrega e usa uma cache separada. Não há instalador MSI ou serviço automático no Windows.

**TIRE PRINT DESTA PARTE:** verificador no destino, URL do console, sensores/ACK sem senhas. **MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** extração/inicialização no notebook, login/controle pelo telefone, reinício e reconexão; registrar versão/origem física e limitações observadas.
