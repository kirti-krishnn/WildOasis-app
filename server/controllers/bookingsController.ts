import Booking from "../models/bookingsModel.ts";
import Cabin from "../models/cabinsModel.ts";
import Settings from "../models/settings.ts";
import { catchAsync } from "../utils/catchAsync.ts";
import AppError from "../utils/appError.ts";
import { deleteOne } from "./handlerFactory.ts";
import APIFeatures from "../utils/apiFeatures.ts";
import Guest from "../models/guestsModel.ts";

type BookingWithPrice = Record<string, any>;

const parseBoolean = (value: unknown) => value === true || value === 'true';

const toDate = (value: Date | string | undefined | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toIsoString = (value: Date | string | undefined | null) => {
  const date = toDate(value);

  return date ? date.toISOString() : value;
};

const requireValidDate = (value: unknown, fieldName: string) => {
  const date = toDate(value as Date | string | undefined | null);

  if (!date) throw new AppError(`${fieldName} must be a valid ISO date.`, 400);

  return date;
};

const normalizeBookingDates = <T extends BookingWithPrice>(booking: T) => ({
  ...booking,
  created_at: toIsoString(booking.created_at),
  startDate: toIsoString(booking.startDate),
  endDate: toIsoString(booking.endDate),
});

const normalizeWritableBookingDates = (payload: Record<string, unknown>) => {
  const normalizedPayload: Record<string, unknown> = { ...payload };

  if (normalizedPayload.created_at !== undefined) {
    normalizedPayload.created_at = requireValidDate(normalizedPayload.created_at, 'Created date');
  }

  if (normalizedPayload.startDate !== undefined) {
    normalizedPayload.startDate = requireValidDate(normalizedPayload.startDate, 'Start date');
  }

  if (normalizedPayload.endDate !== undefined) {
    normalizedPayload.endDate = requireValidDate(normalizedPayload.endDate, 'End date');
  }

  return normalizedPayload;
};

const getNightCount = (startDate: Date | string, endDate: Date | string) => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const parsedStartDate = toDate(startDate);
  const parsedEndDate = toDate(endDate);

  if (!parsedStartDate || !parsedEndDate) return 0;

  const nights = Math.round(
    (parsedEndDate.getTime() - parsedStartDate.getTime()) / millisecondsPerDay,
  );

  return Math.max(nights, 1);
};

const startOfDay = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
};

const ensureBookingDatesAreConsistent = ({
  created_at,
  startDate,
  endDate,
}: {
  created_at?: Date | string;
  startDate: Date | string;
  endDate: Date | string;
}) => {
  const parsedCreatedAt = created_at ? requireValidDate(created_at, 'Created date') : null;
  const parsedStartDate = requireValidDate(startDate, 'Start date');
  const parsedEndDate = requireValidDate(endDate, 'End date');

  if (parsedCreatedAt && parsedCreatedAt > new Date()) {
    throw new AppError('Creation date cannot be in the future.', 400);
  }

  if (
    parsedCreatedAt &&
    startOfDay(parsedStartDate).getTime() < startOfDay(parsedCreatedAt).getTime()
  ) {
    throw new AppError('Start date must be on or after the booking creation date.', 400);
  }

  if (startOfDay(parsedEndDate).getTime() < startOfDay(parsedStartDate).getTime()) {
    throw new AppError('End date must be on or after the start date.', 400);
  }
};

const endOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);

  return date;
};

const ensureStatusMatchesStayDates = ({
  status,
  startDate,
}: {
  status: unknown;
  startDate: Date | string;
}) => {
  if (status !== 'checked-in' && status !== 'checked-out') return;

  const parsedStartDate = toDate(startDate);
  if (!parsedStartDate) return;

  if (parsedStartDate > endOfToday()) {
    throw new AppError('A booking can only be checked in on or after its start date.', 400);
  }
};

const addCalculatedPrice = (booking: BookingWithPrice, breakfastPrice: number) => {
  const cabinPrice = booking.cabinId?.regularPrice ?? 0;
  const nights = getNightCount(booking.startDate, booking.endDate);
  const extrasPrice = parseBoolean(booking.hasBreakfast)
    ? breakfastPrice * (booking.numGuests + 1) * nights
    : 0;
  const totalPrice = cabinPrice * nights + extrasPrice;

  return {
    ...normalizeBookingDates(booking),
    numNights: nights,
    extrasPrice,
    totalPrice,
  };
};

const calculateBookingPrices = async ({
  cabinId,
  startDate,
  endDate,
  hasBreakfast,
  numGuests,
}: {
  cabinId: unknown;
  startDate: Date | string;
  endDate: Date | string;
  hasBreakfast: boolean;
  numGuests: number;
}) => {
  const cabin = await Cabin.findById(cabinId).lean();
  if (!cabin) throw new AppError('Cabin not found', 404);

  const settings = await Settings.findOne().lean();
  const breakfastPrice = settings?.breakfastPrice ?? 15;
  const nights = getNightCount(startDate, endDate);
  if (nights < 1) throw new AppError('End date must be on or after the start date.', 400);

  const extrasPrice = hasBreakfast ? breakfastPrice * (numGuests + 1) * nights : 0;
  const totalPrice = cabin.regularPrice * nights + extrasPrice;

  return { extrasPrice, totalPrice };
};

export const getAllBookings = catchAsync(async (req, res) => {
  const queryParams = { ...req.query };
  const baseFilter: Record<string, unknown> = {};
  const customerEmail = req.user?.email;

  if (customerEmail) {
    const guest = await Guest.findOne({ email: customerEmail }).select('_id').lean();
    baseFilter.guestId = guest?._id ?? null;
  }

  if (queryParams.status === 'unconfirmed') {
    baseFilter.$or = [
      { status: 'unconfirmed' },
      { status: { $exists: false } },
      { status: null },
      { status: '' },
    ];
  }

  if (queryParams.status === 'unconfirmed') {
    delete queryParams.status;
  }

  const countFeatures = new APIFeatures(
    Booking.find(baseFilter),
    queryParams,
  ).filter();
  const totalResults = await countFeatures.query.countDocuments();

  const features = new APIFeatures(
    Booking.find(baseFilter)
      .populate('cabinId', 'name regularPrice image')
      .populate('guestId', 'fullName email'),
    queryParams,
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bookings = await features.query.lean();
  const settings = await Settings.findOne().lean();
  const breakfastPrice = settings?.breakfastPrice ?? 15;
  const bookingsWithCalculatedPrice = bookings.map((booking) =>
    addCalculatedPrice(booking, breakfastPrice),
  );

  res.status(200).json({
    status: 'success',
    results: bookingsWithCalculatedPrice.length,
    totalResults,
    data: bookingsWithCalculatedPrice,
  });
});

export const getMyBookings = catchAsync(async (req, res) => {
  const customerEmail = req.user?.email;
  const guest = customerEmail
    ? await Guest.findOne({ email: customerEmail }).select('_id').lean()
    : null;

  if (!guest) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      totalResults: 0,
      data: [],
    });
  }

  const bookings = await Booking.find({ guestId: guest._id })
    .populate('cabinId', 'name regularPrice image')
    .populate('guestId', 'fullName email')
    .sort({ startDate: 1 })
    .lean();
  const settings = await Settings.findOne().lean();
  const breakfastPrice = settings?.breakfastPrice ?? 15;

  const data = bookings.map((booking) => addCalculatedPrice(booking, breakfastPrice));

  res.status(200).json({
    status: 'success',
    results: data.length,
    totalResults: data.length,
    data,
  });
});

export const getCabinAvailability = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ cabinId: req.params.cabinId })
    .select('startDate endDate status')
    .lean();

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: bookings.map(normalizeBookingDates),
  });
});

export const getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('cabinId', 'name maxCapacity regularPrice image')
    .populate('guestId', 'fullName email nationalID countryFlag')
    .lean();

  if (!booking) return next(new AppError('Booking not found', 404));

  const customerEmail = req.user?.email;
  const bookingGuest = booking.guestId as unknown as { email?: string };
  if (customerEmail && bookingGuest?.email !== customerEmail) {
    return next(new AppError('You do not have permission to view this reservation.', 403));
  }

  const settings = await Settings.findOne().lean();
  const breakfastPrice = settings?.breakfastPrice ?? 15;
  const bookingWithCalculatedPrice = addCalculatedPrice(booking, breakfastPrice);

  res.status(200).json({
    status: 'success',
    data: bookingWithCalculatedPrice,
  });
});

export const getBookingByDate = catchAsync(async (req, res) => {
  const date = String(req.params.date);
  const bookings = await Booking.find({
    created_at: { $gte: new Date(date), $lte: new Date() },
  }).lean();

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: bookings.map((booking) => normalizeBookingDates(booking)),
  });
});

export const getStaysByDate = catchAsync(async (req, res) => {
  const date = String(req.params.date);
  const stays = await Booking.find({
    startDate: { $gte: new Date(date), $lte: new Date() },
  }).lean();

  res.status(200).json({
    status: 'success',
    results: stays.length,
    data: stays.map((stay) => normalizeBookingDates(stay)),
  });
});

export const createBooking = catchAsync(async (req, res) => {
  const bookingPayload = normalizeWritableBookingDates(req.body);
  const customerEmail = req.user?.email;

  if (customerEmail) {
    const email = customerEmail.trim().toLowerCase();
    const guest = await Guest.findOne({
      email: {
        $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        $options: 'i',
      },
    }).select('_id').lean();
    if (!guest) throw new AppError('Guest account not found.', 404);
    bookingPayload.guestId = guest._id;
  }

  ensureBookingDatesAreConsistent({
    created_at: bookingPayload.created_at as Date | string,
    startDate: bookingPayload.startDate as Date | string,
    endDate: bookingPayload.endDate as Date | string,
  });

  const prices = await calculateBookingPrices({
    cabinId: bookingPayload.cabinId,
    startDate: bookingPayload.startDate as Date | string,
    endDate: bookingPayload.endDate as Date | string,
    hasBreakfast: parseBoolean(bookingPayload.hasBreakfast),
    numGuests: Number(bookingPayload.numGuests),
  });
  ensureStatusMatchesStayDates({
    status: bookingPayload.status,
    startDate: bookingPayload.startDate as Date | string,
  });

  const booking = await Booking.create({
    ...bookingPayload,
    extrasPrice: prices.extrasPrice,
    totalPrice: prices.totalPrice,
  });

  res.status(201).json({
    status: 'success',
    data: normalizeBookingDates(booking.toObject()),
  });
});

export const updateBooking = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'startDate',
    'endDate',
    'hasBreakfast',
    'observations',
    'isPaid',
    'numGuests',
    'status',
  ];
  const filteredBody = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
  );
  const normalizedBody = normalizeWritableBookingDates(filteredBody);

  const currentBooking = await Booking.findById(req.params.id);
  if (!currentBooking) return next(new AppError('Booking not found', 404));

  const customerEmail = req.user?.email;
  if (customerEmail) {
    const guest = await Guest.findOne({ _id: currentBooking.guestId, email: customerEmail }).select('_id');
    if (!guest) return next(new AppError('You do not have permission to update this reservation.', 403));
  }

  const effectiveStartDate = normalizedBody.startDate ?? currentBooking.startDate;
  const effectiveEndDate = normalizedBody.endDate ?? currentBooking.endDate;
  const effectiveHasBreakfast = normalizedBody.hasBreakfast ?? currentBooking.hasBreakfast;
  const effectiveNumGuests = normalizedBody.numGuests ?? currentBooking.numGuests;
  const effectiveStatus = normalizedBody.status ?? currentBooking.status;

  ensureBookingDatesAreConsistent({
    created_at: currentBooking.created_at,
    startDate: effectiveStartDate as Date | string,
    endDate: effectiveEndDate as Date | string,
  });

  const prices = await calculateBookingPrices({
    cabinId: currentBooking.cabinId,
    startDate: effectiveStartDate as Date | string,
    endDate: effectiveEndDate as Date | string,
    hasBreakfast: parseBoolean(effectiveHasBreakfast),
    numGuests: Number(effectiveNumGuests),
  });
  ensureStatusMatchesStayDates({
    status: effectiveStatus,
    startDate: effectiveStartDate as Date | string,
  });

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    {
      ...normalizedBody,
      extrasPrice: prices.extrasPrice,
      totalPrice: prices.totalPrice,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: booking ? normalizeBookingDates(booking.toObject()) : booking,
  });
});

export const deleteBooking = catchAsync(async (req, res, next) => {
  const customerEmail = req.user?.email;

  if (customerEmail) {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) return next(new AppError('Booking not found', 404));

    const guest = await Guest.findOne({ _id: booking.guestId, email: customerEmail }).select('_id');
    if (!guest) return next(new AppError('You do not have permission to delete this reservation.', 403));
  }

  return deleteOne(Booking)(req, res, next);
});

export const getStaysTodayActivity = catchAsync(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const bookings = await Booking.find({
    status: { $in: ['unconfirmed', 'checked-in'] },
  })
    .populate('guestId', 'fullName countryFlag')
    .populate('cabinId', 'name')
    .sort({ status: 1, startDate: 1 })
    .lean();
  const stays = bookings.filter((booking) => {
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return false;

    if (booking.status === 'unconfirmed') {
      return startDate >= startOfToday && startDate < startOfTomorrow;
    }

    return endDate >= startOfToday && endDate < startOfTomorrow;
  });

  res.status(200).json({
    status: 'success',
    results: stays.length,
    data: stays.map((stay) => normalizeBookingDates(stay)),
  });
});


