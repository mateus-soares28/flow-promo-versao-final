import {
  ArrowUpRight,
  BarChart3,
  Check,
  Clock3,
  Home,
  Link2,
  MessageCircle,
  Send,
  Settings,
  ShoppingBag,
  Users,
  Zap,
} from "lucide-react";
import styles from "@/app/home.module.css";

const offers = [
  {
    name: "Fone Bluetooth",
    store: "Shopee",
    price: "129,90",
    oldPrice: "189,90",
    discount: "−32%",
    product: "headphones",
  },
  {
    name: "Smartwatch",
    store: "Mercado Livre",
    price: "199,90",
    oldPrice: "279,90",
    discount: "−29%",
    product: "watch",
  },
  {
    name: "Air Fryer 4L",
    store: "Shopee",
    price: "289,90",
    oldPrice: "389,90",
    discount: "−26%",
    product: "airfryer",
  },
];

function ProductIllustration({ product }: { product: string }) {
  return (
    <svg
      viewBox="0 0 160 130"
      fill="none"
      aria-hidden="true"
      className={styles.productIllustration}
    >
      <ellipse cx="80" cy="115" rx="40" ry="7" fill="#0f172a" opacity=".07" />
      {product === "headphones" ? (
        <>
          <path
            d="M40 73V60a40 40 0 0 1 80 0v13"
            stroke="#cbd5e1"
            strokeWidth="13"
          />
          <path
            d="M40 65v-5a40 40 0 0 1 80 0v5"
            stroke="#f8fafc"
            strokeWidth="7"
          />
          <rect
            x="29"
            y="62"
            width="25"
            height="45"
            rx="12"
            fill="#e2e8f0"
            stroke="#94a3b8"
          />
          <rect
            x="106"
            y="62"
            width="25"
            height="45"
            rx="12"
            fill="#e2e8f0"
            stroke="#94a3b8"
          />
          <rect x="44" y="64" width="13" height="42" rx="6" fill="#475569" />
          <rect x="103" y="64" width="13" height="42" rx="6" fill="#475569" />
        </>
      ) : product === "watch" ? (
        <>
          <rect x="63" y="7" width="36" height="116" rx="13" fill="#334155" />
          <rect x="50" y="31" width="62" height="70" rx="19" fill="#94a3b8" />
          <rect x="54" y="35" width="54" height="62" rx="15" fill="#0f172a" />
          <circle cx="81" cy="65" r="20" stroke="#34d399" strokeWidth="3" />
          <path
            d="M81 50v15l11 8"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="113" y="48" width="4" height="12" rx="2" fill="#64748b" />
        </>
      ) : (
        <>
          <rect x="43" y="17" width="76" height="96" rx="24" fill="#0f172a" />
          <path
            d="M52 41c0-12 7-17 17-17h21"
            stroke="#475569"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="67" y="31" width="29" height="20" rx="7" fill="#1e293b" />
          <circle cx="81" cy="41" r="6" stroke="#94a3b8" strokeWidth="2" />
          <path d="M47 65h68" stroke="#475569" />
          <rect x="72" y="61" width="18" height="34" rx="6" fill="#64748b" />
          <path
            d="M78 66v22"
            stroke="#cbd5e1"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export default function ProductPreview() {
  return (
    <figure
      className={styles.preview}
      aria-label="Exemplo ilustrativo: organize suas ofertas no painel e prepare uma publicação para seu grupo de WhatsApp"
    >
      <div className={styles.previewGlow} />
      <div className={styles.dashboard} aria-hidden="true">
        <div className={styles.dashboardBar}>
          <span className={styles.miniBrand}>
            <Zap size={13} fill="currentColor" /> FlowPromos
          </span>
          <span className={styles.workspaceStatus}>
            <span /> Seu workspace
          </span>
        </div>
        <div className={styles.dashboardBody}>
          <div className={styles.previewSidebar}>
            {[
              { icon: Home, label: "Visão geral" },
              { icon: Users, label: "Grupos" },
              { icon: ShoppingBag, label: "Ofertas" },
              { icon: Link2, label: "Publicações" },
              { icon: BarChart3, label: "Estatísticas" },
              { icon: Settings, label: "Configurações" },
            ].map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className={index === 0 ? styles.activeSidebarItem : undefined}
              >
                <Icon size={13} />
                {label}
              </div>
            ))}
            <span className={styles.sidebarBottom}>
              <MessageCircle size={13} /> WhatsApp conectado
            </span>
          </div>
          <div className={styles.previewContent}>
            <div className={styles.previewHeading}>
              <div>
                <strong>Suas ofertas</strong>
                <p>Uma boa oferta merece o grupo certo.</p>
              </div>
              <span className={styles.newOffer}>+ Nova oferta</span>
            </div>
            <div className={styles.offerCards}>
              {offers.map((offer) => (
                <div key={offer.name} className={styles.offerCard}>
                  <div className={styles.productImage}>
                    <span className={styles.discount}>{offer.discount}</span>
                    <ProductIllustration product={offer.product} />
                  </div>
                  <strong className={styles.offerName}>{offer.name}</strong>
                  <div className={styles.offerPrice}>
                    <strong>R$ {offer.price}</strong>
                    <s>{offer.oldPrice}</s>
                  </div>
                  <span className={styles.store}>
                    <ShoppingBag size={11} />
                    {offer.store}
                  </span>
                  <span className={styles.schedule}>
                    <Clock3 size={11} /> Programar
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.previewBottom}>
              <span>
                <Check size={12} /> Tudo pronto para a próxima publicação
              </span>
              <span>3 ofertas</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.messageCard} aria-hidden="true">
        <div className={styles.messageHeading}>
          <span>
            <MessageCircle size={20} />
          </span>
          <div>
            <strong>Seu grupo de ofertas</strong>
            <p>Uma nova promoção por aqui</p>
          </div>
        </div>
        <div className={styles.messageProduct}>
          <ProductIllustration product="airfryer" />
        </div>
        <div className={styles.messageText}>
          <strong>Achadinho para a sua cozinha</strong>
          <p>Air Fryer 4L</p>
          <s>De R$ 389,90</s>
          <b>Por R$ 289,90</b>
          <span className={styles.messageLink}>
            Seu link de afiliado <ArrowUpRight size={11} />
          </span>
          <span className={styles.messageTime}>
            10:24 <Check size={10} />
          </span>
        </div>
      </div>
      <div className={styles.deliveryBadge} aria-hidden="true">
        <span>
          <Send size={19} />
        </span>
        <div>
          <strong>Do painel para o grupo.</strong>
          <p>No horário que você escolher.</p>
        </div>
      </div>
      <figcaption className={styles.previewCaption}>
        Prévia ilustrativa da organização e do envio de ofertas.
      </figcaption>
    </figure>
  );
}
