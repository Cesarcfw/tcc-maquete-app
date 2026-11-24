# ADR 007 Ponte física e rede local

**Status**: adotado na main do SAMAHI 0.7.0. Registro retrospectivo das mudanças dos PRs #25, #27 e #28.

## Contexto

A simulação em Node-RED permitia desenvolver sem a placa. A apresentação exige operar o ESP32 a partir do mesmo cliente autenticado e levar backend e gateway a um notebook. O isolamento de clientes ou a falta de acesso ao Wi-Fi do local pode impedir a operação.

## Decisão

O backend continua responsável por contas, concessões e auditoria. O Node-RED oferece uma API HTTP interna e traduz operações físicas para UDP, preservando a origem dos dados e a confirmação correlacionada do firmware. Apenas o fluxo escolhido atende às rotas do Quarto 01. O modo offline de avaliação fica separado.

O ESP conserva a rede própria e pode atuar como cliente de outro Wi-Fi. O portal salva a escolha de rede e o destino do notebook em NVS. O pacote portátil privado prepara backend, Node-RED e dados para execução sem instalação global no notebook.

## Consequências

- Rede e porta de destino precisam corresponder à interface usada pelo notebook. O AP e o Wi-Fi externo são caminhos separados.
- Uma confirmação de firmware não substitui a observação física do atuador. A agenda depende do Node-RED, e o aviso de gás permanece local na placa.
- A rede usa HTTP e UDP em uma bancada de confiança. O canal físico não implementa identidade criptográfica de dispositivo. O pacote deve ter distribuição restrita.

Ver [integração física](../integracao-esp-fisico.md), [rede](../rede-esp-notebook.md) e [segurança](../seguranca.md).
