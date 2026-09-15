import ReservationList from "./ReservationList";
import { auth } from "@/_lib/auth";
import { getBookings, getGuest } from "@/_lib/data-service";
import Link from "next/link";
import styles from "./page.module.css";

export default async function Page() {
  const session = await auth();
  const guest = session?.user?.email ? await getGuest(session.user.email) : null;
  const guestId = guest?.id || guest?._id;
  const bookings = guestId ? await getBookings(guestId) : [];

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>
        Your reservations
      </h2>

      {bookings.length === 0 ? (
        <p className={styles.emptyMessage}>
          You have no reservations yet. Check out our{" "}
          <Link className={styles.link} href="/cabins">
            luxury cabins &rarr;
          </Link>
        </p>
      ) : (
        <ReservationList bookings={bookings} />
      )}
    </div>
  );
}
