import styles from "./FeaturesHeader.module.css";

export default function HtmlFeature({ feature }) {
  const normalizedFeature =
    typeof feature === "string"
      ? { type: "button", title: feature }
      : feature;

  if (normalizedFeature.type === "select") {
    return (
      <select
        aria-label={normalizedFeature.title}
        className={`${styles.select} ${normalizedFeature.active ? styles.active : ""}`}
        value={normalizedFeature.value ?? normalizedFeature.defaultValue ?? normalizedFeature.options?.[0]?.value ?? ""}
        onChange={normalizedFeature.onChange}
      >
        {normalizedFeature.title ? (
          <option value="" disabled>
            {normalizedFeature.title}
          </option>
        ) : null}
        {(normalizedFeature.options || []).map((option) => (
          <option key={option.value ?? option.label} value={option.value ?? option.label}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      className={`${styles.button} ${normalizedFeature.active ? styles.active : ""}`}
      onClick={normalizedFeature.onClick}
      type="button"
    >
      {normalizedFeature.title}
    </button>
  );
}
