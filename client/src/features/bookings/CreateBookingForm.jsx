import { useForm, useWatch, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Form from "../../ui/Form.jsx";
import FormRow from "../../ui/FormRow.jsx";
import rowStyles from "../../ui/FormRow.module.css";
import useCreateBooking from "./useCreateBooking.js";
import useEditBooking from "./useEditBooking.js";
import useCabins from "../cabins/useCabins.js";
import useGuests from "../guests/useGuests.js";
import useCabinAvailability from "./useCabinAvailability.js";
import styles from "./CreateBookingForm.module.css";
import {
  buildCreateBookingPayload,
  buildEditableBookingPayload,
  getBookingFormDefaults,
} from "./bookingFormHelpers.js";

export default function CreateBookingForm({ bookingToEdit = {}, onClose = () => {} }) {
  const { mutate: createBooking, isPending: isCreating } = useCreateBooking();
  const { mutate: editBooking, isPending: isEditing } = useEditBooking();
  const { data: cabins = [], isLoading: isLoadingCabins } = useCabins();
  const { data: guests = [], isLoading: isLoadingGuests } = useGuests();
  const bookingId = bookingToEdit?._id || bookingToEdit?.id;
  const isEditMode = Boolean(bookingId);
  const isLoadingOptions = isLoadingCabins || isLoadingGuests;

  const { control, register, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: getBookingFormDefaults(bookingToEdit),
  });
  const startDate = useWatch({ control, name: "startDate" });
  const cabinId = useWatch({ control, name: "cabinId" });
  const selectedCabin = cabins.find((cabin) => (cabin._id ?? cabin.id) === cabinId);
  const { data: bookedRanges = [], isLoading: isLoadingAvailability } = useCabinAvailability(cabinId, bookingId);
  const isWorking = isCreating || isEditing || isLoadingOptions || isLoadingAvailability;
  const parseDateOnly = (value) => {
    const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  const formatDateOnly = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const bookedDates = bookedRanges.flatMap((booking) => {
    const dates = [];
    const current = parseDateOnly(booking.startDate);
    const end = parseDateOnly(booking.endDate);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  });
  const isBookedDate = (date) => bookedDates.some((bookedDate) => (
    formatDateOnly(date) === formatDateOnly(bookedDate)
  ));
  const isDateRangeBooked = (start, end) => {
    if (!start || !end) return false;

    const startTime = parseDateOnly(start).getTime();
    const endTime = parseDateOnly(end).getTime();

    return bookedRanges.some((booking) => (
      startTime < parseDateOnly(booking.endDate).getTime()
      && endTime > parseDateOnly(booking.startDate).getTime()
    ));
  };
  const toDatePickerValue = (value) => value ? parseDateOnly(value) : null;

  const onSubmit = handleSubmit((data) => {
    const editablePayload = buildEditableBookingPayload(data);

    if (isEditMode) {
      editBooking(
        {
          id: bookingId,
          payload: editablePayload,
        },
        {
          onSuccess: onClose,
        },
      );
      return;
    }

    createBooking(
      buildCreateBookingPayload(data),
      {
        onSuccess: onClose,
      },
    );
  });

  return (
    <Form type="modal" onSubmit={onSubmit}>
      <FormRow name="Cabin">
        <div className={rowStyles.inputWithError}>
          <select
            className={styles.select}
            disabled={isWorking || isEditMode}
            {...register("cabinId", { required: "Cabin is required" })}
          >
            <option value="">Select cabin</option>
            {cabins.map((cabin) => (
              <option value={cabin._id ?? cabin.id} key={cabin._id ?? cabin.id}>
                {cabin.name}
              </option>
            ))}
          </select>
          {errors?.cabinId?.message ? <span className={rowStyles.error}>{errors.cabinId.message}</span> : null}
        </div>
      </FormRow>

      <FormRow name="Guest">
        <div className={rowStyles.inputWithError}>
          <select
            className={styles.select}
            disabled={isWorking || isEditMode}
            {...register("guestId", { required: "Guest is required" })}
          >
            <option value="">Select guest</option>
            {guests.map((guest) => (
              <option value={guest._id ?? guest.id} key={guest._id ?? guest.id}>
                {guest.fullName} ({guest.email})
              </option>
            ))}
          </select>
          {errors?.guestId?.message ? <span className={rowStyles.error}>{errors.guestId.message}</span> : null}
        </div>
      </FormRow>

      {!isEditMode ? (
        <FormRow name="Created at">
          <div className={rowStyles.inputWithError}>
            <input
              type="date"
              disabled={isWorking}
              {...register("created_at", { required: "Created date is required" })}
            />
            {errors?.created_at?.message ? <span className={rowStyles.error}>{errors.created_at.message}</span> : null}
          </div>
        </FormRow>
      ) : null}

      <FormRow name="Start date">
        <div className={rowStyles.inputWithError}>
          <Controller
            name="startDate"
            control={control}
            rules={{
              required: "Start date is required",
              validate: (value) => !getValues("endDate") || value <= getValues("endDate") || "Start date must be before end date",
            }}
            render={({ field }) => (
              <DatePicker
                selected={toDatePickerValue(field.value)}
                onChange={(date) => field.onChange(date ? formatDateOnly(date) : "")}
                minDate={new Date()}
                excludeDates={bookedDates}
                filterDate={(date) => !isBookedDate(date)}
                dayClassName={(date) => isBookedDate(date) ? styles.bookedDate : undefined}
                disabled={isWorking}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select start date"
              />
            )}
          />
          {errors?.startDate?.message ? <span className={rowStyles.error}>{errors.startDate.message}</span> : null}
        </div>
      </FormRow>

      <FormRow name="End date">
        <div className={rowStyles.inputWithError}>
          <Controller
            name="endDate"
            control={control}
            rules={{
              required: "End date is required",
              validate: (value) => {
                if (value < getValues("startDate")) return "End date must be on or after start date";
                if (isDateRangeBooked(getValues("startDate"), value)) return "These dates are already booked for this cabin";
                return true;
              },
            }}
            render={({ field }) => (
              <DatePicker
                selected={toDatePickerValue(field.value)}
                onChange={(date) => field.onChange(date ? formatDateOnly(date) : "")}
                minDate={toDatePickerValue(startDate) || new Date()}
                excludeDates={bookedDates}
                filterDate={(date) => !isBookedDate(date)}
                dayClassName={(date) => isBookedDate(date) ? styles.bookedDate : undefined}
                disabled={isWorking}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select end date"
              />
            )}
          />
          {errors?.endDate?.message ? <span className={rowStyles.error}>{errors.endDate.message}</span> : null}
        </div>
      </FormRow>

      <FormRow name="Number of guests">
        <div className={rowStyles.inputWithError}>
          <input
            type="number"
            min="1"
            max={selectedCabin?.maxCapacity || undefined}
            disabled={isWorking}
            {...register("numGuests", {
              required: "Number of guests is required",
              min: { value: 1, message: "Guests must be at least 1" },
              max: selectedCabin?.maxCapacity
                ? { value: selectedCabin.maxCapacity, message: `This cabin allows up to ${selectedCabin.maxCapacity} guests` }
                : undefined,
              valueAsNumber: true,
            })}
          />
          {errors?.numGuests?.message ? <span className={rowStyles.error}>{errors.numGuests.message}</span> : null}
        </div>
      </FormRow>

      <FormRow name="Status">
        <select className={styles.select} disabled={isWorking} {...register("status")}>
          <option value="unconfirmed">Unconfirmed</option>
          <option value="checked-in">Checked in</option>
          <option value="checked-out">Checked out</option>
        </select>
      </FormRow>

      <FormRow name="Breakfast included">
        <input className={styles.checkbox} type="checkbox" disabled={isWorking} {...register("hasBreakfast")} />
      </FormRow>

      <FormRow name="Paid">
        <input className={styles.checkbox} type="checkbox" disabled={isWorking} {...register("isPaid")} />
      </FormRow>

      <FormRow name="Observations">
        <div className={rowStyles.inputWithError}>
          <textarea
            rows="4"
            disabled={isWorking}
            placeholder="Observations"
            {...register("observations")}
          />
        </div>
      </FormRow>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelButton} disabled={isWorking} onClick={onClose}>
          Cancel
        </button>

        <button type="submit" className={styles.submitButton} disabled={isWorking}>
          {isWorking ? "Saving..." : isEditMode ? "Edit booking" : "Create new booking"}
        </button>
      </div>
    </Form>
  );
}
