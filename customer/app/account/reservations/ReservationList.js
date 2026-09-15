"use client";

import { useOptimistic, useTransition } from "react";
import ReservationCard from "@/_components/ReservationCard";
import styles from "./page.module.css";

function ReservationList({ bookings }) {
  function deleteBooking(currentBookings, bookingId) {
    return currentBookings.filter((booking) => booking.id !== bookingId);
  }

  const [optimisticBookings, removeOptimisticBooking] = useOptimistic(
    bookings,
    deleteBooking,
  );
  const [, startTransition] = useTransition();

  function handleDelete(bookingId) {
    startTransition(() => {
      removeOptimisticBooking(bookingId);
    });
  }

  return (
    <ul className={styles.list}>
      {optimisticBookings.map((booking) => (
        <ReservationCard
          booking={booking}
          key={booking.id}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

export default ReservationList;
