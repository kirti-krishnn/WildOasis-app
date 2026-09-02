export function toDateInputValue(date) {
  if (!date) return "";

  const parsedDate = new Date(date);
  const timezoneOffset = parsedDate.getTimezoneOffset() * 60 * 1000;

  return new Date(parsedDate.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function getIdValue(value) {
  if (typeof value === "object" && value) return value._id ?? value.id ?? "";

  return value ?? "";
}

function toIsoDateString(value) {
  if (!value) return value;
  if (value.includes("T")) return new Date(value).toISOString();

  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function getBookingFormDefaults(booking = {}) {
  return {
    created_at: toDateInputValue(booking.created_at) || toDateInputValue(new Date()),
    startDate: toDateInputValue(booking.startDate),
    endDate: toDateInputValue(booking.endDate),
    cabinId: getIdValue(booking.cabinId),
    guestId: getIdValue(booking.guestId),
    hasBreakfast: Boolean(booking.hasBreakfast),
    observations: booking.observations || "",
    isPaid: Boolean(booking.isPaid),
    numGuests: booking.numGuests ?? 1,
    status: booking.status || "unconfirmed",
  };
}

export function buildEditableBookingPayload(data) {
  return {
    startDate: toIsoDateString(data.startDate),
    endDate: toIsoDateString(data.endDate),
    hasBreakfast: data.hasBreakfast,
    observations: data.observations,
    isPaid: data.isPaid,
    numGuests: data.numGuests,
    status: data.status,
  };
}

export function buildCreateBookingPayload(data) {
  return {
    ...buildEditableBookingPayload(data),
    created_at: toIsoDateString(data.created_at),
    cabinId: data.cabinId,
    guestId: data.guestId,
  };
}
