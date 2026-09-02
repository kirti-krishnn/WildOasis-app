const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const detailDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatDate(date) {
  if (!date) return "-";

  return dateFormatter.format(new Date(date));
}

export function formatDetailDate(date) {
  if (!date) return "-";

  return detailDateFormatter.format(new Date(date));
}

export function formatDateTime(date) {
  if (!date) return "-";

  return dateTimeFormatter.format(new Date(date));
}

export function formatCurrency(value) {
  return currencyFormatter.format(value ?? 0);
}

export function formatCabin(booking) {
  const cabin = booking.cabinId;

  if (typeof cabin === "object" && cabin?.name) {
    const match = cabin.name.match(/\d+/);
    return match ? match[0].padStart(3, "0") : cabin.name;
  }

  if (typeof cabin === "number") return String(cabin).padStart(3, "0");

  return String(cabin ?? "-").slice(-3).toUpperCase();
}

export function getGuest(booking) {
  if (typeof booking.guestId === "object" && booking.guestId) {
    return {
      name: booking.guestId.fullName ?? "Guest",
      email: booking.guestId.email ?? "",
      countryFlag: booking.guestId.countryFlag ?? "",
      nationalID: booking.guestId.nationalID ?? "",
    };
  }

  return {
    name: "Guest",
    email: String(booking.guestId ?? ""),
    countryFlag: "",
    nationalID: "",
  };
}

export function getNightCount(startDate, endDate) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.round((end - start) / millisecondsPerDay);

  return Math.max(nights, 1);
}

export function getCabinRent(booking) {
  const cabin = booking.cabinId;
  const nights = getNightCount(booking.startDate, booking.endDate);

  if (typeof cabin === "object" && cabin?.regularPrice !== undefined) {
    return (cabin.regularPrice ?? 0) * nights;
  }

  return Math.max((booking.totalPrice ?? 0) - (booking.extrasPrice ?? 0), 0);
}

export function getPriceBreakdown(booking, overrides = {}) {
  const rent = overrides.rent ?? getCabinRent(booking);
  const breakfast = overrides.breakfast ?? (booking.extrasPrice ?? 0);
  const total = overrides.total ?? rent + breakfast;

  return {
    rent,
    breakfast,
    total,
  };
}

export function formatRelativeStart(startDate) {
  const now = new Date();
  const start = new Date(startDate);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.ceil((start - now) / millisecondsPerDay);
  const absDays = Math.abs(diffDays);

  if (diffDays === 0) return "Today";
  if (absDays >= 365) return diffDays > 0 ? "In over 1 year" : "Over 1 year ago";
  if (absDays >= 30) return diffDays > 0 ? "In over 1 month" : "Over 1 month ago";

  return diffDays > 0 ? `In ${absDays} days` : `${absDays} days ago`;
}

export function canCheckInBooking(booking) {
  const start = new Date(booking.startDate);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return !Number.isNaN(start.getTime()) && start <= endOfToday;
}
