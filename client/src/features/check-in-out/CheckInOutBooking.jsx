import {
  HiCalendarDays,
  HiChatBubbleLeftEllipsis,
  HiCheckCircle,
  HiCurrencyDollar,
  HiHomeModern,
} from "react-icons/hi2";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Checkbox from "../../ui/Checkbox.jsx";
import Box from "../../ui/Box.jsx";
import Spinner from "../../ui/Spinner.jsx";
import useBooking from "../bookings/useBooking.js";
import useEditBooking from "../bookings/useEditBooking.js";
import useSettings from "../settings/useSettings.js";
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
} from "../bookings/bookingFormatters.js";
import styles from "./CheckInOutBooking.module.css";

function calculateBreakfastCost({ breakfastPrice, numGuests, nights }) {
  return breakfastPrice * (numGuests + 1) * nights;
}

function isTruthyBoolean(value) {
  return value === true || value === "true";
}

export default function CheckInOutBooking() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { data: booking, isLoading, error } = useBooking(bookingId);
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const { mutate: updateBooking, isPending } = useEditBooking();
  const isAdmin = useIsAdmin();
  const [wantsBreakfast, setWantsBreakfast] = useState(false);
  const [hasConfirmedPaid, setHasConfirmedPaid] = useState(false);

  if (isLoading || isLoadingSettings) return <Spinner label="Loading booking" />;
  if (error) return <p className={styles.message}>{error.message}</p>;
  if (!booking) return <p className={styles.message}>Booking not found.</p>;

  const id = booking._id ?? booking.id;
  const guest = getGuest(booking);
  const cabin = formatCabin(booking);
  const nights = getNightCount(booking.startDate, booking.endDate);
  const bookingIdLabel = String(id);
  const breakfastPrice = Number(settings?.breakfastPrice ?? 0);
  const numGuests = Number(booking.numGuests ?? 0);
  const breakfastCost = calculateBreakfastCost({
    breakfastPrice,
    numGuests,
    nights,
  });
  const hasIncludedBreakfast = isTruthyBoolean(booking.hasBreakfast);
  const hasBreakfast = hasIncludedBreakfast || wantsBreakfast;
  const amountToConfirm = hasBreakfast && !hasIncludedBreakfast
    ? booking.totalPrice + breakfastCost
    : booking.totalPrice;
  const currentPrice = getPriceBreakdown(booking);
  const canCheckIn = canCheckInBooking(booking);
  const confirmBreakfastAmount = hasIncludedBreakfast ? currentPrice.breakfast : wantsBreakfast ? breakfastCost : 0;
  const confirmPrice = getPriceBreakdown(booking, {
    breakfast: confirmBreakfastAmount,
    total: amountToConfirm,
  });

  function handleBreakfastChange(isChecked) {
    setWantsBreakfast(isChecked);
    setHasConfirmedPaid(false);
  }

  function handleCheckIn() {
    updateBooking(
      {
        id,
        payload: {
          hasBreakfast,
          isPaid: true,
          status: "checked-in",
        },
      },
      {
        onSuccess: () => navigate(`/bookings/${id}`, { replace: true }),
      },
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Check in booking</h1>
          <p className={styles.bookingId}>Booking ID {bookingIdLabel}</p>
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
            {guest.countryFlag ? <img className={styles.flag} src={guest.countryFlag} alt="" /> : null}
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
            <span>{hasBreakfast ? "Yes" : "No"}</span>
          </div>

          <div className={styles.priceBox}>
            <span className={styles.priceMain}>
              <HiCurrencyDollar className={styles.infoIcon} /> Total price {formatCurrency(currentPrice.total)}
              {booking.isPaid && currentPrice.breakfast > 0 ? (
                <span className={styles.priceBreakdown}>
                  {formatCurrency(currentPrice.rent)} rent + {formatCurrency(currentPrice.breakfast)} breakfast
                </span>
              ) : null}
            </span>
            <span>{booking.isPaid ? "PAID" : "WILL PAY AT PROPERTY"}</span>
          </div>

          <p className={styles.bookedAt}>Booked {formatDateTime(booking.created_at)}</p>
        </div>
      </div>

      {!hasIncludedBreakfast ? (
        <Box>
          <Checkbox
            checked={wantsBreakfast}
            disabled={isPending || hasConfirmedPaid}
            id="add-breakfast"
            label={`Want to add breakfast for ${formatCurrency(breakfastCost)}?`}
            onChange={handleBreakfastChange}
          />
        </Box>
      ) : (
        <Box>
          <p className={styles.optionText}>Breakfast is already included for this booking.</p>
        </Box>
      )}

      <Box>
        <Checkbox
          checked={hasConfirmedPaid}
          disabled={hasConfirmedPaid || isPending}
          id="confirm-paid"
          label={(
            <>
              I confirm that {guest.name} has paid the total amount of {formatCurrency(amountToConfirm)}
              {confirmPrice.breakfast > 0 ? (
                <span className={styles.confirmBreakdown}>
                  {" "}({formatCurrency(confirmPrice.rent)} rent + {formatCurrency(confirmPrice.breakfast)} breakfast)
                </span>
              ) : null}
            </>
          )}
          onChange={setHasConfirmedPaid}
        />
      </Box>

      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          disabled={!isAdmin || !canCheckIn || !hasConfirmedPaid || isPending}
          onClick={handleCheckIn}
          title={
            !isAdmin
              ? "Only admins can check in bookings."
              : !canCheckIn
                ? "This stay has not started yet."
                : undefined
          }
          type="button"
        >
          {isPending ? "Checking in..." : "Check in booking"}
        </button>
        <button className={styles.secondaryButton} onClick={() => navigate(-1)} type="button">
          Back
        </button>
      </div>
    </section>
  );
}
