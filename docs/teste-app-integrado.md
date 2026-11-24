# Teste integrado no telefone

Objetivo: validar a cadeia Android → backend local → Node-RED → ESP32. O mesmo procedimento de acesso pode ser usado com o simulador Node-RED, desde que a origem fique registrada. Identifique separadamente Expo Go, APK integrado e avaliação offline.

## Preparar a rede

Notebook e telefone ficam na mesma rede privada, com comunicação entre dispositivos permitida. Para o ESP físico, siga o [guia AP/STA](rede-esp-notebook.md) para escolher a rede e configurar o destino UDP no portal. Wi-Fi institucional pode isolar clientes. O Wi-Fi do ESP permite operar localmente depois que os componentes estiverem instalados.

Após setup e Node-RED configurado, execute na raiz:

```powershell
npm run test:phone
```

Se houver mais de uma interface, use o IP correto:

```powershell
npm run test:phone -- --host 192.168.1.9
```

O comando verifica portas, usa banco existente, inicia backend no IP selecionado em 3002 e Metro/Expo Go em 8082. Reutiliza Node-RED já reconhecido ou tenta iniciar a instalação vizinha configurada. Não substitui fluxos nem encerra serviço alheio. Ctrl+C encerra seus processos filhos.

`--prepare` apenas grava a configuração de rede em `entregas/teste-app/rede.json`. Se necessário, execute `Liberar-Acesso-App.cmd` como administrador: cria regras específicas para Node/portas/IP/sub-rede da configuração; oferece remoção. Não desabilite o firewall inteiro.

## Conferir alcance

No navegador do telefone: `http://IP-DO-PC:3002/health` deve mostrar `status: ok` e `service: samahi-backend`. Abra Expo Go compatível via QR ou o APK instalado. No login, configurar conexão para essa mesma origem da API, não para 8082 ou 1880.

Para o APK instalado, use `Iniciar-SAMAHI-Notebook.cmd` no repositório ou `02-INICIAR-SAMAHI.cmd` no [pacote portátil](pacote-notebook.md). Esses iniciadores executam backend e Node-RED sem Metro. Em ambos, use a URL que o console mostra. Se faltar acesso, siga o procedimento de firewall do guia correspondente.

## Roteiro de aceite

1. Conta válida entra; inválida falha; abrir Quarto 01 e conferir dados recentes.
2. Luz: ligar, variar intensidade, zerar e religar; conferir restauração da última positiva e ACK/histórico.
3. Agenda: salvar horários distintos e intensidades; programar virada próxima em Brasília; fechar app, aguardar e reabrir. Manual deve pausar; reativar deve retomar.
4. Para gás, siga o procedimento de bancada da equipe ou use um cenário virtual identificado para avaliar a interface. No físico, confira estado e sinalização local do ESP. Reconhecer no app registra a ação e mantém o alerta do firmware enquanto ativo.
5. Alterar o indicador externo. No físico, conferir o ACK e observar o LED. Registrar se o alerta temporário preserva a cor de triagem selecionada.
6. Conta sem controle: backend impede ação; conta somente history não vê sensores.
7. Node-RED offline/stale/timeout: app informa falha, não inventa confirmação; normal retorna e registra recuperação após nova consulta.
8. Alterar endereço válido, tema e movimento; encerrar/reabrir. Preferências voltam, login é solicitado. Reiniciar Node-RED e validar luz persistida.
9. Desligar Wi-Fi/retomar: conferir estado e recuperação; distinguir falha cliente→backend de falha backend→dispositivo.

Use cenário de ensaio e contas fictícias. Ao terminar, retorne Node-RED a normal e registre configurações alteradas para não confundir o próximo colega.

## Registrar o resultado

Anotar data, commit/build, Expo Go ou APK, aparelho/Android, firmware, modo de rede, origem dos dados, condição de teste e resultado observado. Distinguir ACK reportado da resposta física do LED. Guardar IPs e dados da instalação no registro restrito à equipe.

**TIRE PRINT DESTA PARTE:** painel do telefone com leitura recente, agenda confirmada e histórico, omitindo dados sensíveis.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** celular envia comando → Node-RED confirma → painel muda → falha é provocada → estado é preservado → comunicação retorna.

Registros existentes: César confirmou `/health`, login e abertura do quarto no ensaio anterior com Expo Go. Também confirmou que o Wi-Fi do ESP e o pacote portátil funcionaram. Ver o [registro de rede e notebook](rede-esp-notebook-validacao.md) e a [rastreabilidade do APK 0.7.0](apk-v0.7.0.md) para identificar o alcance de cada evidência.
