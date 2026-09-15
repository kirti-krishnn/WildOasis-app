"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { usePathname } from "next/navigation";
import { useReservation } from "./ReservationContext";
import styles from "./ReservationReminder.module.css";

function ReservationReminder() {
  const pathname = usePathname();
  const { range, setRange } = useReservation();
  const isCabinDetailPage = /^\/cabins\/[^/]+$/.test(pathname);

  if (!range?.from || !range?.to || isCabinDetailPage) return null;

  return (
    <div className={styles.reminder}>
      <p className={styles.text}>
        Do not forget to reserve your dates
        <br />
        from {format(range.from, "MMM dd yyyy")} to{" "}
        {format(range.to, "MMM dd yyyy")}
      </p>
      <button
        className={styles.button}
        type="button"
        aria-label="Clear reserved dates"
        onClick={() => setRange(undefined)}
      >
        <XMarkIcon className={styles.icon} />
      </button>
    </div>
  );
}

export default ReservationReminder;
