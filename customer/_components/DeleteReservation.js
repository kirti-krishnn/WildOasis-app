'use client';

import { TrashIcon } from '@heroicons/react/24/solid';
import { useFormStatus } from 'react-dom';
import { deleteReservation } from '@/_lib/actions';
import styles from './DeleteReservation.module.css';

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className={styles.button}
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <span className={styles.spinner} aria-label="Deleting" />
      ) : (
        <TrashIcon className={styles.icon} />
      )}
      <span>{pending ? 'Deleting...' : 'Delete'}</span>
    </button>
  );
}

function DeleteReservation({ bookingId, onDelete }) {
  function handleSubmit(event) {
    if (!window.confirm('Do you really want to delete this reservation?')) {
      event.preventDefault();
      return;
    }

    onDelete?.(bookingId);
  }

  return (
    <form
      className={styles.form}
      action={deleteReservation}
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <DeleteButton />
    </form>
  );
}

export default DeleteReservation;
