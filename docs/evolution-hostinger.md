# Evolution API na Hostinger: primeiro acesso

Este guia usa o Docker Manager da Hostinger com o projeto Traefik descrito na [documentação da Hostinger](https://www.hostinger.com/support/connecting-multiple-docker-compose-projects-using-traefik-in-hostinger-docker-manager/). O FlowPromos está publicado em `https://flow-promo-versao-final.vercel.app/`. O VPS hospeda apenas a Evolution API, PostgreSQL e Redis.

## 1. Conferir o VPS

1. No hPanel, abra **VPS → Gerenciar → Docker Manager → Projects**.
2. Confirme que o Docker Manager está disponível. Caso não esteja, confira o sistema instalado no VPS antes de alterar o servidor.
3. Confira o projeto Traefik em execução. Neste VPS, o Traefik está em modo de rede `host`, com Docker provider, entrypoint `websecure` e resolvedor de certificado `letsencrypt`. Não existe rede `traefik-proxy`; por isso o Compose da Evolution usa a rede bridge padrão do próprio projeto. Não crie a rede manualmente.
4. Na seção de segurança do VPS, permita entrada nas portas 80 e 443 para HTTPS e preserve o acesso SSH. Não abra 5432, 6379 nem 8080 para a internet.

## 2. Escolher o endereço da Evolution

Você ainda não precisa comprar um domínio. Para este VPS, comece com `evolution.srv2054010.hstgr.cloud`. Esse nome já resolveu para o mesmo IPv4 do hostname `srv2054010.hstgr.cloud` durante a preparação deste guia. Antes da implantação, confira em **VPS → Visão geral** se o IPv4 mostrado é o mesmo do hostname. O DNS não é configurado no campo **Gerenciador de DNS → Adicionar domínio** do VPS.

A [Hostinger documenta hostnames temporários `*.hstgr.cloud` para projetos do catálogo Docker](https://www.hostinger.com/support/how-to-change-the-domain-of-a-docker-project/) e a [integração do Traefik com projetos Compose](https://www.hostinger.com/support/connecting-multiple-docker-compose-projects-using-traefik-in-hostinger-docker-manager/). O endereço `evolution.srv2054010.hstgr.cloud` para este Compose manual é uma adaptação dessas instruções; confirme o certificado HTTPS após o deploy, antes de configurá-lo na Vercel.

Quando tiver um domínio próprio, você poderá criar um registro `A` chamado `evolution` no DNS desse domínio, apontá-lo ao IPv4 do VPS e atualizar `EVOLUTION_DOMAIN` e `EVOLUTION_API_URL`. O endereço `flow-promo-versao-final.vercel.app` pertence à Vercel; você não pode criar um subdomínio dentro dele.

## 3. Gerar credenciais do VPS

No PowerShell do computador, execute duas vezes este comando. Copie cada resultado para um gerenciador de senhas: o primeiro será `EVOLUTION_API_KEY`; o segundo, `EVOLUTION_POSTGRES_PASSWORD`.

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Use 64 caracteres hexadecimais. Esse formato também evita caracteres que precisariam de tratamento especial na URL de conexão do PostgreSQL. Não publique esses valores no Git nem envie em capturas de tela.

## 4. Implantar a Evolution

1. Abra **Docker Manager → Projects → Compose → Compose manually**.
2. Use o nome `flowpromos-evolution`.
3. Abra [compose.evolution.hostinger.yaml](../compose.evolution.hostinger.yaml) neste repositório e copie o conteúdo para o editor YAML.
4. Na tela do projeto, expanda **Environment variables (.env)** e adicione cada chave com **+ Environment**. Essas variáveis pertencem ao projeto Docker Compose: não basta colocá-las em outro painel de ambiente ou apenas copiá-las como texto fora do editor.
   - `EVOLUTION_DOMAIN`: `evolution.srv2054010.hstgr.cloud`, sem `https://`.
   - `EVOLUTION_API_KEY`: primeiro valor gerado no passo 3.
   - `EVOLUTION_POSTGRES_PASSWORD`: segundo valor gerado no passo 3.
5. Confira as três chaves cadastradas, sem compartilhar os valores. Clique em **Save and deploy** ou **Deploy**, conforme o botão mostrado. O Docker Compose criará automaticamente a rede bridge do projeto; o Traefik no modo `host` acessará a API pelo endereço interno do container.
6. Aguarde `api`, `postgres` e `redis` ficarem ativos. Confira os logs da API se algum serviço falhar.

Se o projeto ficar em **Criado, 0 contêiner** e `/docker/flowpromos-evolution/.build.log` disser `required variable ... is missing a value`, volte a **Gerenciar → Environment variables (.env)** e preencha as três chaves ali antes de implantar novamente. Não crie outro projeto.

O Compose de produção preserva os volumes e mantém PostgreSQL e Redis sem portas públicas. A API também não publica a porta 8080 no VPS; o Traefik recebe o tráfego HTTPS e a acessa pela rede bridge. O `compose.evolution.yaml` da raiz continua reservado para uso local.

## 5. Conferir domínio e API

1. Abra `https://evolution.srv2054010.hstgr.cloud` no navegador. O certificado deve estar válido.
2. Abra `https://evolution.srv2054010.hstgr.cloud/manager` e entre com a chave global `EVOLUTION_API_KEY` do VPS.
3. Se aparecer erro de certificado ou página não encontrada, confira DNS, estado do Traefik, estado dos três contêineres e logs do projeto antes de prosseguir.

Atrás do Traefik, o JSON da rota `/` pode mostrar o campo `manager` com `http://`, porque a Evolution monta esse campo com o protocolo percebido na conexão interna. Use sempre o endereço `https://` digitado no navegador. Se o navegador mostrar **Não seguro** após a implantação, abra uma janela anônima e digite explicitamente o endereço HTTPS; não informe a chave enquanto houver aviso de certificado. O HTTPS público foi verificado com resposta 200 e redirecionamento HTTP 308 em 12/10/2026.

## 6. Apontar o FlowPromos para o VPS

Na Vercel, abra o projeto **flow-promo-versao-final → Settings → Environment Variables**. Cadastre estas variáveis para **Production**:

```dotenv
EVOLUTION_API_URL=https://evolution.srv2054010.hstgr.cloud
EVOLUTION_API_KEY=CHAVE_DO_VPS
EVOLUTION_INSTANCE_NAME=flowpromos
```

Use o subdomínio e a chave reais. `EVOLUTION_API_KEY` não pode ter o prefixo `NEXT_PUBLIC_`. Salve as variáveis e faça um novo deploy em **Deployments**; o deploy atual não recebe novas variáveis automaticamente.

Para testar também com o Next.js no computador, altere somente estas linhas em `.env.local`:

```dotenv
EVOLUTION_API_URL=https://evolution.srv2054010.hstgr.cloud
EVOLUTION_API_KEY=CHAVE_DO_VPS
EVOLUTION_INSTANCE_NAME=flowpromos
```

Preserve `EVOLUTION_POSTGRES_PASSWORD` local: ela pertence ao banco Docker já inicializado no computador. Depois, reinicie `npm run dev` para o Next.js ler os novos valores. Não execute `npm run evolution:setup` após apontar `EVOLUTION_API_URL` para um serviço remoto; esse script é apenas para instalação local.

## 7. Mostrar o QR Code e conectar

1. Entre em `https://flow-promo-versao-final.vercel.app/` com conta de administrador ou usuário com plano ativo e e-mail confirmado.
2. Abra **Dashboard → WhatsApp**. Clique em **Conectar WhatsApp**.
3. O FlowPromos cria uma instância Evolution própria para essa conta e mostra o QR Code. Aguarde alguns segundos se a sessão ainda estiver iniciando.
4. No telefone, abra **WhatsApp → Aparelhos conectados → Conectar aparelho** e leia o QR Code.
5. Volte ao FlowPromos e clique em **Verificar conexão**. O estado deve mudar para **Conectado**.

O código atual consulta o estado da conexão periodicamente. Não precisa configurar webhook Evolution para exibir o QR Code. Depois da conexão, use **Dashboard → Grupos → Sincronizar WhatsApp** para carregar grupos da conta.

Se uma sessão foi criada antes na Evolution local e já existe na tabela `whatsapp_sessions` do Supabase, a nova Evolution pode não encontrar a instância. Nesse caso, preserve os volumes e verifique a sessão antes de tentar reconectar; a migração ou recriação da instância exige um procedimento separado.

## 8. Depois do primeiro QR Code

Configure backup dos volumes `postgres` e `instances` antes de depender do serviço em produção. Para executar disparos agendados, configure `CRON_SECRET` e um agendador que chame `/api/cron/dispatches`. Essas etapas não são necessárias para a primeira leitura do QR Code.
