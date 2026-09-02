import styles from "./Spinner.module.css";

export default function Spinner({ label = "Loading", fullPage = false }) {
  return (
    <div className={fullPage ? styles.fullPage : styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
