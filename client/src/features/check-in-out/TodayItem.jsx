import { Link } from "react-router-dom";
import { formatCabin, getGuest, getNightCount } from "../bookings/bookingFormatters.js";
import useEditBooking from "../bookings/useEditBooking.js";
import styles from "./TodayItem.module.css";

function Flag({ value }) {
  if (!value) return null;

  if (/^https?:\/\//.test(value)) {
    return <img className={styles.flag} src={value} alt="" />;
  }

  return <span className={styles.flagText}>{value}</span>;
}

export default function TodayItem({ activity }) {
  const { mutate: checkout, isPending } = useEditBooking();
  const bookingId = activity._id ?? activity.id;
  const guest = getGuest(activity);
  const nights = getNightCount(activity.startDate, activity.endDate);
  const isArrival = activity.status === "unconfirmed";

  function handleCheckout() {
    checkout({
      id: bookingId,
      payload: { status: "checked-out" },
    });
  }

  return (
    <li className={styles.item}>
      <span className={`${styles.tag} ${isArrival ? styles.arriving : styles.departing}`}>
        {isArrival ? "Arriving" : "Departing"}
      </span>
      <div className={styles.guest}>
        <Flag value={guest.countryFlag} />
        <span className={styles.name}>{guest.name}</span>
      </div>
      <span className={styles.meta}>
        {nights} {nights === 1 ? "night" : "nights"} in Cabin {formatCabin(activity)}
      </span>
      {isArrival ? (
        <Link className={styles.action} to={`/checkin/${bookingId}`}>
          Check in
        </Link>
      ) : (
        <button
          className={styles.action}
          disabled={isPending}
          onClick={handleCheckout}
          type="button"
        >
          {isPending ? "Checking out..." : "Check out"}
        </button>
      )}
    </li>
  );
}
