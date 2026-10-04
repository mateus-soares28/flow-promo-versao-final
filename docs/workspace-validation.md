# Validação do workspace — 4 de outubro de 2026

As correções foram validadas com o build de produção local, conectado ao Supabase configurado em `.env.local`.

## Correções

- O formulário de disparos consulta os campos completos da oferta e os modelos de mensagem em paralelo. Foram corrigidos textos quebrados e a importação duplicada em Mensagens.
- A verificação periódica do WhatsApp usa uma rota HTTP autenticada, com validação de origem, em vez de ocupar a fila de Server Actions do navegador. Mudanças de estado não iniciam uma segunda consulta imediata.
- O middleware deixa de consultar o perfil que já é validado nas páginas e ações. A página pública inicial e as APIs não executam autenticação duplicada no middleware. As verificações de usuário, plano e administrador permanecem no servidor.
- Links do workspace mostram o carregamento durante a navegação. Botões de formulário usam o componente de envio existente para indicar progresso e bloquear cliques repetidos enquanto a ação está pendente.
- Agendamentos rejeitam datas inválidas ou passadas e usam o horário de Brasília, inclusive na exibição da fila. Modelos preservam valores literais que contenham `$`.
- A migração de modelos pode ser reaplicada em uma transação. Mateus confirmou a execução com sucesso no Supabase; leitura e gravação de modelos foram verificadas pelo aplicativo.

## Verificações realizadas

- `npm run build`: compilação, lint e verificação de tipos aprovados.
- `npm run typecheck` e `npm run lint`: aprovados.
- `npm test`: quatro testes aprovados, cobrindo envio imediato, fuso horário, datas inválidas/passadas e ano bissexto.
- Navegação por 11 links do menu, alternância de tema e abertura/fechamento do modal WhatsApp: aprovadas, sem erros de JavaScript durante o teste.
- Menu mobile em 390 × 844: abertura, navegação, fechamento e ausência de rolagem horizontal verificados.
- Modelo salvo pela interface e aplicado ao disparo com preço original/final, desconto, cupom e link corretos.
- Botão de disparo bloqueado sem grupo. Com grupo QA, o agendamento de `01/01/2099 12:00` foi persistido como `2099-01-01T15:00:00Z`, com status `pending`.
- Nenhuma mensagem real foi enviada. Oferta, grupo, modelo e disparo temporários foram removidos após a verificação.
- Acesso anônimo a `/dashboard` e `/admin` redireciona para login. Consulta anônima ao WhatsApp é recusada; origem externa recebe HTTP 403.

## Medição local

Em uma rodada no build de produção, páginas com consultas levaram aproximadamente 0,87–1,61 s para exibir o título após o clique. Rotas já em cache levaram 41–50 ms. O teste simulou uma consulta WhatsApp de 5 s; a primeira navegação concluiu em 1,38 s, sem aguardar essa consulta.

Esses números incluem a rede até o Supabase e não representam uma comparação antes/depois nem uma medição do site publicado. Para disponibilizar as alterações online, é necessário publicar o novo build.

A separação das consultas periódicas segue a orientação do Next.js sobre [Server Actions sequenciais](https://nextjs.org/docs/app/getting-started/mutating-data). O carregamento usa os recursos de [navegação e cache do Next.js 14](https://nextjs.org/docs/14/app/building-your-application/routing/linking-and-navigating).
