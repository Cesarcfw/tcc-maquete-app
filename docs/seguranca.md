# Segurança e limites operacionais

Modelo proporcional ao cenário local atual. Não há avaliação de conformidade clínica, auditoria externa ou teste de invasão documentado. [Relato privado](../SECURITY.md).

## Ativos e fronteiras

Ativos: senhas/credenciais de conta, sessões, concessões, segredo de autenticação, cadastro de ambientes, histórico, comandos e configuração de luz. Fronteiras: dispositivo cliente ↔ LAN/backend; backend ↔ Node-RED; processo ↔ arquivos locais; desenvolvimento ↔ GitHub/EAS/Vercel.

| Ameaça | Proteção implementada | Limite/ação necessária |
| --- | --- | --- |
| Acesso sem login ou função indevida | Sessão e concessões no servidor; telemetria filtrada | Não depender só de esconder controle na tela |
| Tentativas de senha | Better Auth: limitação persistida; sign-in 5/60 s, regra geral auth 60/60 s | Não é rate limit global de toda a API de negócio |
| Cabeçalho falso de IP | Servidor sobrescreve chave do rate limit com socket remoto | Proxy/túnel exige revisar obtenção de IP e agregação de clientes |
| Leitura de credenciais na rede | Nenhuma criptografia no cenário HTTP LAN | Usar rede privada de ensaio; definir TLS antes de exposição ampliada |
| Contorno do backend | Node-RED ligado somente em loopback | Endpoints do Node-RED não autenticam; não expor 1880 em LAN/internet |
| SQL injection | Queries do domínio com parâmetros | Não torna seguro editar manualmente esquema/dados durante execução |
| Origem web inesperada | Allowlist CORS + rejeição explícita de Origin desconhecida | CORS não é autenticação e não limita um cliente nativo/CLI |
| Roubo de sessão no armazenamento de preferências | Token em memória; whitelist de campos persistidos | Memória, cookie web e tráfego ainda são sensíveis |
| Comando falso/repetido | Validação, concessão e ID persistido; correlação do ACK | Sem autenticação criptográfica de dispositivo ou garantia exatamente uma vez |
| Telemetria incorreta | Checagem de quarto/dispositivo/fonte e idade | Validação upstream parcial; sem comprovação de sensor/calibração |
| Alteração de arquivo/backup | Exclusão de Git e separação operacional | SQLite/JSON/backup não são criptografados pelo app; proteger conta/ACL/disco |
| Exposição de detalhe interno | Erros 5xx genéricos, no-store e nosniff | Não há logging centralizado nem política completa de cabeçalhos CSP no backend |

## Sessões e privilégios

Sessão configurada para 8 h; updateAge 30 min. Cookies seguros dependem de base pública HTTPS. Signup público desabilitado; admin inicial criado localmente. Bloqueio de usuário e redefinição administrativa removem sessões. Admin não ignora concessões operacionais por quarto.

Senha é processada pelo Better Auth, sem implementação própria de criptografia. Não adicionar senha/token/secret à documentação, console de captura, Issues ou Trello. Auditoria registra ações, não o conteúdo da senha.

## Superfície de implantação

O preview Android permite tráfego HTTP local por plugin condicionado ao perfil EAS. Essa configuração atende ao ensaio atual e deve ser revista para uma distribuição mais ampla. Um frontend HTTPS no Vercel não torna um backend HTTP privado acessível/seguro: há alcance de rede e políticas de conteúdo misto/acesso à rede local do navegador.

Não publicar editor Node-RED, SQLite, `auth-secret`, backups ou serviço administrativo por encaminhamento indiscriminado de portas. Os arquivos são ignorados no Git, mas ignore não remove segredos já publicados em commits anteriores. Se ocorrer exposição, revogar o segredo/credencial no serviço responsável e tratar o histórico conforme o incidente.

## Dados e disponibilidade

O app atual não implementa prontuário e não deve receber dados reais de pacientes nos ensaios. Nomes/emails de usuários e logs ainda podem ser dados pessoais; usar contas fictícias nas evidências e acesso restrito aos backups. Não há política automática de retenção/anonimização.

Uma máquina e um conjunto de arquivos não oferecem alta disponibilidade. O histórico depende das consultas feitas ao backend; app fechado ou backend inacessível pode significar ausência de eventos. Não usar esta maquete como sistema de alarme de vida ou instrumento de decisão clínica.

## Antes de ampliar o acesso

Criar requisitos e implementar TLS, proteção/autenticação de dispositivo e Node-RED, política de segredos/backup/retenção, coleta autônoma se necessária, monitoramento e testes de recuperação. Essas ações são pendências técnicas, não funcionalidades já entregues.
