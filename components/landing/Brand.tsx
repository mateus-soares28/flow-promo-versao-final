import Link from "next/link";
import { Zap } from "lucide-react";
import styles from "@/app/home.module.css";

export default function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="FlowPromos — início">
      <span className={styles.brandIcon}>
        <Zap size={19} fill="currentColor" aria-hidden="true" />
      </span>
      FlowPromos
    </Link>
  );
}
