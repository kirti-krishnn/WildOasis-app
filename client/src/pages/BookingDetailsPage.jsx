import BookingDetails from "../features/bookings/BookingDetails.jsx";
import styles from "./BookingsPage.module.css";

export function BookingDetailsPage() {
  return (
    <div className={styles.page}>
      <BookingDetails />
    </div>
  );
}
