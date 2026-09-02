import Link from "next/link";
import styles from "./not-found.module.css";

function NotFound() {
  return (
    <main className={styles.notFound}>
      <h1 className={styles.title}>
        This cabin could not be found :(
      </h1>
      <Link
        href='/cabins'
        className={styles.link}
      >
        Back to all cabins
      </Link>
    </main>
  );
}

export default NotFound;
