import styles from "./ErrorFallback.module.css";

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <main className={styles.page}>
      <section className={styles.panel} role="alert">
        <p className={styles.eyebrow}>Application error</p>
        <h1 className={styles.heading}>Something went wrong</h1>
        <p className={styles.message}>
          The page crashed while rendering. Try again, and we will take you back to a safe place.
        </p>
        {error?.message ? <pre className={styles.error}>{error.message}</pre> : null}
        <button className={styles.button} onClick={resetErrorBoundary} type="button">
          Try again
        </button>
      </section>
    </main>
  );
}
