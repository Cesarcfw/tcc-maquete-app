# Publicação web no Vercel

## Preparação

PR #4 incorporado à main: commit 42e50bb. APK Android e web compartilham a versão de protótipo 0.3.0, com simulação e perfis fictícios.

Configuração versionada em vercel.json: framework Other (null), instalação npm ci, compilação npm run export:web, saída dist. A raiz do projeto é a raiz do repositório; não selecionar dist como diretório fonte.

.vercelignore exclui artefatos locais, APKs, documentação e capturas do envio pela CLI. .vercel/ ignorado por Git e EAS, para preservar arquivos locais de vinculação e ambiente.

Login concluído por César e conferido pela CLI: conta cesarcfw. Projeto criado no espaço ZB_TECH (zb-tech), plano Hobby, e conectado pela CLI ao repositório privado Cesarcfw/tcc-maquete-app. Nenhum plano pago contratado.

Endereço público: https://tcc-maquete-app.vercel.app. Deployment dpl_292gERAHdjVffBLKV9zR22vom1jh, estado READY. [Registro da publicação](https://vercel.com/zb-tech/tcc-maquete-app/292gERAHdjVffBLKV9zR22vom1jh). Publicação inicial realizada pela CLI a partir da main 42e50bb, com os arquivos de configuração locais da branch feat/publicacao-vercel. O Vercel atribuiu automaticamente a primeira publicação à produção, mesmo sem a opção --prod. Não houve etapa remota de prévia separada nesta primeira publicação; os testes e a exportação locais já haviam passado.

## Autenticar e publicar

Na pasta tcc-maquete-app, César executa:

```powershell
npx --yes vercel@latest login
```

Concluir a autenticação no navegador; nunca enviar token no chat ou adicioná-lo ao repositório. Conferir a conta e o projeto antes de publicar. O projeto atual pertence ao espaço zb-tech; manter main como referência de produção. Usar o plano existente e não contratar serviços pagos para esta etapa sem autorização.

Publicar uma prévia, conferir estado READY e inspecionar o app antes de disponibilizar o endereço final. Ao vincular GitHub, conceder acesso apenas ao repositório necessário. A configuração versionada precisa estar na main para valer nos próximos builds automáticos. Verificar se o endereço final abre também para um colega sem sessão Vercel; uma página de prévia protegida não comprova acesso externo.

## Evidências e conferência

**TIRE PRINT DESTA PARTE:** página publicada com endereço/versão, identificação dos dados simulados e layout no computador/celular; registrar URL e commit da publicação concluída.

**MOSTRE FUNCIONANDO EM VÍDEO OU GIF:** abrir pelo link em outro aparelho; alternar tema, controlar iluminação/intensidade e Manchester; simular gás, reconhecer, observar saída à direita e reabrir. Conferir que recarregar reinicia a sessão e que as alterações não são compartilhadas entre colegas. Hospedagem não implementa autenticação real, backend ou ESP32.

Validação remota: build concluído; requisição HTTPS sem cookies/autenticação retornou HTTP 200 e o documento do app. No navegador publicado, entrada como César, iluminação confirmada em 25%, injeção de gás, reconhecimento e retorno ao aplicativo conferidos. Layout de largura mobile é conferência no navegador; não comprova teste nativo ou físico no telefone. Tipos, oito testes de domínio e exportação web passaram na preparação.

Capturas da publicação: docs/capturas/v0.3.0-vercel-web.png e docs/capturas/v0.3.0-vercel-mobile.png. Os dados são locais a cada sessão; colegas não compartilham o mesmo estado. APK permanece uma distribuição separada pelo Expo. Teste pelos colegas e gravações ainda pendentes.

Para os próximos ciclos, abrir branch, criar PR e conferir a prévia automática; após merge na main, conferir a produção. A configuração deste registro deve ser incorporada à main pelo PR da branch feat/publicacao-vercel. Arquivos .vercel e .env.local gerados pelo vínculo são locais e ignorados; não adicionar tokens à documentação.

## Fontes

- [Vercel — configuração versionada](https://vercel.com/docs/project-configuration/vercel-json).
- [Vercel — integração Git](https://vercel.com/docs/git).
- [Vercel — configuração de build](https://vercel.com/docs/builds/configure-a-build).
- [Expo — exportação web](https://docs.expo.dev/deploy/web/).
