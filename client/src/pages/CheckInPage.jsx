import CheckInOutBooking from "../features/check-in-out/CheckInOutBooking.jsx";
import styles from "./BookingsPage.module.css";

export function CheckInPage() {
  return (
    <div className={styles.page}>
      <CheckInOutBooking />
    </div>
  );
}
