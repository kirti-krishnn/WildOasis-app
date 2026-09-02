"use client";

import Navigation from "@/_components/Navigation";
import Logo from "@/_components/Logo";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

function Header() {
  const pathname = usePathname();
  const headerClassName =
    pathname === "/" ? `${styles.header} ${styles.homeHeader}` : styles.header;

  return (
    <header className={headerClassName}>
      <div className={styles.inner}>
        <Logo />
        <Navigation />
      </div>
    </header>
  );
}

export default Header;
