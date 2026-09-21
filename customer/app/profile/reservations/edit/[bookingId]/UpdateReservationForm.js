"use client";

import { useActionState } from "react";
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

function UpdateReservationForm({ bookingId, maxCapacity, selectedGuests, hasBreakfast, savedObservations }) {
  const [state, formAction, isPending] = useActionState(updateReservation, {
    error: "",
  });
  const isUpdating = isPending;

  return (
    <form className={styles.form} action={formAction}>
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
        <label className={styles.label} htmlFor="hasBreakfast">
          Include breakfast?
        </label>
        <input
          type="checkbox"
          name="hasBreakfast"
          id="hasBreakfast"
          value="true"
          defaultChecked={hasBreakfast}
          disabled={isUpdating}
        />
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
        <UpdateButton isSubmitting={isUpdating} />
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
