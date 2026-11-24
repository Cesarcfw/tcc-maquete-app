# APK integrado SAMAHI 1.0.0

Candidata para apresentação do protótipo do TCC. Compilação pelo perfil EAS `preview`, distribuição interna em APK e variante integrada. Pacote Android `com.cesarcfw.tccmaqueteapp`, versionCode **7**, com a assinatura existente do projeto. O perfil mantém HTTP local para acessar o backend da maquete.

## Operação

1. Instale o APK no Android. Se o SAMAHI integrado anterior estiver instalado com a mesma assinatura, o Android pode atualizá-lo no lugar.
2. Siga o [guia do notebook e da rede do ESP](rede-esp-notebook.md). No app, informe a URL do backend exibida no notebook.
3. Entre com a conta existente e abra o Quarto 01. Siga o [roteiro do telefone](teste-app-integrado.md) para registrar leituras, comandos, reconexão e permissões.

A edição Avaliação usa outro pacote Android. O APK integrado exige que o notebook execute backend e Node-RED para operar a maquete.

**TIRE PRINT DESTA PARTE** com a versão instalada e o painel do quarto, ocultando credenciais. **MOSTRE FUNCIONANDO EM VÍDEO OU GIF** a confirmação do comando no app e a reação do LED físico no mesmo ensaio.

## Rastreabilidade

O registro da compilação deve identificar ID da build, commit enviado, status, tamanho e SHA-256 do APK verificado. O teste no telefone deve identificar a instalação usada e as funções que foram observadas.

Fonte do procedimento de build: [documentação do Expo](https://docs.expo.dev/build-reference/apk/).
