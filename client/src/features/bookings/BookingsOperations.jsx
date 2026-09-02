import FeaturesHeader from "../../ui/FeaturesHeader.jsx";
import Modal from "../../ui/Modal.jsx";
import { useIsAdmin } from "../../auth/useIsAdmin.js";
import { bookingFilterOptions, bookingSortOptions } from "./bookingOptions.js";
import CreateBookingForm from "./CreateBookingForm.jsx";
import styles from "./BookingsOperations.module.css";

export default function BookingsOperations({
  filter,
  onFilterChange,
  onSortChange,
  sortBy,
}) {
  const isAdmin = useIsAdmin();
  const bookingFeatures = [
    ...bookingFilterOptions.map((option) => ({
      type: "button",
      title: option.label,
      value: option.value,
      active: filter === option.value,
      onClick: () => onFilterChange(option.value),
    })),
    {
      type: "select",
      title: "",
      active: true,
      value: sortBy,
      onChange: (event) => onSortChange(event.target.value),
      options: bookingSortOptions,
    },
  ];

  const createBookingAction = (
    <Modal>
      <Modal.Open name="createBooking">
        <button
          className={styles.addButton}
          disabled={!isAdmin}
          title={!isAdmin ? "Only admins can create bookings." : undefined}
          type="button"
        >
          Add booking
        </button>
      </Modal.Open>
      <Modal.Window name="createBooking">
        <CreateBookingForm />
      </Modal.Window>
    </Modal>
  );

  return (
    <FeaturesHeader
      title="All bookings"
      buttonList={bookingFeatures}
      extraAction={createBookingAction}
    />
  );
}
