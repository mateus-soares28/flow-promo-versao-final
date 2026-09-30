# Deploy e integrações FlowPromos

## 1. Banco Supabase

1. Faça backup do projeto Supabase antes de migrar banco já usado.
2. No SQL Editor, execute `supabase/migrations/0002_lock_profiles_and_seed_plans.sql` depois da migração `0001`.
3. Migração 0002 remove atualização direta de perfis por usuários autenticados e cria os três IDs de plano usados pelo checkout.
4. Valores e limites comerciais em `plans` ficam como zero provisório; defina-os antes de implementar cobrança por limite. Preços exibidos no checkout vêm dos Price IDs Stripe.
5. Confirme `Site URL` e `Redirect URLs` em Authentication → URL Configuration. Inclua domínio de produção e URLs de preview necessárias.

## 2. Vercel

Importe o repositório como projeto Next.js. Configure variáveis em Settings → Environment Variables, para Production e Preview conforme uso:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; nunca prefixar com `NEXT_PUBLIC_`)
- `APP_URL` (domínio canônico HTTPS, sem barra final)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e seis variáveis `STRIPE_PRICE_*`
- `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME`
- `CRON_SECRET` para proteger processamento da fila

Use chaves Stripe de teste no Preview e de produção no Production. Depois de alterar variável, faça novo deploy: deployments existentes não recebem novos valores.

## 3. Stripe

Veja passo a passo de cadastro de produtos, preços e webhook abaixo. O endpoint de produção é `https://SEU-DOMINIO/api/stripe/webhook`.

IDs de preço exigidos:

| Plano | Mensal | Anual |
| --- | --- | --- |
| Essencial | `STRIPE_PRICE_ESSENCIAL` | `STRIPE_PRICE_ESSENCIAL_ANNUAL` |
| Pro | `STRIPE_PRICE_PRO` | `STRIPE_PRICE_PRO_ANNUAL` |
| Expert | `STRIPE_PRICE_EXPERT` | `STRIPE_PRICE_EXPERT_ANNUAL` |

Cada preço deve ser recorrente, BRL e compatível com ciclo mensal/anual. O app lê valor e Price ID direto do Stripe.

## 4. Evolution API

`EVOLUTION_INSTANCE_NAME` funciona como prefixo para nomes de instância por usuário; não é nome de uma única sessão compartilhada. Cada conta recebe uma instância própria, criada pela API com o UUID do usuário. Chave mestra da Evolution fica só no servidor.

Painel `/dashboard/whatsapp` cria ou reconecta a instância, exibe QR e consulta conexão. Teste com número controlado. A fila exige instância conectada e grupo cadastrado com JID `...@g.us`.

## 5. Fila de envios

O worker está em `GET /api/cron/dispatches` e exige `Authorization: Bearer <CRON_SECRET>`. Configure Vercel Cron ou scheduler externo para chamar endpoint. Cron por minuto na Vercel exige plano Pro/Enterprise; Hobby aceita no máximo uma execução diária. Para horário previsível e disparos agendados, use Pro ou scheduler externo com frequência compatível.

## 6. Administrador

Depois que variáveis do Supabase existirem localmente e migrações estiverem aplicadas, rode `npm run admin:create` com credenciais fortes de administrador. Nunca envie `.env.local` ao Git.
