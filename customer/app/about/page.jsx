import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "About",
  description: "Customer website for The Wild Oasis",
};

export default function Page() {
  return (
    <main className={styles.about}>
      <section className={styles.section}>
        <div className={styles.copy}>
          <h1 className={styles.heading}>
          Welcome to The Wild Oasis
          </h1>

          <div className={styles.body}>
            <p>
            Where nature&apos;s beauty and comfortable living blend seamlessly.
            Hidden away in the heart of the Italian Dolomites, this is your
            paradise away from home. But it&apos;s not just about the luxury cabins.
            It&apos;s about the experience of reconnecting with nature and enjoying
            simple pleasures with family.
            </p>
            <p>
            Our 8 luxury cabins provide a cozy base, but the real freedom and
            peace you&apos;ll find in the surrounding mountains. Wander through lush
            forests, breathe in the fresh air, and watch the stars twinkle above
            from the warmth of a campfire or your hot tub.
            </p>
            <p>
            This is where memorable moments are made, surrounded by nature&apos;s
            splendor. It&apos;s a place to slow down, relax, and feel the joy of
            being together in a beautiful setting.
            </p>
          </div>
        </div>

        <div className={styles.imageFrame}>
          <Image
          fill
          src="/about-1.jpg"
          alt="Family sitting around a fire pit in front of cabin"
          className={styles.image}
        />
        </div>
      </section>

      <section className={`${styles.section} ${styles.reverse}`}>
        <div className={styles.imageFrame}>
          <Image
            fill
            src="/about-2.jpg"
            alt="Family that manages The Wild Oasis"
            className={styles.image}
          />
        </div>

        <div className={styles.copy}>
          <h1 className={styles.heading}>
          Managed by our family since 1962
          </h1>

          <div className={styles.body}>
            <p>
            Since 1962, The Wild Oasis has been a cherished family-run retreat.
            Started by our grandparents, this haven has been nurtured with love
            and care, passing down through our family as a testament to our
            dedication to creating a warm, welcoming environment.
            </p>
            <p>
            Over the years, we&apos;ve maintained the essence of The Wild Oasis,
            blending the timeless beauty of the mountains with the personal
            touch only a family business can offer. Here, you&apos;re not just a
            guest; you&apos;re part of our extended family. So join us at The Wild
            Oasis soon, where tradition meets tranquility, and every visit is
            like coming home.
            </p>

            <Link
              href="/cabins"
              className={styles.cta}
            >
              Explore our luxury cabins
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

