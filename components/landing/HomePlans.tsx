import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getPlanCatalog } from "@/lib/stripe/server";
import styles from "@/app/home.module.css";

export default async function HomePlans() {
  const plans = await getPlanCatalog();
  return (
    <div className={styles.planCards}>
      {plans.map((plan) => {
        const cycle = plan.monthly ? "monthly" : "annual";
        const price = plan[cycle];
        const highlighted = plan.id === "pro";
        const href = price
          ? `/cadastro?plan=${plan.id}&cycle=${cycle}`
          : "/planos";
        return (
          <article
            key={plan.id}
            className={`${styles.planCard} ${highlighted ? styles.highlightedPlan : ""}`}
          >
            {highlighted && (
              <span className={styles.planBadge}>
                Para uma rotina recorrente
              </span>
            )}
            <h3>{plan.name}</h3>
            <p className={styles.planAudience}>{plan.audience}</p>
            <div className={styles.planPrice}>
              {price ? (
                <>
                  <strong>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: price.currency.toUpperCase(),
                    }).format(price.amount / 100)}
                  </strong>
                  <span>/{cycle === "monthly" ? "mês" : "ano"}</span>
                </>
              ) : (
                <>
                  <strong className={styles.unavailablePrice}>
                    Consulte os valores
                  </strong>
                  <span>na página de planos</span>
                </>
              )}
            </div>
            <ul className={styles.planFeatures}>
              <li>
                <Check size={15} aria-hidden="true" /> Painel de promoções
              </li>
              <li>
                <Check size={15} aria-hidden="true" /> Cupons e links de
                afiliado
              </li>
              <li>
                <Check size={15} aria-hidden="true" /> Acesso ao workspace
              </li>
            </ul>
            <Link
              href={href}
              className={`${styles.button} ${highlighted ? styles.primary : styles.secondary}`}
              aria-label={
                price
                  ? `Escolher plano ${plan.name}, cobrança ${cycle === "monthly" ? "mensal" : "anual"}`
                  : `Consultar valores do plano ${plan.name}`
              }
            >
              {price ? `Escolher ${plan.name}` : "Ver planos"}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
