import styles from "./Checkbox.module.css";

export default function Checkbox({
  id,
  checked,
  disabled = false,
  label,
  onChange,
}) {
  return (
    <label className={`${styles.checkbox} ${disabled ? styles.disabled : ""}`} htmlFor={id}>
      <input
        id={id}
        checked={checked}
        className={styles.input}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        type="checkbox"
      />
      <span className={styles.label}>{label}</span>
    </label>
  );
}
