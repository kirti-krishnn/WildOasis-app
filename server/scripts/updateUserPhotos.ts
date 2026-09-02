import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { users } from '../data/data-users.ts';

dns.setServers(['8.8.8.8', '1.1.1.1']);

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE;
  const databasePassword = process.env.DATABASE_PASSWORD;

  if (!databaseUrl || !databasePassword) {
    throw new Error('Missing DATABASE or DATABASE_PASSWORD in server/.env');
  }

  return databaseUrl.replace('<db_password>', databasePassword);
}

async function updateUserPhotos() {
  const shouldApply = process.argv.includes('--apply');

  await mongoose.connect(getDatabaseUrl(), { autoIndex: false });

  const operations = users.map(({ email, photo }) => ({
    updateOne: {
      filter: { email },
      update: { $set: { photo } },
    },
  }));

  console.log({
    mode: shouldApply ? 'apply' : 'dry-run',
    usersToUpdate: operations.length,
  });

  if (shouldApply) {
    const result = await mongoose.connection.collection('users').bulkWrite(operations);
    console.log({
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  }

  await mongoose.disconnect();
}

updateUserPhotos().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
