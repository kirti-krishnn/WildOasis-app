"use client";

import Image from "next/image";
import { format } from "date-fns";
import { useReservation } from "./ReservationContext";
import { createReservation } from "@/_lib/actions";
import styles from "./ReservationForm.module.css";

function ReservationFormClient({ cabin, user }) {
  const { maxCapacity } = cabin;
  const { range, setRange } = useReservation();
  const hasSelectedDates = Boolean(range?.from && range?.to);

  return (
    <div className={styles.reservationForm}>
      <div className={styles.userBar}>
        <p>Logged in as</p>

        <div className={styles.user}>
          {user.image && (
            <Image
              src={user.image}
              alt={user.name || "Guest"}
              width={32}
              height={32}
              className={styles.avatar}
              referrerPolicy="no-referrer"
            />
          )}
          <p>{user.name}</p>
        </div>
      </div>

      <form
        className={styles.form}
        action={createReservation}
        onSubmit={() => setRange(undefined)}
      >
        <input type="hidden" name="cabinId" value={cabin.id} />
        <div className={styles.field}>
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            className={styles.input}
            required
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            className={`${styles.input} ${styles.textarea}`}
            placeholder="Any pets, allergies, special requirements, etc.?"
          />
        </div>

        <div className={styles.actions}>
          <p className={styles.helperText}>
            {hasSelectedDates
              ? `${format(range.from, "MMM dd yyyy")} to ${format(
                  range.to,
                  "MMM dd yyyy",
                )}`
              : "Start by selecting dates"}
          </p>

          {range?.from && (
            <input
              type="hidden"
              name="startDate"
              value={range.from.toISOString()}
            />
          )}
          {range?.to && (
            <input type="hidden" name="endDate" value={range.to.toISOString()} />
          )}

          <button className={styles.button} disabled={!hasSelectedDates}>
            Reserve now
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReservationFormClient;
