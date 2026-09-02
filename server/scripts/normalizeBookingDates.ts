import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const dateFields = ['created_at', 'startDate', 'endDate'] as const;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE;
  const databasePassword = process.env.DATABASE_PASSWORD;

  if (!databaseUrl || !databasePassword) {
    throw new Error('Missing DATABASE or DATABASE_PASSWORD in server/.env');
  }

  return databaseUrl.replace('<db_password>', databasePassword);
}

function parseDate(value: unknown) {
  if (!value) return null;

  const date = new Date(value as string | Date);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function normalizeBookingDates() {
  const shouldApply = process.argv.includes('--apply');

  await mongoose.connect(getDatabaseUrl(), { autoIndex: false });

  const collection = mongoose.connection.collection('bookings');
  const bookings = await collection.find({}).toArray();

  const operations = [];
  const skipped: Array<{ id: string; field: string; value: unknown }> = [];

  for (const booking of bookings) {
    const $set: Record<string, Date> = {};

    for (const field of dateFields) {
      const date = parseDate(booking[field]);

      if (!date) {
        skipped.push({
          id: String(booking._id),
          field,
          value: booking[field],
        });
        continue;
      }

      if (!(booking[field] instanceof Date) || booking[field].getTime() !== date.getTime()) {
        $set[field] = date;
      }
    }

    if (Object.keys($set).length > 0) {
      operations.push({
        updateOne: {
          filter: { _id: booking._id },
          update: { $set },
        },
      });
    }
  }

  console.log({
    mode: shouldApply ? 'apply' : 'dry-run',
    scanned: bookings.length,
    documentsToUpdate: operations.length,
    skippedInvalidDates: skipped.length,
  });

  if (skipped.length > 0) {
    console.log('Skipped invalid date fields:', skipped);
  }

  if (shouldApply && operations.length > 0) {
    const result = await collection.bulkWrite(operations);
    console.log({
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  }

  await mongoose.disconnect();
}

normalizeBookingDates().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
