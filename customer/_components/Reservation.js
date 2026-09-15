import {
  getBookedDatesByCabinId,
  getSettings,
} from "@/_lib/data-service";
import DateSelector from "./DateSelector";
import ReservationForm from "./ReservationForm";
import styles from "../app/cabins/page.module.css";

async function Reservation({ cabin }) {
  const [settings, bookedDates] = await Promise.all([
    getSettings(),
    getBookedDatesByCabinId(cabin.id),
  ]);

  return (
    <div className={styles.reservationLayout}>
      <DateSelector
        cabin={cabin}
        settings={settings}
        bookedDates={bookedDates.map((date) => date.toISOString())}
      />
      <ReservationForm cabin={cabin} />
    </div>
  );
}

export default Reservation;
