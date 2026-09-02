"use client";

import styles from "./error.module.css";

export default function Error({ error, reset }) {
  return (
    <main className={styles.error}>
      <h1 className={styles.title}>Something went wrong!</h1>
      <p className={styles.message}>{error.message}</p>

      <button className={styles.button} onClick={reset}>
        Try again
      </button>
    </main>
  );
}
