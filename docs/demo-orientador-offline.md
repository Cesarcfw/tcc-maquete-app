# Edição de avaliação offline para o orientador

## Objetivo

APK independente para explorar a interface do SAMAHI sem cadastro, senha, backend, Node-RED ou ESP32. Compartilha as telas e componentes da aplicação principal, mas apresenta a conta local **Orientador** e o botão **Entrar como Orientador** na tela de acesso. A conta não existe no banco real, não tem senha embutida e não autentica em nenhum serviço.

O nome instalado é **SAMAHI Avaliação** e o identificador Android é `com.cesarcfw.tccmaqueteapp.evaluation`, permitindo coexistir com `com.cesarcfw.tccmaqueteapp`. A edição normal continua abrindo `ConnectedApp` com autenticação real. O perfil `evaluation` define as variáveis de compilação; não remover a autenticação do backend nem colocar credenciais reais nesse perfil.

## Usar e avaliar

1. Instalar o APK de avaliação e tocar em **Entrar como Orientador**.
2. Abrir o Quarto 01 e experimentar iluminação, intensidade, Dia/Noite por Brasília, indicador simplificado de quatro cores, alerta de gás simulado, cenários de comunicação e histórico local.
3. Explorar cadastro de ambientes e permissões como administrador local. Os dados são fictícios e mantidos na memória da sessão; reiniciar o app restaura os exemplos e volta ao acesso.
4. Testar sem internet no aparelho. No APK, nenhuma máquina com Metro/Expo, backend ou Node-RED precisa permanecer ligada. A interface identifica dados e confirmações como simulados; essa edição não controla a maquete e não comprova segurança, persistência ou integração física.

## Desenvolvimento e build

- `Iniciar-Demo-Orientador.cmd` abre a versão web na porta 8083 com `APP_VARIANT=evaluation` e cache limpo. Esse inicializador não liga os servidores do sistema principal.
- Build Android: `eas build --platform android --profile evaluation`. O perfil produz APK interno, sem cliente de desenvolvimento. Não substituir o perfil `preview` do sistema integrado.
- `app.config.js` define nome, pacote e `extra.appVariant` conforme `APP_VARIANT`. `App.tsx` usa essa configuração via expo-constants para escolher a entrada; a edição integrada permanece com login real. O nome da variante não é segredo nem credencial.
- Os comandos de início e exportação usam `--clear`, pois Metro pode reutilizar inclusive o manifesto de outra variante ao alternar builds. Antes de alternar variantes no desenvolvimento, encerrar o Metro anterior e usar o inicializador correspondente. Não usar cache de avaliação como evidência de login integrado; os dois fluxos são verificados separadamente após limpeza.
- `DemoApp` compartilha as telas; `useSimulator` executa a lógica local. A agenda local usa a mesma função de período/fuso da implementação existente; um comando manual pausa a agenda. Gás e indicador continuam independentes.
- `.easignore` exclui backend, banco, segredos, arquivos `.env`, documentos e artefatos de entrega do arquivo enviado à compilação. Não incluir `wifi_config.h`, backups ou senhas.

## Evidências e limites

**TIRE PRINT DESTA PARTE:** tela inicial com conta de avaliação, quatro botões do indicador sem laranja e nome do app instalado.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** iniciar o APK com internet desligada, entrar como Orientador, alterar luz e cor, testar Dia/Noite, apresentar alerta de gás simulado e sair. Registrar web e Android separadamente; compilação/exportação não equivalem a teste no telefone.

Validação em 16/11/2026: typecheck e 27 testes de domínio/cliente passaram, incluindo conta/permissões locais e agenda. Exportação web da variante passou. Em navegador isolado, viewport de 390x844: entrada como Orientador, abertura do quarto, luz em 25% e amarelo confirmados na simulação; nenhum pedido `/api/` e nenhum erro de página. O painel também foi inspecionado em 1440x1000. Capturas em [evidências](evidencias/demo-orientador/README.md).

A geração e a instalação do APK têm validação separada. A primeira solicitação de build foi cancelada antes da entrega para incluir o rótulo correto Conta de teste. Não afirmar que o orientador recebeu/testou o arquivo apenas porque o build terminou.

## Referências

- [Expo: variantes instaláveis no mesmo dispositivo](https://docs.expo.dev/build-reference/variants/)
- [Expo: geração de APK Android](https://docs.expo.dev/build-reference/apk/)
- [Expo: variáveis de ambiente](https://docs.expo.dev/guides/environment-variables/)
