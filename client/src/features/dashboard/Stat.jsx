import styles from "./Stat.module.css";

export default function Stat({ icon, title, value, color = "blue" }) {
  return (
    <article className={styles.stat}>
      <div className={`${styles.icon} ${styles[color]}`}>{icon}</div>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
    </article>
  );
}
