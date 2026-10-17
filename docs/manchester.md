# Indicador externo e Manchester

O aplicativo permite selecionar manualmente **vermelho, laranja, amarelo, verde, azul** e apagar (`off`). Essas cinco cores seguem a referência do Sistema Manchester; no SAMAHI são uma representação visual operada pelo usuário autorizado para exemplificar o indicador externo da maquete.

Não existe algoritmo de triagem, classificação automática de paciente, cronômetro clínico ou vínculo com prontuário. O app não define a prioridade por temperatura, gás ou outro sensor. A validação clínica não faz parte desta implementação.

O alerta de gás é independente: reconhecer gás não muda a cor, e alterar a cor não reconhece ou resolve gás. Controle depende de `indicator: control`; leitura, de `indicator: read` ou control. O comando é `{ "kind": "indicator", "color": "blue" }` dentro do envelope de comandos documentado na [API](api/README.md).

No Node-RED, a cor representa estado virtual e reinicia com o processo; não há LED RGB físico integrado por essa cadeia ainda. A capacidade `manchesterSimulatedOnly: true` descreve essa limitação. Não remover essa indicação técnica para aparentar integração concluída.

Fonte primária para as cores: [Grupo Brasileiro de Classificação de Risco — nota técnica de julho de 2024](https://www.gbcr.org.br/wp-content/uploads/2024/07/Nota-Tecnica-GBCR-Pais-preocupados-mal-estar.pdf). A seleção de cor no aplicativo não substitui os protocolos e formação profissional exigidos para classificação clínica.
