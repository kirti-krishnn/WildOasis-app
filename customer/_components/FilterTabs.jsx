import Link from "next/link";
import styles from "./FilterTabs.module.css";

function FilterTabs({ options, activeValue }) {
  return (
    <div className={styles.filterBar}>
      {options.map((option) => (
        <Link
          key={option.value}
          href={option.href}
          className={`${styles.filterButton} ${
            activeValue === option.value ? styles.activeFilter : ""
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

export default FilterTabs;
