import { HiArrowRightOnRectangle, HiEye, HiPencil, HiTrash } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import Menus from "../../ui/Menus.jsx";
import Modal from "../../ui/Modal.jsx";
import useDeleteBooking from "./useDeleteBooking.js";
import useEditBooking from "./useEditBooking.js";
import { useIsAdmin } from "../../auth/useIsAdmin.js";
import CreateBookingForm from "./CreateBookingForm.jsx";
import {
  formatCabin,
  formatCurrency,
  formatDate,
  formatRelativeStart,
  getGuest,
  getNightCount,
  getPriceBreakdown,
  canCheckInBooking,
} from "./bookingFormatters.js";
import styles from "./BookingRow.module.css";

function getStatusClass(status) {
  if (status === "checked-in") return styles.checkedIn;
  if (status === "checked-out") return styles.checkedOut;

  return styles.unconfirmed;
}

export default function BookingRow({ booking }) {
  const navigate = useNavigate();
  const { mutate: deleteBooking } = useDeleteBooking();
  const { mutate: editBooking } = useEditBooking();
  const isAdmin = useIsAdmin();
  const bookingId = booking._id ?? booking.id;
  const guest = getGuest(booking);
  const nights = getNightCount(booking.startDate, booking.endDate);
  const status = booking.status ?? "unconfirmed";
  const price = getPriceBreakdown(booking);
  const canCheckIn = canCheckInBooking(booking);

  function handleCheckOut() {
    editBooking({
      id: bookingId,
      payload: {
        status: "checked-out",
      },
    });
  }

  return (
    <>
      <tr>
        <td className={styles.cabin}>{formatCabin(booking)}</td>
        <td>
          <div className={styles.guestName}>{guest.name}</div>
          <div className={styles.guestEmail}>{guest.email}</div>
        </td>
        <td>
          <div className={styles.dateSummary}>
            {formatRelativeStart(booking.startDate)} &rarr; {nights} night stay
          </div>
          <div className={styles.dateRange}>
            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
          </div>
        </td>
        <td>
          <span className={`${styles.status} ${getStatusClass(status)}`}>{status}</span>
        </td>
        <td className={styles.price}>
          <div>{formatCurrency(price.total)}</div>
          {booking.isPaid && price.breakfast > 0 ? (
            <div className={styles.priceBreakdown}>
              {formatCurrency(price.rent)} rent + {formatCurrency(price.breakfast)} breakfast
            </div>
          ) : null}
          <div className={booking.isPaid ? styles.paid : styles.unpaid}>
            {booking.isPaid ? "PAID" : "UNPAID"}
          </div>
        </td>
        <td>
          <Modal>
            <Menus>
              <Menus.Toggle id={bookingId}>
                <Menus.List id={bookingId}>
                  <Menus.Button icon={<HiEye />} onClick={() => navigate(`/bookings/${bookingId}`)}>
                    See details
                  </Menus.Button>
                  {status === "checked-in" ? (
                    <Menus.Button
                      disabled={!isAdmin}
                      icon={<HiArrowRightOnRectangle />}
                      onClick={handleCheckOut}
                      title={!isAdmin ? "Only admins can check out bookings." : undefined}
                    >
                      Check out
                    </Menus.Button>
                  ) : (
                    <Menus.Button
                      disabled={!isAdmin || status === "checked-out" || !canCheckIn}
                      icon={<HiArrowRightOnRectangle />}
                      onClick={() => navigate(`/checkin/${bookingId}`)}
                      title={
                        !isAdmin
                          ? "Only admins can check in bookings."
                          : !canCheckIn
                            ? "This stay has not started yet."
                            : undefined
                      }
                    >
                      Check in
                    </Menus.Button>
                  )}
                  <Modal.Open name="editBooking">
                    <Menus.Button
                      disabled={!isAdmin}
                      icon={<HiPencil />}
                      title={!isAdmin ? "Only admins can edit bookings." : undefined}
                    >
                      Edit booking
                    </Menus.Button>
                  </Modal.Open>
                  <Menus.Button
                    disabled={!isAdmin}
                    icon={<HiTrash />}
                    onClick={() => deleteBooking(bookingId)}
                    title={!isAdmin ? "Only admins can delete bookings." : undefined}
                  >
                    Delete Booking
                  </Menus.Button>
                </Menus.List>
              </Menus.Toggle>
            </Menus>

            <Modal.Window name="editBooking">
              <CreateBookingForm bookingToEdit={booking} />
            </Modal.Window>
          </Modal>
        </td>
      </tr>
    </>
  );
}
