import dns from 'dns';
import mongoose from 'mongoose';

// Use a public DNS resolver for Atlas SRV lookups if the local DNS server blocks SRV queries.
// This is a workaround for environments where `querySrv` fails with ECONNREFUSED.
dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connectDB() {
  const databaseTemplate = process.env.DATABASE || process.env.DATABASE_URL || process.env.MONGODB_URI;
  const databasePassword = process.env.DATABASE_PASSWORD || process.env.MONGODB_PASSWORD;

  if (!databaseTemplate) {
    throw new Error('Missing DATABASE, DATABASE_URL, or MONGODB_URI environment variable.');
  }

  const DB = databaseTemplate.replace(
    "<db_password>",
    databasePassword || '',
  );

  const connection = await mongoose.connect(DB);

  console.log('DB connection successful');
  await mongoose.connection.syncIndexes();
  return connection;
}

export async function disconnectDB() {
  return mongoose.disconnect();
}



