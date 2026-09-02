import 'dotenv/config';
import { captureException, flushSentry } from './utils/sentry.ts';
import app from './app.ts';
import { connectDB, disconnectDB } from './utils/db.ts';
import validateEnv from './utils/validateEnv.ts';
import type { Server } from 'http';

const PORT = process.env.PORT || 5000;
validateEnv([
  'DATABASE',
  'DATABASE_PASSWORD',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_COOKIE_EXPIRES_IN',
  'EMAIL_USERNAME',
  'EMAIL_PASSWORD',
]);

let server: Server | undefined;

const toError = (err: unknown) => (err instanceof Error ? err : new Error(String(err)));

const shutdown = async (signal: string, exitCode = 0) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      try {
        await disconnectDB();
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
      process.exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
};

const handleFatalError = async (signal: string, err: unknown) => {
  const error = toError(err);
  captureException(error);
  await flushSentry();
  await shutdown(signal, 1);
};

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  void handleFatalError('uncaughtException', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  void handleFatalError('unhandledRejection', err);
});

process.on('SIGTERM', () => shutdown('SIGTERM', 0));
process.on('SIGINT', () => shutdown('SIGINT', 0));

async function startServer() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to connect to MongoDB:', err);
    captureException(toError(err));
    await flushSentry();
    process.exit(1);
  }
}

startServer();



