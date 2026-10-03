import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Link2,
  ListChecks,
  MessageCircle,
  Send,
  ShieldCheck,
  Tag,
  Users,
} from "lucide-react";
import Brand from "@/components/landing/Brand";
import ProductPreview from "@/components/landing/ProductPreview";
import HomePlans from "@/components/landing/HomePlans";
import MobileNavigation from "@/components/landing/MobileNavigation";
import styles from "./home.module.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "FlowPromos | Ofertas certas, nos grupos certos",
  description:
    "Organize ofertas, cupons e links de afiliado. Conecte seu WhatsApp e programe publicações nos seus grupos com o FlowPromos. Conheça os planos.",
};

const navigation = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#planos", label: "Planos" },
  { href: "#perguntas", label: "Perguntas frequentes" },
];

const benefits = [
  {
    icon: MessageCircle,
    title: "Seu WhatsApp, organizado",
    description: "Reúna os grupos da sua operação em um só lugar.",
  },
  {
    icon: Tag,
    title: "Ofertas prontas para enviar",
    description: "Organize preços, cupons e seus links de afiliado.",
  },
  {
    icon: Clock3,
    title: "Mais tempo para crescer",
    description: "Programe os envios e simplifique sua rotina.",
  },
  {
    icon: Users,
    title: "Cada oferta no seu grupo",
    description: "Escolha o público certo para cada publicação.",
  },
];

const steps = [
  {
    icon: Link2,
    title: "Conecte seu WhatsApp",
    description:
      "Vincule sua conta e prepare o canal de envio das suas ofertas.",
  },
  {
    icon: Users,
    title: "Organize seus grupos",
    description: "Separe seus públicos por nicho, loja ou tipo de promoção.",
  },
  {
    icon: Send,
    title: "Prepare e programe",
    description: "Revise a oferta, escolha os grupos e defina quando enviar.",
  },
];

const questions = [
  {
    title: "O que é o FlowPromos?",
    answer:
      "É um workspace para afiliados organizarem ofertas, cupons, links e grupos de WhatsApp. Você prepara suas promoções e programa os envios em um só lugar.",
  },
  {
    title: "Como começo a usar?",
    answer:
      "Escolha um plano, crie sua conta e conclua o pagamento. Confirme também o seu e-mail para acessar a plataforma. Depois, conecte seu WhatsApp, organize os grupos e prepare sua primeira oferta.",
  },
  {
    title: "Posso usar meus links da Shopee e do Mercado Livre?",
    answer:
      "Sim. Você pode cadastrar ofertas dessas lojas com seus próprios links de afiliado, preços e cupons. Revise os dados da promoção antes de publicar e mantenha seu cadastro de afiliado na loja correspondente.",
  },
  {
    title: "Preciso manter meu WhatsApp conectado?",
    answer:
      "Sim. Para enviar as publicações programadas, sua sessão do WhatsApp precisa estar conectada. Você pode acompanhar a conexão e os disparos pelo painel.",
  },
  {
    title: "Existe um plano gratuito?",
    answer:
      "O acesso à plataforma depende de uma assinatura ativa. Os planos disponíveis são Essencial, Pro e Expert. Na página de planos, você consulta os valores e os ciclos de cobrança disponíveis antes de criar sua conta.",
  },
  {
    title: "Já tenho uma assinatura. Por onde entro?",
    answer: (
      <>
        Use <Link href="/login">Entrar na minha conta</Link> com o e-mail e a
        senha do cadastro. O acesso é liberado após a confirmação do e-mail e do
        pagamento.
      </>
    ),
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <a href="#conteudo" className={styles.skipLink}>
        Pular para o conteúdo
      </a>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Brand />
          <nav aria-label="Navegação principal" className={styles.desktopNav}>
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <Link href="/login" className={styles.loginLink}>
              Entrar
            </Link>
            <Link
              href="/planos"
              className={`${styles.button} ${styles.primary} ${styles.headerCta}`}
            >
              Começar agora <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <MobileNavigation items={navigation} />
          </div>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1}>
        <section
          className={`${styles.container} ${styles.hero}`}
          aria-labelledby="hero-title"
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.statusDot} /> Workspace de afiliados
            </p>
            <h1 id="hero-title">
              Ofertas certas,
              <br />
              nos <span className={styles.underline}>grupos certos.</span>
            </h1>
            <p className={styles.heroDescription}>
              Suas ofertas da Shopee, Mercado Livre e outras lojas, organizadas
              e programadas para seus grupos de WhatsApp.
            </p>
            <p className={styles.heroPromise}>
              Menos tarefas repetidas. Mais tempo para vender.
            </p>
            <div className={styles.heroActions}>
              <Link
                href="/planos"
                className={`${styles.button} ${styles.primary}`}
              >
                Começar agora <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="#como-funciona"
                className={`${styles.button} ${styles.secondary}`}
              >
                Conhecer o Flow <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
            <ul className={styles.reassurance}>
              <li>
                <Check size={15} aria-hidden="true" /> Ofertas em um só lugar
              </li>
              <li>
                <Check size={15} aria-hidden="true" /> Envio programado
              </li>
              <li>
                <Check size={15} aria-hidden="true" /> Seus links de afiliado
              </li>
            </ul>
          </div>
          <ProductPreview />
        </section>
        <section
          aria-label="Vantagens do FlowPromos"
          className={`${styles.container} ${styles.benefits}`}
        >
          {benefits.map(({ icon: Icon, title, description }) => (
            <article className={styles.benefit} key={title}>
              <span className={styles.benefitIcon}>
                <Icon size={23} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </section>
        <section
          id="como-funciona"
          tabIndex={-1}
          className={styles.howSection}
          aria-labelledby="how-title"
        >
          <div className={`${styles.container} ${styles.howGrid}`}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>Como funciona</p>
              <h2 id="how-title">
                Sua rotina de ofertas.
                <br /> <span className={styles.underline}>Em três passos.</span>
              </h2>
              <p>
                Da curadoria ao envio, em um só lugar. Você escolhe as ofertas.
                O Flow organiza o caminho.
              </p>
            </div>
            {steps.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className={styles.step}>
                <div className={styles.stepTop}>
                  <span className={styles.stepIcon}>
                    <Icon size={24} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className={styles.stepNumber}>0{index + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight
                    className={styles.stepArrow}
                    size={21}
                    aria-hidden="true"
                  />
                )}
              </article>
            ))}
          </div>
        </section>
        <section
          id="planos"
          tabIndex={-1}
          className={`${styles.container} ${styles.plansSection}`}
          aria-labelledby="plans-title"
        >
          <div className={styles.plansLayout}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>Seu próximo passo</p>
              <h2 id="plans-title">
                Um plano para
                <br /> o seu momento.
              </h2>
              <p>
                Do primeiro grupo à operação em expansão. Escolha como organizar
                sua rotina com o Flow.
              </p>
              <Link href="/planos" className={styles.textLink}>
                Comparar planos e ciclos{" "}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <span className={styles.secureNote}>
                <ShieldCheck size={17} aria-hidden="true" /> Pagamento seguro
                pelo Stripe
              </span>
            </div>
            <Suspense
              fallback={
                <div className={styles.plansLoading} role="status">
                  Carregando planos…{" "}
                  <Link href="/planos">
                    Ver página de planos{" "}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              }
            >
              <HomePlans />
            </Suspense>
          </div>
          <div className={styles.included}>
            <span>
              <ListChecks size={19} aria-hidden="true" /> Em todos os planos
            </span>
            <span>
              <Check size={15} aria-hidden="true" /> Organização de promoções
            </span>
            <span>
              <Check size={15} aria-hidden="true" /> Cupons e links de afiliado
            </span>
            <span>
              <Check size={15} aria-hidden="true" /> Workspace FlowPromos
            </span>
          </div>
        </section>
        <section
          id="perguntas"
          tabIndex={-1}
          className={`${styles.container} ${styles.faqSection}`}
          aria-labelledby="faq-title"
        >
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Sem complicação</p>
            <h2 id="faq-title">
              Antes de começar,
              <br />
              tire suas dúvidas.
            </h2>
            <p>Entenda como o Flow entra na sua rotina.</p>
            <Link href="/planos" className={styles.textLink}>
              Encontrar meu plano <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.faqList}>
            {questions.map(({ title, answer }) => (
              <details key={title} className={styles.faq}>
                <summary>
                  {title}
                  <ChevronDown size={19} aria-hidden="true" />
                </summary>
                <div className={styles.faqAnswer}>{answer}</div>
              </details>
            ))}
          </div>
        </section>
        <section
          className={`${styles.container} ${styles.closing}`}
          aria-labelledby="closing-title"
        >
          <div>
            <p className={styles.eyebrow}>Sua próxima oferta começa aqui</p>
            <h2 id="closing-title">Coloque sua operação no Flow.</h2>
            <p>
              Organize suas ofertas. Conecte seus grupos. Prepare o próximo
              envio.
            </p>
          </div>
          <Link href="/planos" className={`${styles.button} ${styles.primary}`}>
            Escolher meu plano <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <footer className={`${styles.container} ${styles.footer}`}>
        <Brand />
        <p>FlowPromos · Mais organização para quem vive de ofertas.</p>
        <Link href="/login">
          Já sou cliente <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}
