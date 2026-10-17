# Teste integrado no telefone

Objetivo: validar cliente Android → backend local → Node-RED virtual. A aceitação do APK precisa ser registrada separadamente do Expo Go.

## Preparar a rede

PC e telefone na mesma rede privada, com comunicação entre dispositivos permitida. Wi-Fi institucional pode isolar clientes; hotspot do notebook pode ser alternativa se o adaptador/sistema permitir. Não é necessário internet para a comunicação local, mas instalação de dependências/login EAS e alguns recursos de desenvolvimento podem exigir internet.

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

Para usar apenas o APK, backend e Node-RED bastam; Metro serve desenvolvimento. Pode iniciar o backend manualmente com as [variáveis LAN](instalacao-configuracao.md) em vez de manter o Expo ligado.

## Roteiro de aceite

1. Conta válida entra; inválida falha; abrir Quarto 01 e conferir dados recentes.
2. Luz: ligar, variar intensidade, zerar e religar; conferir restauração da última positiva e ACK/histórico.
3. Agenda: salvar horários distintos e intensidades; programar virada próxima em Brasília; fechar app, aguardar e reabrir. Manual deve pausar; reativar deve retomar.
4. Gás no Node-RED: normal → detectado → reconhecer → normal; confirmar alerta, animação/redução de movimento e transições no histórico. Reconhecer não remove gás.
5. Alterar Manchester e mostrar independência da luz/gás.
6. Conta sem controle: backend impede ação; conta somente history não vê sensores.
7. Node-RED offline/stale/timeout: app informa falha, não inventa confirmação; normal retorna e registra recuperação após nova consulta.
8. Alterar endereço válido, tema e movimento; encerrar/reabrir. Preferências voltam, login é solicitado. Reiniciar Node-RED e validar luz persistida.
9. Desligar Wi-Fi/retomar: conferir estado e recuperação; distinguir falha cliente→backend de falha backend→dispositivo.

Use cenário de ensaio e contas fictícias. Ao terminar, retorne Node-RED a normal e registre configurações alteradas para não confundir o próximo colega.

## Registrar o resultado

Anotar data, commit/build, Expo Go ou APK, aparelho/Android, IP/portas, origem virtual, cenário, resultado esperado/observado e arquivos de evidência. Resultado “passou no web” não preenche a coluna Android.

**TIRE PRINT DESTA PARTE:** painel do telefone com leitura recente, agenda confirmada e histórico, omitindo dados sensíveis.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** celular envia comando → Node-RED confirma → painel muda → falha é provocada → estado é preservado → comunicação retorna.

Registro prévio: César confirmou `/health`, login e abertura do quarto no Expo Go. Isso não documenta aceite completo de todos os passos acima no APK 0.6.0 instalado.
