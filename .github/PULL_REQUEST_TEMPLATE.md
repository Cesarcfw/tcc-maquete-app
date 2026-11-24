## Alteração e finalidade

Descrever comportamento, requisito/cartão e motivo. Informar base e ordem se o PR depender de outro PR.

## Verificação

| Verificação | Resultado/ambiente ou motivo de não execução |
| --- | --- |
| lint / typecheck | |
| testes domínio / backend | |
| exportação web | |
| OpenAPI (se contrato alterado) | |
| ensaio web / Expo Go / APK | |
| ESP físico / rede / notebook, quando aplicável | |

## Documentação e evidências

- [ ] CHANGELOG e guias atuais correspondem ao código.
- [ ] Contrato, configuração, dados/migração e ADR atualizados quando aplicável.
- [ ] Notion/Trello atualizados com links e estado real.
- [ ] Prints/vídeos identificam versão, ambiente e origem de dados.
- [ ] Segredos, bancos, binários privados do ESP e o pacote do notebook ficaram fora do PR.

## Compatibilidade, riscos e recuperação

Descrever efeito sobre banco/arquivo persistido, clientes existentes, distribuição instalada e procedimento de recuperação. Separar resultado observado de pendência. Identificar explicitamente o que usa serviço virtual e o que foi testado em hardware/aparelho real.
