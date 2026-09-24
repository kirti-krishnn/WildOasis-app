import dns from 'dns';
import mongoose from 'mongoose';

// Use a public DNS resolver for Atlas SRV lookups if the local DNS server blocks SRV queries.
// This is a workaround for environments where `querySrv` fails with ECONNREFUSED.
dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connectDB() {
  if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
    throw new Error('Missing DATABASE or DATABASE_PASSWORD environment variables.');
  }

  const DB = process.env.DATABASE.replace(
    "<db_password>",
    process.env.DATABASE_PASSWORD,
  );

  const connection = await mongoose.connect(DB);

  console.log('DB connection successful');
  await mongoose.connection.syncIndexes();
  return connection;
}

export async function disconnectDB() {
  return mongoose.disconnect();
}



