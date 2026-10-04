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

- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_URL` em produção e estes IDs de preços recorrentes ativos:
	- `STRIPE_PRICE_ESSENCIAL` e `STRIPE_PRICE_ESSENCIAL_ANNUAL`
	- `STRIPE_PRICE_PRO` e `STRIPE_PRICE_PRO_ANNUAL`
	- `STRIPE_PRICE_EXPERT` e `STRIPE_PRICE_EXPERT_ANNUAL`
- Evolution API: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` e `EVOLUTION_INSTANCE_NAME`.

### Evolution local com Docker Desktop

Com o Docker Desktop iniciado em modo Linux, execute na raiz do projeto:

```bash
npm run evolution:setup
npm run evolution:up
npm run evolution:status
```

O script configura `.env.local` para `http://localhost:8080`, substitui chaves de exemplo ou com menos de 32 caracteres e gera a senha do banco quando ausente. Nas próximas execuções, preserva as credenciais válidas. O arquivo permanece ignorado pelo Git. A instalação usa Evolution API `v2.3.7`, PostgreSQL 15 e Redis 7, com volumes persistentes e verificações de saúde. A API fica acessível apenas nesta máquina; PostgreSQL e Redis não publicam portas no Windows.

Acesse `http://localhost:8080/manager` e use `EVOLUTION_API_KEY` de `.env.local` como chave global. No FlowPromos, inicie ou reinicie `npm run dev`, abra `/dashboard/whatsapp` e conecte pelo QR Code. Cada usuário recebe sua própria instância. O prefixo `EVOLUTION_INSTANCE_NAME` não representa uma sessão compartilhada.

```bash
npm run evolution:logs
npm run evolution:down
npm run evolution:up
```

`evolution:down` para os serviços sem apagar os volumes. Não use `down -v` se quiser manter sessões e dados. Mantenha `EVOLUTION_POSTGRES_PASSWORD` após a primeira inicialização: alterar apenas essa variável não troca a senha do banco já criado.

Esta configuração é local. Um FlowPromos hospedado na Vercel precisa de uma Evolution acessível por HTTPS; `localhost` aponta para o próprio servidor hospedado, não para seu computador.

Referência: [repositório oficial da Evolution API](https://github.com/evolution-foundation/evolution-api).

### Migração dos templates de mensagens

Antes de usar /dashboard/mensagens, execute supabase/migrations/0003_workspace_templates.sql no SQL Editor do Supabase. Essa migração cria a tabela de templates com acesso restrito ao dono da conta.

### Jornada de compra

1. `/` apresenta a plataforma e leva à página `/planos`.
2. `/planos` busca os valores e Price IDs recorrentes na API do Stripe.
3. A seleção do ciclo/plano leva a `/cadastro`, que cria o usuário no Supabase Auth e abre o Checkout Stripe.
4. Após o pagamento, `/checkout/sucesso` confirma a sessão; o webhook `/api/stripe/webhook` registra a assinatura e ativa o plano no perfil. Renovações e cancelamentos são sincronizados pelos eventos de assinatura.
5. O cliente retorna a `/login` para entrar no dashboard.

No Stripe Dashboard, crie produtos e preços recorrentes mensais/anuais e copie cada Price ID (`price_...`) para a variável correspondente. A chave `STRIPE_SECRET_KEY` deve ser válida e estar no mesmo modo (teste ou produção) que os Price IDs. Cadastre `https://SEU-DOMINIO/api/stripe/webhook` como endpoint e habilite `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated` e `customer.subscription.deleted`; copie o signing secret (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`. Para testes locais, use o Stripe CLI com `stripe listen --forward-to localhost:3000/api/stripe/webhook` (ajuste a porta conforme o terminal do Next.js) e coloque o `whsec_...` gerado no `.env.local`.

O schema já reserva `plans`, `subscriptions`, `subscription_changes`, `whatsapp_sessions`, `integration_connections` e `dispatches`. `/api/health` informa quais credenciais estão presentes sem expor seus valores. A comunicação real com Stripe e Evolution requer as chaves, URLs, preços e configuração de webhook da sua conta.

## Verificações

```bash
npm run typecheck
npm run build
```
