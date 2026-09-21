import { auth } from "@/_lib/auth";
import { getBooking, getGuest } from "@/_lib/data-service";
import { notFound, redirect } from "next/navigation";
import UpdateReservationForm from "./UpdateReservationForm";
import styles from "./page.module.css";

export default async function Page({ params }) {
  const { bookingId } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const booking = await getBooking(bookingId, session.user.email);
  const guest = await getGuest(session.user.email);
  const guestId = String(guest?.id || guest?._id || "");
  const bookingGuestId = String(
    booking?.guestId?.id || booking?.guestId?._id || booking?.guestId || "",
  );

  if (!guestId || guestId !== bookingGuestId) notFound();

  const reservationId = booking.id || booking._id;
  const maxCapacity = booking.cabinId?.maxCapacity || 23;
  const selectedGuests = String(booking.numGuests ?? "");
  const savedObservations = booking.observations || booking.description || "";

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>
        Edit Reservation #{reservationId}
      </h2>

      <UpdateReservationForm
        bookingId={reservationId}
        maxCapacity={maxCapacity}
        selectedGuests={selectedGuests}
        savedObservations={savedObservations}
      />
    </div>
  );
}
