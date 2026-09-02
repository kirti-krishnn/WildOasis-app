import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { bookings } from '../data/data-bookings.ts';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const millisecondsPerDay = 1000 * 60 * 60 * 24;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE;
  const databasePassword = process.env.DATABASE_PASSWORD;

  if (!databaseUrl || !databasePassword) {
    throw new Error('Missing DATABASE or DATABASE_PASSWORD in server/.env');
  }

  return databaseUrl.replace('<db_password>', databasePassword);
}

function getNightCount(startDate: Date, endDate: Date) {
  const nights = Math.round((endDate.getTime() - startDate.getTime()) / millisecondsPerDay);

  return Math.max(nights, 1);
}

async function syncSeedBookingDashboardData() {
  const shouldApply = process.argv.includes('--apply');

  await mongoose.connect(getDatabaseUrl(), { autoIndex: false });

  const db = mongoose.connection;
  const bookingDocs = await db.collection('bookings').find({}).sort({ _id: 1 }).toArray();

  if (bookingDocs.length !== bookings.length) {
    throw new Error(
      `Refusing to sync seed bookings: found ${bookingDocs.length} bookings, expected ${bookings.length}.`,
    );
  }

  const settings = await db.collection('settings').findOne({});
  const breakfastPrice = Number(settings?.breakfastPrice ?? 15);
  const operations = [];
  const statusCounts: Record<string, number> = {};

  for (const [index, bookingDoc] of bookingDocs.entries()) {
    const seedBooking = bookings[index];
    const cabin = await db.collection('cabins').findOne({ _id: bookingDoc.cabinId });
    const startDate = new Date(seedBooking.startDate);
    const endDate = new Date(seedBooking.endDate);
    const nights = getNightCount(startDate, endDate);
    const regularPrice = Number(cabin?.regularPrice ?? 0);
    const extrasPrice = seedBooking.hasBreakfast
      ? breakfastPrice * (Number(seedBooking.numGuests ?? 0) + 1) * nights
      : 0;
    const totalPrice = regularPrice * nights + extrasPrice;
    const status = seedBooking.status ?? 'unconfirmed';

    statusCounts[status] = (statusCounts[status] ?? 0) + 1;

    operations.push({
      updateOne: {
        filter: { _id: bookingDoc._id },
        update: {
          $set: {
            created_at: new Date(seedBooking.created_at),
            startDate,
            endDate,
            hasBreakfast: seedBooking.hasBreakfast,
            observations: seedBooking.observations,
            isPaid: seedBooking.isPaid,
            numGuests: seedBooking.numGuests,
            status,
            extrasPrice,
            totalPrice,
          },
        },
      },
    });
  }

  console.log({
    mode: shouldApply ? 'apply' : 'dry-run',
    bookingsToUpdate: operations.length,
    statusCounts,
  });

  if (shouldApply && operations.length > 0) {
    const result = await db.collection('bookings').bulkWrite(operations);
    console.log({
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  }

  await mongoose.disconnect();
}

syncSeedBookingDashboardData().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
