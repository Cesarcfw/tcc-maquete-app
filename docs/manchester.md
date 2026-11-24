# Indicador externo e Manchester

O aplicativo permite selecionar manualmente **vermelho, amarelo, verde, azul** e apagar (`off`). A opção laranja foi removida a pedido da equipe em 16/11/2026 para adequar os testes ao RGB físico. Trata-se de um **indicador simplificado de quatro cores**, não da implementação completa do Sistema Manchester, cuja referência possui cinco cores.

No firmware físico, o amarelo usa a mistura antes chamada de laranja: R=255, G=20, B=0. A mistura anterior do amarelo (255,60,0) foi retirada. A troca do nome na paleta não altera a classificação clínica de referência. O ciclo de teste passa por vermelho, amarelo, verde, azul e apagado; exige firmware RGB v2 e nova gravação para chegar à placa.

O app e as APIs rejeitam novos comandos `orange`. O decodificador ainda aceita uma leitura legada nessa cor para preservar o estado realmente reportado, exibido como `Laranja (legado)`, sem botão de seleção nem conversão silenciosa para amarelo. Registros antigos não são reescritos.

Não existe algoritmo de triagem, classificação automática de paciente, cronômetro clínico ou vínculo com prontuário. O app não define a prioridade por temperatura, gás ou outro sensor. A validação clínica não faz parte desta implementação.

O alerta de gás preserva a cor selecionada. Enquanto ativo, o firmware alterna o RGB entre a cor selecionada e apagado a cada 300 ms. Se o indicador estiver apagado, pisca em amarelo. Reconhecer o alerta no app não interrompe o pisca. Controle depende de `indicator: control`; leitura, de `indicator: read` ou control. O comando é `{ "kind": "indicator", "color": "blue" }` dentro do envelope de comandos documentado na [API](api/README.md).

No simulador Node-RED, o valor representa somente estado virtual e reinicia com o processo. No fluxo físico, o comando passa pelo backend, pelo gateway e pelo GPIO do ESP32. A confirmação física exige ACK do firmware.

Siga o [guia de integração física](integracao-esp-fisico.md) para configurar fluxo e vínculo do quarto. Registre a resposta óptica separadamente do ACK reportado pela placa.

**TIRE PRINT DESTA PARTE:** quatro botões de cor e ação de apagar no app; botão laranja ausente. **MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** ciclo de quatro cores no RGB e confirmação dos comandos, distinguindo a bancada física do simulador do aplicativo. Paleta nova e APK precisam de validação própria.

Fonte primária para as cores: [Grupo Brasileiro de Classificação de Risco — nota técnica de julho de 2024](https://www.gbcr.org.br/wp-content/uploads/2024/07/Nota-Tecnica-GBCR-Pais-preocupados-mal-estar.pdf). A seleção de cor no aplicativo não substitui os protocolos e formação profissional exigidos para classificação clínica.
