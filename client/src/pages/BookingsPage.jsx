import BookingsTable from "../features/bookings/BookingsTable.jsx";
import styles from "./BookingsPage.module.css";

export function BookingsPage() {
  return (
    <div className={styles.page}>
      <BookingsTable />
    </div>
  );
}
