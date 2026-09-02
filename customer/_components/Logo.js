import Link from "next/link";
import Image from "next/image"
import styles from "./Logo.module.css";

function Logo() {
  return (
    <Link href="/" className={styles.logo}>
      <Image
        src="/logo.png"
        height="60"
        width="60"
        quality={100}
        alt="The Wild Oasis logo"
        className={styles.image}
      />
      <span className={styles.text}>
        The Wild Oasis
      </span>
    </Link>
  );
}

export default Logo;
