import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.hero}>
      <Image
        src="/bg.png"
        alt="Mountains and forests with two cabins"
        quality={80}
        fill
        priority
        className="object-cover"
      />
      <div className={styles.overlay} />

      <section className={styles.content}>
        <h1 className={styles.heading}>Welcome to paradise.</h1>
        <Link href="/cabins" className={styles.cta}>
          Explore luxury cabins
        </Link>
      </section>
    </main>
  );
}
