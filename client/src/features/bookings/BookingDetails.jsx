import {
  HiCalendarDays,
  HiChatBubbleLeftEllipsis,
  HiCheckCircle,
  HiCurrencyDollar,
  HiHomeModern,
} from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import useBooking from "./useBooking.js";
import useDeleteBooking from "./useDeleteBooking.js";
import useEditBooking from "./useEditBooking.js";
import Spinner from "../../ui/Spinner.jsx";
import { useIsAdmin } from "../../auth/useIsAdmin.js";
import {
  formatCabin,
  formatCurrency,
  formatDateTime,
  formatDetailDate,
  formatRelativeStart,
  getGuest,
  getNightCount,
  getPriceBreakdown,
  canCheckInBooking,
} from "./bookingFormatters.js";
import styles from "./BookingDetails.module.css";

export default function BookingDetails() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { data: booking, isLoading, error } = useBooking(bookingId);
  const { mutate: deleteBooking } = useDeleteBooking();
  const { mutate: editBooking } = useEditBooking();
  const isAdmin = useIsAdmin();

  if (isLoading) return <Spinner label="Loading booking" />;
  if (error) return <p className={styles.message}>{error.message}</p>;
  if (!booking) return <p className={styles.message}>Booking not found.</p>;

  const guest = getGuest(booking);
  const cabin = formatCabin(booking);
  const nights = getNightCount(booking.startDate, booking.endDate);
  const status = booking.status ?? "unconfirmed";
  const bookingNumber = String(booking._id ?? booking.id).slice(-4).toUpperCase();
  const id = booking._id ?? booking.id;
  const isCheckedIn = status === "checked-in";
  const isCheckedOut = status === "checked-out";
  const price = getPriceBreakdown(booking);
  const canCheckIn = canCheckInBooking(booking);

  return (
    <section className={styles.details}>
      <div className={styles.header}>
        <div className={styles.headingGroup}>
          <h1 className={styles.heading}>Booking #{bookingNumber}</h1>
          <span className={`${styles.status} ${styles[status]}`}>{status}</span>
        </div>
        <button className={styles.backLink} onClick={() => navigate(-1)} type="button">
          &larr; Back
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.summary}>
          <div className={styles.summaryLeft}>
            <HiHomeModern className={styles.summaryIcon} />
            {nights} nights in Cabin {cabin}
          </div>
          <div className={styles.summaryRight}>
            <HiCalendarDays className={styles.summaryIcon} />
            {formatDetailDate(booking.startDate)} ({formatRelativeStart(booking.startDate)}) -{" "}
            {formatDetailDate(booking.endDate)}
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.guest}>
            {guest.countryFlag ? (
              <img className={styles.flag} src={guest.countryFlag} alt="" />
            ) : null}
            <span className={styles.guestStrong}>
              {guest.name} + {booking.numGuests} guests
            </span>
            <span>&bull;</span>
            <span>{guest.email}</span>
            <span>&bull;</span>
            <span>National ID {guest.nationalID || "-"}</span>
          </div>

          <div className={styles.infoRow}>
            <HiChatBubbleLeftEllipsis className={styles.infoIcon} />
            <strong>Observations</strong>
            <span>{booking.observations || "No observations"}</span>
          </div>

          <div className={styles.infoRow}>
            <HiCheckCircle className={styles.infoIcon} />
            <strong>Breakfast included?</strong>
            <span>{booking.hasBreakfast ? "Yes" : "No"}</span>
          </div>

          <div className={styles.priceBox}>
            <span className={styles.priceMain}>
              <HiCurrencyDollar className={styles.infoIcon} /> Total price {formatCurrency(price.total)}
              {booking.isPaid && price.breakfast > 0 ? (
                <span className={styles.priceBreakdown}>
                  {formatCurrency(price.rent)} rent + {formatCurrency(price.breakfast)} breakfast
                </span>
              ) : null}
            </span>
            <span>{booking.isPaid ? "PAID" : "WILL PAY AT PROPERTY"}</span>
          </div>

          <p className={styles.bookedAt}>Booked {formatDateTime(booking.created_at)}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          disabled={!isAdmin || isCheckedOut || (!isCheckedIn && !canCheckIn)}
          onClick={() => {
            if (isCheckedIn) {
              editBooking({ id, payload: { status: "checked-out" } });
              return;
            }

            navigate(`/checkin/${id}`);
          }}
          title={
            !isAdmin
              ? "Only admins can update booking status."
              : !isCheckedIn && !canCheckIn
                ? "This stay has not started yet."
                : undefined
          }
          type="button"
        >
          {isCheckedIn ? "Check out" : "Check in"}
        </button>
        <button
          className={styles.dangerButton}
          disabled={!isAdmin}
          onClick={() => deleteBooking(id)}
          title={!isAdmin ? "Only admins can delete bookings." : undefined}
          type="button"
        >
          Delete booking
        </button>
        <button className={styles.secondaryButton} onClick={() => navigate(-1)} type="button">
          Back
        </button>
      </div>
    </section>
  );
}
