import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import styles from "./Pagination.module.css";

export default function Pagination({
  currentPage = 1,
  onPageChange,
  pageSize = 10,
  totalResults = 0,
}) {
  const pageCount = Math.max(1, Math.ceil(totalResults / pageSize));
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < pageCount;

  return (
    <div className={styles.pagination}>
      <button
        className={styles.button}
        disabled={!hasPrevious}
        onClick={() => onPageChange?.(currentPage - 1)}
        type="button"
      >
        <HiChevronLeft className={styles.icon} />
        Previous
      </button>

      <button
        className={styles.button}
        disabled={!hasNext}
        onClick={() => onPageChange?.(currentPage + 1)}
        type="button"
      >
        Next
        <HiChevronRight className={styles.icon} />
      </button>
    </div>
  );
}
