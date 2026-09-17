import app from '../app.js';
import { connectDB } from '../utils/db.js';

let dbConnection: ReturnType<typeof connectDB> | null = null;

async function handler(req: any, res: any) {
  try {
    if (!dbConnection) {
      dbConnection = connectDB();
    }

    await dbConnection;

    return app(req, res);
  } catch (error) {
    dbConnection = null;

    console.error('Database connection failed:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
}

export default handler;