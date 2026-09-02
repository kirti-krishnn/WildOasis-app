import Booking from "../models/bookingsModel.ts";
import Cabin from "../models/cabinsModel.ts";
import Settings from "../models/settings.ts";
import { catchAsync } from "../utils/catchAsync.ts";

const millisecondsPerDay = 1000 * 60 * 60 * 24;
type DashboardBooking = Record<string, any> & {
  created_at?: Date | string;
  startDate?: Date | string;
  endDate?: Date | string;
};

function getReportingDays(value: unknown) {
  const days = Number(value) || 7;

  return Math.min(Math.max(Math.trunc(days), 1), 365);
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function toDate(value: Date | string | undefined | null) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCalendarDayDifference(endDate: Date, startDate: Date) {
  return Math.round(
    (startOfDay(endDate).getTime() - startOfDay(startDate).getTime()) /
      millisecondsPerDay,
  );
}

function getNormalizedStayRange(stay: { startDate: Date | string; endDate: Date | string }) {
  const rawStartDate = toDate(stay.startDate);
  const rawEndDate = toDate(stay.endDate);

  if (!rawStartDate || !rawEndDate) return null;

  const startDate = startOfDay(rawStartDate);
  const endDate = startOfDay(rawEndDate);

  return {
    startDate,
    endDate: endDate <= startDate ? addDays(startDate, 1) : endDate,
  };
}

function isSameCalendarDay(leftDate: Date | string, rightDate: Date | string) {
  const parsedLeftDate = toDate(leftDate);
  const parsedRightDate = toDate(rightDate);

  if (!parsedLeftDate || !parsedRightDate) return false;

  return startOfDay(parsedLeftDate).getTime() === startOfDay(parsedRightDate).getTime();
}

function formatChartDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(date);
}

function getDatesInInterval(periodStart: Date, numDays: number) {
  return Array.from({ length: numDays }, (_, index) => addDays(periodStart, index));
}

const stayDurationBuckets = [
  { min: 1, max: 1, duration: "1 night", color: "#4f46e5" },
  { min: 2, max: 2, duration: "2 nights", color: "#0ea5e9" },
  { min: 3, max: 3, duration: "3 nights", color: "#14b8a6" },
  { min: 4, max: 5, duration: "4-5 nights", color: "#22c55e" },
  { min: 6, max: 7, duration: "6-7 nights", color: "#eab308" },
  { min: 8, max: 14, duration: "8-14 nights", color: "#f97316" },
  { min: 15, max: 21, duration: "15-21 nights", color: "#ec4899" },
  { min: 22, max: Infinity, duration: "21+ nights", color: "#a855f7" },
];

function getOccupiedNights(
  stay: { startDate: Date | string; endDate: Date | string },
  periodStart: Date,
  periodEnd: Date,
) {
  const stayRange = getNormalizedStayRange(stay);
  if (!stayRange) return 0;

  const overlapStart = new Date(
    Math.max(stayRange.startDate.getTime(), periodStart.getTime()),
  );
  const overlapEnd = new Date(
    Math.min(stayRange.endDate.getTime(), periodEnd.getTime()),
  );

  return Math.max(0, getCalendarDayDifference(overlapEnd, overlapStart));
}

function getBookingNightCount(booking: DashboardBooking) {
  if (!booking.startDate || !booking.endDate) return 0;

  const stayRange = getNormalizedStayRange({
    startDate: booking.startDate,
    endDate: booking.endDate,
  });
  if (!stayRange) return 0;

  return Math.max(1, getCalendarDayDifference(stayRange.endDate, stayRange.startDate));
}

function parseBoolean(value: unknown) {
  return value === true || value === "true";
}

function getBookingPrices(booking: DashboardBooking, breakfastPrice: number) {
  if (booking.totalPrice !== undefined && booking.totalPrice !== null) {
    return {
      totalPrice: Number(booking.totalPrice ?? 0),
      extrasPrice: Number(booking.extrasPrice ?? 0),
    };
  }

  const cabinPrice = Number(booking.cabinId?.regularPrice ?? 0);
  const nights = getBookingNightCount(booking);
  const extrasPrice = parseBoolean(booking.hasBreakfast)
    ? breakfastPrice * (Number(booking.numGuests ?? 0) + 1) * nights
    : 0;

  return {
    totalPrice: cabinPrice * nights + extrasPrice,
    extrasPrice,
  };
}

function getDurationChart(
  stays: { startDate: Date | string; endDate: Date | string }[],
  periodStart: Date,
  periodEnd: Date,
) {
  const buckets = stayDurationBuckets.map((bucket) => ({
    ...bucket,
    value: 0,
  }));

  stays.forEach((stay) => {
    const occupiedNights = getOccupiedNights(stay, periodStart, periodEnd);
    const bucket = buckets.find(
      (item) => occupiedNights >= item.min && occupiedNights <= item.max,
    );

    if (bucket) bucket.value += 1;
  });

  return buckets
    .filter((bucket) => bucket.value > 0)
    .map(({ duration, value, color }) => ({ duration, value, color }));
}

export const getDashboardStats = catchAsync(async (req, res) => {
  const numDays = getReportingDays(req.query.days);
  const periodEnd = startOfDay(addDays(new Date(), 1));
  const periodStart = addDays(periodEnd, -numDays);

  const [allBookings, cabinCount, settings] = await Promise.all([
    Booking.find({})
      .populate("cabinId", "regularPrice")
      .lean(),
    Cabin.countDocuments(),
    Settings.findOne().lean(),
  ]);
  const breakfastPrice = settings?.breakfastPrice ?? 15;
  const bookings = allBookings.filter((booking) => {
    const createdAt = toDate(booking.created_at);

    return Boolean(createdAt && createdAt >= periodStart && createdAt < periodEnd);
  });
  const overlappingStays = allBookings.filter((booking) => {
    if (booking.status !== "checked-in" && booking.status !== "checked-out") return false;

    return getOccupiedNights(booking, periodStart, periodEnd) > 0;
  });

  const numBookings = bookings.length;
  const sales = bookings.reduce(
    (sum, booking) => sum + getBookingPrices(booking, breakfastPrice).totalPrice,
    0,
  );
  const checkIns = overlappingStays.length;
  const occupiedNights = overlappingStays.reduce(
    (sum, stay) => sum + getOccupiedNights(stay, periodStart, periodEnd),
    0,
  );
  const availableNights = numDays * cabinCount;
  const occupancyRate = availableNights
    ? Math.round((occupiedNights / availableNights) * 100)
    : 0;
  const salesChart = getDatesInInterval(periodStart, numDays).map((date) => {
    const bookingsOnDate = bookings.filter((booking) =>
      isSameCalendarDay(booking.created_at, date),
    );

    return {
      label: formatChartDate(date),
      totalSales: bookingsOnDate.reduce(
        (sum, booking) => sum + getBookingPrices(booking, breakfastPrice).totalPrice,
        0,
      ),
      extrasSales: bookingsOnDate.reduce(
        (sum, booking) => sum + getBookingPrices(booking, breakfastPrice).extrasPrice,
        0,
      ),
    };
  });
  const durationChart = getDurationChart(overlappingStays, periodStart, periodEnd);

  res.status(200).json({
    status: "success",
    data: {
      numDays,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      cabinCount,
      numBookings,
      sales,
      checkIns,
      occupiedNights,
      availableNights,
      occupancyRate,
      salesChart,
      durationChart,
    },
  });
});
