# Indicador externo — Protocolo de Manchester

Requisito esclarecido por César: as cores do indicador representam o Protocolo de Manchester no contexto hospitalar da maquete.

| Cor      | Prioridade    |
| -------- | ------------- |
| Vermelho | Emergente     |
| Laranja  | Muito urgente |
| Amarelo  | Urgente       |
| Verde    | Pouco urgente |
| Azul     | Não urgente   |

O aplicativo permite selecionar manualmente uma classificação já definida. Não calcula prioridade a partir dos sensores e não executa triagem. Desligado é somente o comando de apagar o indicador, fora das cinco categorias. Os sensores ambientais não determinam a classificação.

Fonte primária: [Grupo Brasileiro de Classificação de Risco — nota técnica, julho de 2024](https://www.gbcr.org.br/wp-content/uploads/2024/07/Nota-Tecnica-GBCR-Pais-preocupados-mal-estar.pdf). Consulta em 30/09/2026. A tabela de cores e prioridades foi parafraseada a partir da fonte; os controles e o comportamento simulado foram implementados para o projeto.

**TIRE PRINT DESTA PARTE:** indicador com as cinco opções e seus nomes de prioridade, exibindo também o aviso de simulação.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** selecionar cada uma das cinco cores, verificar a confirmação e depois apagar o indicador. Demonstrar que sensores e luz mantêm seus valores. Registrar como simulação até realizar a integração física.

As capturas da prévia anterior são históricas; não representam este ajuste. Android e execução no LED físico continuam pendentes.

Validação do ajuste: lint, TypeScript, os quatro testes de domínio e exportação web aprovados. No navegador, laranja e amarelo foram selecionados e confirmados, mantendo luz em 65% e sensores em 24,6 °C / 58%. Captura atual: capturas/v0.1.0-preview.3_manchester.jpg.
