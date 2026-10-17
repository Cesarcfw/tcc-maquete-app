# Publicação web no Vercel

O Vercel serve a exportação web estática do Expo; o backend local, o banco SQLite e Node-RED continuam sendo serviços separados. A existência de uma URL pública não comprova qual commit está implantado nem conectividade com os dados locais.

## Fluxo de publicação

1. Revisar o PR, dependências e variáveis públicas. Configurações de build/deploy ficam em `vercel.json` e no projeto Vercel vinculado.
2. Executar `npm run export:web` e conferir `dist/`. A exportação não publica automaticamente.
3. Integrar a branch autorizada para o deploy vinculado ou usar a CLI autenticada conforme o fluxo da equipe. Não incluir `backend/data`, backups, segredos ou tokens no bundle.
4. Conferir o commit da implantação, abrir login e validar endereço/conta/quarto no cenário de rede de destino. Uma página de login carregada não valida a cadeia completa.

URL utilizada no projeto: [tcc-maquete-app.vercel.app](https://tcc-maquete-app.vercel.app). A versão efetivamente publicada precisa ser conferida no deployment; este guia não a presume.

## Conexão ao backend

O cliente recebe `EXPO_PUBLIC_BACKEND_URL` como endereço inicial, ou usa o padrão local. O usuário também pode configurar a conexão no login; preferência salva tem prioridade. Nunca usar essa variável para senha/secret.

Uma página HTTPS tentando acessar API HTTP na LAN pode enfrentar conteúdo misto, política de acesso à rede local, CORS e ausência de rota até o computador. Em outro local, o visitante não acessa a rede privada do desenvolvedor só porque abriu o site. Não existe túnel público configurado como parte desta arquitetura.

Para apresentação local, web servido no notebook e APK no mesmo Wi-Fi seguem o cenário documentado. Se for necessário web público com backend remoto, projetar exposição HTTPS, autenticação e persistência compatíveis como etapa própria. Não mover o SQLite para um filesystem efêmero e presumir persistência equivalente.

## Atualizar e validar

Após deploy, registrar URL, commit e data. Conferir desktop e viewport móvel, tema, login, catálogo, controle com ACK e permissões. O cache de um navegador não serve como registro da versão implantada; comparar com os dados do deployment. Rollback de frontend não reverte o banco nem o Node-RED local.

Fontes: [Expo web](https://docs.expo.dev/workflow/web/), [Vercel deployments](https://vercel.com/docs/deployments).
