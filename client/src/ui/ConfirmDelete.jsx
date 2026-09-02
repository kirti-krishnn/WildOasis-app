import styles from "./ConfirmDelete.module.css";

export default function ConfirmDelete({
  resourceName,
  onConfirm,
  onCancel,
}) {
  return (
    <div className={styles.confirmDelete}>
      <h3 className={styles.heading}>Delete {resourceName}?</h3>

      <p className={styles.message}>
        Are you sure you want to delete {resourceName}? This action cannot be
        undone.
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          No
        </button>

        <button
          type="button"
          className={styles.deleteButton}
          onClick={onConfirm}
        >
          Yes
        </button>
      </div>
    </div>
  );
}