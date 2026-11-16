# Indicador externo e Manchester

O aplicativo permite selecionar manualmente **vermelho, amarelo, verde, azul** e apagar (`off`). A opção laranja foi removida a pedido da equipe em 16/11/2026 para adequar os testes ao RGB físico. Trata-se de um **indicador simplificado de quatro cores**, não da implementação completa do Sistema Manchester, cuja referência possui cinco cores.

No firmware de bancada separado, o amarelo usa a mistura antes chamada de laranja: R=255, G=20, B=0. A mistura anterior do amarelo (255,60,0) foi retirada. A troca do nome na paleta não altera a classificação clínica de referência. O ciclo de teste passa por vermelho, amarelo, verde, azul e apagado; exige firmware RGB v2 e nova gravação para chegar à placa.

O app e as APIs rejeitam novos comandos `orange`. O decodificador ainda aceita uma leitura legada nessa cor para preservar o estado realmente reportado, exibido como `Laranja (legado)`, sem botão de seleção nem conversão silenciosa para amarelo. Registros antigos não são reescritos.

Não existe algoritmo de triagem, classificação automática de paciente, cronômetro clínico ou vínculo com prontuário. O app não define a prioridade por temperatura, gás ou outro sensor. A validação clínica não faz parte desta implementação.

O alerta de gás é independente: reconhecer gás não muda a cor, e alterar a cor não reconhece ou resolve gás. Controle depende de `indicator: control`; leitura, de `indicator: read` ou control. O comando é `{ "kind": "indicator", "color": "blue" }` dentro do envelope de comandos documentado na [API](api/README.md).

No Node-RED, a cor representa estado virtual e reinicia com o processo; não há LED RGB físico integrado por essa cadeia ainda. A capacidade `manchesterSimulatedOnly: true` descreve essa limitação. Não remover essa indicação técnica para aparentar integração concluída.

O teste físico atual usa outro fluxo de bancada UDP e ACKs do ESP32. A mudança não conecta esse fluxo ao app automaticamente. Reiniciar o Node-RED após atualizar o módulo simulador para carregar a validação de quatro cores.

**TIRE PRINT DESTA PARTE:** quatro botões de cor e ação de apagar no app; botão laranja ausente. **MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** ciclo de quatro cores no RGB e confirmação dos comandos, distinguindo a bancada física do simulador do aplicativo. Paleta nova e APK precisam de validação própria.

Fonte primária para as cores: [Grupo Brasileiro de Classificação de Risco — nota técnica de julho de 2024](https://www.gbcr.org.br/wp-content/uploads/2024/07/Nota-Tecnica-GBCR-Pais-preocupados-mal-estar.pdf). A seleção de cor no aplicativo não substitui os protocolos e formação profissional exigidos para classificação clínica.
