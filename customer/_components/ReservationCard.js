import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { format, formatDistance, isPast, isToday, parseISO } from 'date-fns';
import DeleteReservation from './DeleteReservation';
import styles from './ReservationCard.module.css';
import Image from 'next/image';

export const formatDistanceFromNow = (dateStr) =>
  formatDistance(parseISO(dateStr), new Date(), {
    addSuffix: true,
  }).replace('about ', '');

function ReservationCard({ booking, onDelete }) {
  const {
    id,
    startDate,
    endDate,
    numNights,
    totalPrice,
    numGuests,
    created_at,
    cabins: { name, image },
  } = booking;
  const isPastBooking = isPast(new Date(startDate));
  const imageUrl = image?.startsWith('http')
    ? image
    : `https://wild-oasis-api.vercel.app${image}`;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          width={200}
          height={200}
          priority
          src={imageUrl}
          alt={`Cabin ${name}`}
          className={styles.image}
        />
      </div>

      <div className={styles.details}>
        <div className={styles.headingRow}>
          <h3 className={styles.title}>
            {numNights} nights in Cabin {name}
          </h3>
          {isPastBooking ? (
            <span className={`${styles.status} ${styles.past}`}>
              past
            </span>
          ) : (
            <span className={`${styles.status} ${styles.upcoming}`}>
              upcoming
            </span>
          )}
        </div>

        <p className={styles.dates}>
          {format(new Date(startDate), 'EEE, MMM dd yyyy')} (
          {isToday(new Date(startDate))
            ? 'Today'
            : formatDistanceFromNow(startDate)}
          ) &mdash; {format(new Date(endDate), 'EEE, MMM dd yyyy')}
        </p>

        <div className={styles.footer}>
          <p className={styles.price}>${totalPrice}</p>
          <p className={styles.separator}>&bull;</p>
          <p className={styles.guests}>
            {numGuests} guest{numGuests > 1 && 's'}
          </p>
          <p className={styles.bookedAt}>
            Booked {format(new Date(created_at), 'EEE, MMM dd yyyy, p')}
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <a
          href={`/profile/reservations/edit/${id}`}
          className={styles.editLink}
        >
          <PencilSquareIcon className={styles.editIcon} />
          <span>Edit</span>
        </a>
        {!isPastBooking && (
          <DeleteReservation bookingId={id} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}

export default ReservationCard;
