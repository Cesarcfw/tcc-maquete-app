# Autenticação, contas e concessões

Referência: backend atual, não o protótipo de contas locais da v0.3. [Modelo de dados](modelo-dados.md) · [API](api/README.md) · [segurança](seguranca.md).

## Ciclo de vida

`npm --prefix backend run setup` cria a primeira conta admin e o Quarto 01 em instalação vazia. Não existe senha padrão nem cadastro público habilitado no fluxo atual. Depois, o admin cria usuários comuns pela aplicação. A sessão de bootstrap é descartada; é necessário fazer login.

Better Auth processa email/senha e sessão, com expiração configurada em 8 horas e updateAge de 30 minutos. O app lê o cabeçalho `set-auth-token` e o envia como Bearer. O web permite cookies; o nativo usa `credentials: omit`. A interface não grava credenciais/token nas preferências e pede novo login ao recarregar/reabrir.

O backend verifica sessão, existência e bloqueio da conta por requisição. Logout chama o serviço de autenticação; falha nessa chamada é apresentada em vez de presumir revogação concluída.

## Papéis e concessões

Admin gerencia usuários/ambientes, mas não recebe controle de dispositivo automaticamente em qualquer quarto. As funções operacionais dependem de concessões explícitas para o quarto. O bootstrap concede acesso completo permitido ao admin inicial no Quarto 01.

| Grupo | none | read | control |
| --- | --- | --- | --- |
| light | Sem acesso | Consultar luz/agenda | Consultar e alterar luz/agenda |
| sensors | Sem acesso | Consultar sensores e reconhecer gás | Não permitido |
| indicator | Sem acesso | Consultar indicador | Consultar e alterar cor |
| history | Sem acesso | Consultar eventos | Não permitido |

Reconhecer gás é autorizado por `sensors: read` no código atual; não remove detecção nem altera Manchester. Revise essa decisão se for necessário separar permissão de reconhecimento.

Uma atualização de concessões informa os quatro grupos de uma vez; é validada e gravada em transação. Ausência de concessão significa none. Telemetria é filtrada por grupo no servidor; usuário sem acesso ao quarto recebe 404 para não revelar sua existência. Um usuário apenas com history pode consultar histórico, mas não telemetria. Quarto inativo retorna 409 para funções operacionais.

## Administração de contas

- Criar: nome/email e senha de 12–128 caracteres, papel user.
- Desativar usuário comum: bloqueia conta e remove sessões. Não permite bloquear o próprio admin ou outro admin por essa rota.
- Reativar: remove bloqueio; não restaura sessões anteriores.
- Redefinir senha de usuário comum: exige admin, remove sessões e registra ação. Admin altera a própria senha pela conta.
- Rotas nativas `/api/auth/admin` são bloqueadas; a aplicação usa rotas administrativas próprias com validação e auditoria.

Não há fluxo de email transacional, recuperação por link ou verificação de email configurados. Não inventar um procedimento de “esqueci minha senha”: a recuperação atual de usuário comum depende do administrador. Recuperação de acesso do admin não tem automação própria; preservar backup e não editar hashes manualmente.

## Limites da persistência

SQLite guarda conta, concessões, ambientes, comandos e eventos. Preferências do dispositivo guardam endereço/tema/movimento, não sessão. Luz do serviço é persistida em arquivo separado. Veja [instalação](instalacao-configuracao.md) para variáveis e [operação](operacao.md) antes de transferir ao notebook.

**TIRE PRINT DESTA PARTE:** lista de usuários e concessões com dados fictícios, sem senhas/tokens.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** usuário com leitura tenta controlar e é bloqueado; admin concede controle; novo acesso executa função; desativação invalida a sessão.
