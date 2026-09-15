"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { updateReservation } from "@/_lib/actions";
import styles from "./page.module.css";

function UpdateButton({ isSubmitting }) {
  const { pending } = useFormStatus();
  const isUpdating = pending || isSubmitting;

  return (
    <button className={styles.submit} type="submit" disabled={isUpdating}>
      {isUpdating && <span className={styles.spinner} aria-label="Updating" />}
      {isUpdating ? "Updating..." : "Update reservation"}
    </button>
  );
}

function UpdateReservationForm({ bookingId, maxCapacity, selectedGuests, savedObservations }) {
  const [, startTransition] = useTransition();
  const [state, formAction, isPending] = useActionState(updateReservation, {
    error: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isUpdating = isPending || isSubmitting;

  useEffect(() => {
    if (state?.error) setIsSubmitting(false);
  }, [state?.error]);

  function handleSubmit() {
    startTransition(() => setIsSubmitting(true));
  }

  return (
    <form className={styles.form} action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className={styles.field}>
        <label className={styles.label} htmlFor="numGuests">
          How many guests?
        </label>
        <select
          name="numGuests"
          id="numGuests"
          className={styles.input}
          defaultValue={selectedGuests}
          required
          disabled={isUpdating}
        >
          <option value="">Select number of guests...</option>
          {Array.from({ length: maxCapacity }, (_, index) => index + 1).map(
            (guestCount) => (
              <option value={guestCount} key={guestCount}>
                {guestCount} {guestCount === 1 ? "guest" : "guests"}
              </option>
            ),
          )}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="observations">
          Anything we should know about your stay?
        </label>
        <textarea
          name="observations"
          id="observations"
          className={`${styles.input} ${styles.textarea}`}
          defaultValue={savedObservations}
          disabled={isUpdating}
        />
      </div>

      <div className={styles.actions}>
        <UpdateButton isSubmitting={isSubmitting} />
      </div>
      {state?.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

export default UpdateReservationForm;
