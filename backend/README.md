# Backend local do SAMAHI

Node.js 24.15+; instalação: `npm ci --ignore-scripts`.

Primeira execução: `npm run setup` cria o administrador com senha digitada no terminal. Não há senha padrão. Depois: `npm start` (127.0.0.1:3001).

Node-RED continua em processo separado, por padrão 127.0.0.1:1880. O app tem o endereço do backend na tela de login. Para usar no PC: iniciar os dois servidores e o web do Expo na porta 8081.

`npm test`: teste HTTP integrado com SQLite temporário; não altera contas reais.

`npm run backup`: cópia consistente do banco e do segredo em backups/. Guardar em local privado.

Manual de implementação, tabelas, permissões, limites e transferência: [autenticação e persistência](../docs/autenticacao-persistencia-local.md).

Telefone e Expo Go: abrir Iniciar-App-Integrado.cmd na raiz. Usa este banco, servidor de teste na rede em 3002 e Expo em 8082. [Roteiro de validação completa](../docs/teste-app-integrado.md). Uso local HTTP de ensaio; HTTPS continua pendente para ampliar o acesso.
