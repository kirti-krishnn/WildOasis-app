import Link from "next/link";
import styles from "./not-found.module.css";

function NotFound() {
  return (
    <main className={styles.notFound}>
      <h1 className={styles.title}>
        This page could not be found :(
      </h1>
      <Link
        href='/'
        className={styles.link}
      >
        Go back home
      </Link>
    </main>
  );
}

export default NotFound;
