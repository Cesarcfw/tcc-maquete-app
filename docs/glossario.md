# Glossário

| Termo | Sentido neste projeto |
| --- | --- |
| ACK | Confirmação correlacionada a um commandId; hoje aplicação no simulador |
| ADC | Valor bruto de conversão analógico-digital; 12 bits no payload virtual, 0–4095 |
| Ambiente/quarto | Cadastro lógico com id, leito, ala, dispositivo e estado ativo |
| Backend | Serviço autenticado Node.js que aplica concessões e consulta Node-RED |
| Bearer | Token de sessão enviado no cabeçalho Authorization |
| CORS | Política de acesso entre origens no navegador; não é autenticação |
| ESP virtual | Modelo executado no Node-RED; não placa física conectada |
| Grant/concessão | Nível none/read/control para usuário, quarto e grupo |
| Histórico | Eventos de auditoria/transição, não todas as amostras de sensores |
| Idempotência | Repetição de comando já confirmado com mesma chave/corpo retorna resposta persistida no backend |
| LDR | Sensor de luminosidade; leitura virtual mantida, sem comandar a agenda atual |
| Manchester | Referência de cores de prioridade; seleção manual nesta maquete |
| Metro | Servidor de desenvolvimento do bundle Expo/React Native |
| Polling | Consultas periódicas HTTP, aproximadamente a cada 2 segundos no painel |
| Redaction | Filtragem de campos da telemetria conforme concessões |
| Stale | Leitura desatualizada; backend usa idade de pelo menos 10 segundos |
| Telemetria | Dados reportados pelo serviço de dispositivo |
| WAL | Modo de journal SQLite usado no banco local |
