> **Registro histórico.** Instruções e resultados da etapa original; não é o guia operacional atual. Consulte [teste-app-integrado.md](teste-app-integrado.md) e o [índice atual](README.md).

# Testar o SAMAHI completo no telefone

Responsável: César. Esta etapa integra app Expo Go, autenticação/SQLite e Node-RED com ESP virtual. Não é teste de hardware físico nem publicação final.

## Iniciar

1. Conectar o PC e o telefone ao mesmo Wi-Fi.
2. Na raiz do projeto, abrir **Iniciar-App-Integrado.cmd**, ou executar `npm.cmd run test:phone`. Se houver várias redes, escolher a mesma do telefone. Para fixar a interface: `npm.cmd run test:phone -- --host IP-DO-PC`.
3. O iniciador reutiliza o Node-RED configurado em 127.0.0.1:1880. Se ele estiver parado e sua instalação existir na pasta vizinha samahi-node-red, o iniciador também o abre. Não importa nem substitui fluxos existentes; exige o fluxo SAMAHI já instalado.
4. Abre uma instância do backend no IP escolhido, porta **3002**, usando o mesmo banco e segredo em backend/data. Não altera a instância existente em 3001. SQLite/WAL mantém o acesso das instâncias ao mesmo banco.
5. Abre o Expo Go na porta **8082**, define EXPO_PUBLIC_BACKEND_URL e anuncia o IP correto pelo QR, evitando a interface VPN. Não modifica arquivos .env. Portas ocupadas provocam mensagem de erro; o iniciador não encerra processos existentes.
6. Se o Windows bloquear o acesso, executar **Liberar-Acesso-App.cmd como administrador**, depois de escolher a rede no iniciador. Regras permitem somente TCP 3002/8082, no IP e interface selecionados, vindos da sub-rede local, para o executável Node. O perfil Public do Windows também é contemplado sem alterar a classificação da rede. Nenhuma porta é encaminhada no roteador. Para remover as duas regras: executar `Liberar-Acesso-App.cmd -Remover` como administrador.
7. No navegador do telefone, abrir `http://IP-DO-PC:3002/health`. Deve aparecer `status: ok` e `service: samahi-backend`.
8. Escanear o QR no Expo Go compatível com SDK 57. Entrar com a conta criada por César, sem usar **Explorar demonstração**. O endereço já vem preenchido; **Configurar conexão → Testar servidor** permite verificar acesso sem informar senha. Health confirma o servidor, não autenticação nem conexão do ESP.

O ensaio usa HTTP na rede local confiável com dados simulados. HTTP não cifra senha/token; não usar rede compartilhada ou dados reais de pacientes. HTTPS permanece requisito antes de ampliar o acesso. O Node-RED continua no loopback; o telefone fala apenas com o backend.

Ctrl+C encerra os serviços criados pelo iniciador; Node-RED que já estava ligado continua ativo. Para executar novamente em outro notebook, instalar as dependências, transferir/restaurar o banco e segredo pelo procedimento de backup, instalar o fluxo Node-RED e escolher o novo IP. Não há conta com senha padrão.

## Validar no telefone

Usar **Quarto 01 / ESP32-quarto-01**: é o único ambiente atendido pelo simulador atual. Cadastrar outro quarto não cria um segundo ESP virtual. O administrador inicial tem acesso a esse quarto; outras contas exigem concessões.

| Etapa | Ação | Resultado esperado |
| --- | --- | --- |
| Login | Entrar com sua conta | Catálogo autorizado, sem perfis fictícios |
| Sensores | Abrir Quarto 01 | Temperatura/umidade e atualização periódica, marcadas como simuladas |
| Luz | 25% → apagar → religar | Confirmação pelo backend e retorno à última intensidade positiva |
| Dia / Noite | Configurar os dois inícios e intensidades e ativar horários | Serviço aplica o período pelo horário de Brasília. LDR não controla mais a luz; comando manual pausa a programação. Ver [roteiro atual](modos-dia-noite.md) |
| Manchester | Selecionar uma cor | Indicador muda após confirmação; independente do gás |
| Gás | No PC, injetar **Gás detectado** no Node-RED | Faixa de alerta aparece no telefone |
| Reconhecimento | Reconhecer, fechar e reabrir a faixa | Detecção continua até retirar gás; Manchester não muda |
| Normalizar | No Node-RED, **Retirar detecção de gás** | Alerta normaliza na leitura seguinte |
| Temperatura | Injetar **Temperatura 30 °C / umidade 70%** | Telefone recebe 30 °C e 70% |
| Histórico | Abrir Histórico | Comandos e mudanças observadas de gás persistidos no SQLite |
| Permissões | Criar usuário, dar leitura de luz e entrar como ele | Consulta permitida; controle bloqueado no cliente e no servidor |
| Desconexão | Pausar comunicação no cenário do Node-RED | Não apresentar comandos como aplicados sem confirmação |
| Encerramento | Sair e tentar acessar os dados | Nova autenticação necessária |

O editor continua no PC, em http://127.0.0.1:1880. Injetar **Normal** restaura as entradas simuladas; não representa calibração de um sensor físico.

## O que foi verificado

- Rede atual do PC: Wi-Fi 2, 192.168.1.9. Porta 3002 respondeu e manifesto Expo Android anunciou 192.168.1.9, SDK 57.0.0. Endereço muda entre redes; não foi gravado no código do aplicativo.
- César confirmou que `/health` abriu com `status: ok` no navegador do telefone e depois confirmou que abriu o SAMAHI no Expo Go, entrou com sua conta e acessou o Quarto 01. Conexão, autenticação e navegação básica no telefone estão confirmadas por relato; ainda é necessário registrar os comandos e alertas no aparelho.
- Regras de firewall criadas após confirmação de administrador do Windows. Backend/Expo iniciados para este ensaio; instâncias anteriores 1880/3001/8081 preservadas.
- Teste HTTP com banco descartável e ESP virtual separado passou: login sem Origin/Cookie, Bearer, sensores, luz, religar, automático/LDR, Manchester, gás/reconhecimento, histórico e logout. Servidor de teste foi ligado ao endereço da interface Wi-Fi. Não alterou contas nem atuadores do ambiente real de demonstração.
- O teste usa node:http para representar o cliente nativo: fetch do Node adiciona Sec-Fetch-Mode e não reproduz exatamente os cabeçalhos do React Native. Nenhuma proteção CSRF ou de origem foi desativada. No app nativo, credentials=omit evita misturar cookies com a sessão Bearer; web conserva credentials=include.
- Botão **Testar servidor** conferido no web pela rede local; endereço automático e resposta correta. [Captura](evidencias/auth-local/servidor-rede-acessivel.png).
- Lint, tipos, 14 testes de domínio, duas suítes integradas do backend e exportação web aprovados. Validação dos controles e alertas no telefone/Expo Go ainda aguarda execução e registro de César. Sem APK novo ou ESP físico.

TIRE PRINT DESTA PARTE: Quarto 01 no telefone com dados simulados, confirmação de luz e histórico. Não mostrar senhas ou tokens.

MOSTRE FUNCIONANDO EM VÍDEO OU GIF: telefone alterando luz enquanto o PC recebe o estado; gás disparado no Node-RED aparecendo no telefone; Manchester preservado durante o alerta; controles bloqueados para usuário com leitura.

## Referências

- [Expo: servidor local, QR e mesma rede](https://docs.expo.dev/get-started/start-developing/).
- [Expo Go e compatibilidade de SDK](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).
- [Better Auth: segurança, origens e clientes nativos](https://better-auth.com/docs/reference/security).
- [Better Auth: sessão Bearer](https://better-auth.com/docs/plugins/bearer).
- [Manual do banco e autenticação](autenticacao-persistencia-local.md).
