"use client";

import { differenceInCalendarDays, isWithinInterval } from "date-fns";
import { useCallback, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useReservation } from "./ReservationContext";
import styles from "./DateSelector.module.css";

function DateSelector({ cabin, settings, bookedDates }) {
  const { regularPrice, discount } = cabin;
  const { range, setRange } = useReservation();

  const minBookingLength = settings.minimumNights;
  const maxBookingLength = settings.maximumNights;
  const bookedDateKeys = useMemo(
    () =>
      new Set(
        bookedDates.map((date) => new Date(date).toDateString()),
      ),
    [bookedDates],
  );
  const today = useMemo(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
  }, []);
  const disabledMatcher = useMemo(
    () => (date) => date < today || bookedDateKeys.has(date.toDateString()),
    [bookedDateKeys, today],
  );
  const lastBookingDate = useMemo(
    () => new Date(today.getFullYear() + 5, 11, 31),
    [today],
  );
  const numNights =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;
  const cabinPrice = numNights * (regularPrice - discount);

  const handleSelect = useCallback((nextRange) => {
    if (
      nextRange?.from &&
      nextRange?.to &&
      [...bookedDateKeys].some((date) =>
        isWithinInterval(new Date(date), {
          start: nextRange.from,
          end: nextRange.to,
        }),
      )
    ) {
      setRange(undefined);
      return;
    }

    setRange(nextRange);
  }, [bookedDateKeys, setRange]);
  const handleMonthChange = useCallback(() => {
    if (range?.from && range?.to) setRange(undefined);
  }, [range, setRange]);

  return (
    <div className={styles.dateSelector}>
      <DayPicker
        className={styles.calendar}
        mode="range"
        selected={range}
        onSelect={handleSelect}
        onMonthChange={handleMonthChange}
        min={minBookingLength}
        max={maxBookingLength}
        startMonth={today}
        endMonth={lastBookingDate}
        captionLayout="label"
        numberOfMonths={2}
        disabled={disabledMatcher}
      />

      <div className={styles.priceBar}>
        <div className={styles.priceDetails}>
          <p className={styles.nightPrice}>
            {discount > 0 ? (
              <>
                <span className={styles.currentPrice}>
                  ${regularPrice - discount}
                </span>
                <span className={styles.oldPrice}>
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className={styles.currentPrice}>${regularPrice}</span>
            )}
            <span>/night</span>
          </p>
          {numNights > 0 ? (
            <>
              <p className={styles.multiplier}>
                <span>&times;</span> <span>{numNights}</span>
              </p>
              <p>
                <span className={styles.totalLabel}>Total</span>{" "}
                <span className={styles.totalPrice}>${cabinPrice}</span>
              </p>
              <button
                className={styles.clearButton}
                type="button"
                onClick={() => setRange(undefined)}
              >
                Clear
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default DateSelector;
