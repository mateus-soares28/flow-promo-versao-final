# FlowPromos

Plataforma para organizar promoções de afiliados, segmentar grupos e preparar publicações no WhatsApp.

## Desenvolvimento local

Requisitos: Node.js 20.6+ e npm.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

O Next.js não abre o navegador automaticamente. Acesse a URL informada no terminal (normalmente `http://localhost:3000`; se ocupada, o Next escolhe outra porta). Sem credenciais Supabase, as páginas públicas e `/api/health` continuam disponíveis; login, dashboard e administração dependem do Supabase.

## Supabase e administrador

1. Crie um projeto Supabase e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `.env.local`.
2. Execute `supabase/migrations/0001_initial_schema.sql` no SQL Editor do projeto. A migração inclui perfis, ofertas, grupos, sessões WhatsApp, disparos, planos e políticas RLS.
3. Preencha `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `ADMIN_NAME` em `.env.local`. Use uma senha forte e mantenha o arquivo fora do Git.
4. Execute `npm run admin:create`. O comando cria ou atualiza o usuário no Supabase Auth e concede o papel `admin` em `public.profiles`.

O script requer Node.js 20.6 ou superior por usar `--env-file`. A chave `SUPABASE_SERVICE_ROLE_KEY` só é usada no script server-side e nunca deve receber o prefixo `NEXT_PUBLIC_`.

## Stripe e WhatsApp

Configure no servidor, quando as contas estiverem disponíveis:

- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e IDs de preço `STRIPE_PRICE_*`.
- Evolution API: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` e `EVOLUTION_INSTANCE_NAME`.

O schema já reserva `plans`, `subscriptions`, `subscription_changes`, `whatsapp_sessions`, `integration_connections` e `dispatches`. `/api/health` informa quais credenciais estão presentes sem expor seus valores. A comunicação real com Stripe e Evolution requer as chaves, URLs e configuração de webhook da sua conta; não são simuladas pelo modo local.

## Verificações

```bash
npm run typecheck
npm run build
```
