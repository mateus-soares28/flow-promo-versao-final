# Página inicial FlowPromos

## Objetivo e contexto

Página de vendas para afiliados que organizam promoções e publicam em grupos de WhatsApp. Conversão principal: escolha de plano, cadastro e assinatura. Clientes existentes têm acesso separado pelo botão Entrar. Origem do tráfego, conversão atual e volume de visitantes não foram fornecidos; o conteúdo atende visitantes que ainda não conhecem o produto.

Aplicação das skills: ui-ux-pro-max orientou hierarquia, acessibilidade e responsividade; CRO orientou proposta de valor e CTAs; marketing-plan orientou aquisição, ativação e receita dentro do escopo desta página. A referência visual fornecida orientou a composição. Poppins e a paleta existente foram preservadas.

## Melhorias imediatas implementadas

- Benefício e público explícitos na primeira dobra, com um caminho principal para conhecer os planos.
- Entrar leva a `/login`; Começar agora leva a `/planos`; cada plano disponível leva a `/cadastro` com `plan` e `cycle` correspondentes.
- Planos e preços vêm do mesmo catálogo Stripe usado pelo fluxo existente. A página pode revalidar os dados a cada 300 segundos; o cadastro consulta o preço novamente.
- Preços indisponíveis levam à página de planos, sem inventar valores ou iniciar um cadastro sem preço conhecido.
- FAQ explica pagamento, confirmação de e-mail, conexão do WhatsApp e uso dos links próprios.
- Layout ocupa toda a largura, com margens fluidas e composição específica para celular.

## Mudanças de maior impacto implementadas

- Sequência de decisão: proposta de valor, prévia ilustrativa, benefícios, configuração em três passos, planos, objeções e CTA final.
- Ilustração local em SVG e HTML, sem imagens externas nem novas dependências. Não contém controles operacionais; a legenda identifica a simulação.
- Seções sem dependência de JavaScript para leitura; FAQ com controles nativos, foco visível, link para pular ao conteúdo e respeito a movimento reduzido.
- Sem depoimentos, números de vendas, plano grátis, suporte exclusivo ou limites ilimitados sem comprovação.

## Estratégia e medição

Aquisição: comunicar a organização de ofertas para afiliados e grupos de WhatsApp. Ativação: explicar a configuração e o primeiro envio. Receita: preservar a escolha de plano até o cadastro e apresentar preços antes da compra.

Métrica principal proposta: assinaturas confirmadas por visita à página inicial. Indicadores intermediários: clique no CTA, escolha do plano, cadastro concluído e chegada ao checkout. Não foi instalada uma ferramenta de analytics nem presumida uma taxa de conversão.

Ponto pendente de produto: o catálogo atual apresenta os mesmos benefícios básicos nos três planos. Definir e validar as diferenças comerciais e seus limites no produto permitirá uma comparação mais convincente. As diferenças não foram inventadas nesta implementação.

## Hipóteses para testar

1. Headline com foco no tempo economizado versus headline atual. Avaliar assinaturas por visita, além de cliques.
2. CTA “Escolher meu plano” versus “Começar agora”. Avaliar avanço até o checkout e compras confirmadas.
3. Prévia do produto versus gravação real curta, quando houver material aprovado. Avaliar conversão e impacto no carregamento mobile.

Executar um teste por vez, definir amostra e regra de decisão a partir do tráfego real e evitar conclusões baseadas apenas em CTR.

## Alternativas de texto

- “Ofertas certas, nos grupos certos.” — versão aplicada; conecta curadoria e público.
- “Menos trabalho para publicar. Mais tempo para vender.” — alternativa focada na rotina.
- “Suas ofertas e seus grupos. Tudo no mesmo Flow.” — alternativa focada na organização.

CTAs possíveis: “Começar agora” para descoberta; “Escolher meu plano” para intenção de compra; “Conhecer o Flow” para a explicação do funcionamento.

## Validação executada

- ESLint, TypeScript e build de produção aprovados.
- Sem rolagem horizontal em 320, 375, 768, 1024, 1440 e 1920px.
- Menu mobile fecha após navegação, clique externo e Escape; Escape devolve o foco ao controle, e as âncoras transferem o foco para a seção.
- FAQ abre e fecha por teclado. Movimento reduzido desativa as animações e mantém o conteúdo visível.
- Todas as rotas ligadas pela página responderam HTTP 200: início, login, planos e cadastros Essencial, Pro e Expert.
- Clique no Pro abriu o cadastro com cobrança mensal e R$ 59,00, correspondendo ao preço exibido na página inicial.
- Ícone da aba respondeu HTTP 200; console do navegador sem erros no build final.
- Nenhuma conta foi criada e nenhum pagamento foi realizado durante a validação.

Capturas: `output/playwright/home-desktop.png` e `output/playwright/home-mobile.png`.
