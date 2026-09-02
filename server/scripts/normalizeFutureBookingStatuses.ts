import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '1.1.1.1']);

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE;
  const databasePassword = process.env.DATABASE_PASSWORD;

  if (!databaseUrl || !databasePassword) {
    throw new Error('Missing DATABASE or DATABASE_PASSWORD in server/.env');
  }

  return databaseUrl.replace('<db_password>', databasePassword);
}

async function normalizeFutureBookingStatuses() {
  const shouldApply = process.argv.includes('--apply');
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  await mongoose.connect(getDatabaseUrl(), { autoIndex: false });

  const filter = {
    status: { $in: ['checked-in', 'checked-out'] },
    startDate: { $gt: endOfToday },
  };
  const collection = mongoose.connection.collection('bookings');
  const documentsToUpdate = await collection.countDocuments(filter);

  console.log({
    mode: shouldApply ? 'apply' : 'dry-run',
    documentsToUpdate,
  });

  if (shouldApply && documentsToUpdate > 0) {
    const result = await collection.updateMany(filter, {
      $set: {
        status: 'unconfirmed',
        isPaid: false,
      },
    });

    console.log({
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  }

  await mongoose.disconnect();
}

normalizeFutureBookingStatuses().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
