import Link from "next/link";
import styles from "./Navigation.module.css";

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        <li>
          <Link href="/cabins" className={styles.link}>
            Cabins
          </Link>
        </li>
        <li>
          <Link href="/about" className={styles.link}>
            About
          </Link>
        </li>
        <li>
          <Link
            href="/account"
            className={styles.link}
          >
            Guests
          </Link>
        </li>
      </ul>
    </nav>
  );
}
