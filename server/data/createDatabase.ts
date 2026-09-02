import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import validateEnv from '../utils/validateEnv.ts';

import Cabin from '../models/cabinsModel.ts';
import Guest from '../models/guestsModel.ts';
import Booking from '../models/bookingsModel.ts';
import User from '../models/usersModel.ts';
import { cabins } from './data-cabins.ts';
import { guests } from './data-guests.ts';
import { bookings } from './data-bookings.ts';
import {users} from './data-users.ts';
import type { Types } from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

dns.setServers(['8.8.8.8', '1.1.1.1']);

validateEnv(['DATABASE', 'DATABASE_PASSWORD']);

const databaseUrl = process.env.DATABASE;
const databasePassword = process.env.DATABASE_PASSWORD;

if (!databaseUrl || !databasePassword) {
  throw new Error('Missing DATABASE or DATABASE_PASSWORD in server/.env');
}

const DB = databaseUrl.replace(
  '<db_password>',
  databasePassword,
);

type InsertedDoc = { _id: Types.ObjectId };
type LegacyIdMap = Map<number, Types.ObjectId>;
type LegacyBooking = Record<string, unknown> & {
  cabinId: number | string | Types.ObjectId;
  guestId: number | string | Types.ObjectId;
};

const mapLegacyIds = (items: InsertedDoc[]): LegacyIdMap =>
  new Map(items.map((item, index) => [index + 1, item._id]));

const transformLegacyBookings = (
  bookingsList: LegacyBooking[],
  cabinMap: LegacyIdMap,
  guestMap: LegacyIdMap,
) =>
  bookingsList.map((booking) => {
    const transformed = { status: 'unconfirmed', ...booking };

    if (typeof booking.cabinId === 'number' || /^[0-9]+$/.test(String(booking.cabinId))) {
      const key = Number(booking.cabinId);
      const cabinObjectId = cabinMap.get(key);
      if (!cabinObjectId) {
        throw new Error(`Legacy cabinId ${booking.cabinId} does not map to an inserted cabin.`);
      }
      transformed.cabinId = cabinObjectId;
    }

    if (typeof booking.guestId === 'number' || /^[0-9]+$/.test(String(booking.guestId))) {
      const key = Number(booking.guestId);
      const guestObjectId = guestMap.get(key);
      if (!guestObjectId) {
        throw new Error(`Legacy guestId ${booking.guestId} does not map to an inserted guest.`);
      }
      transformed.guestId = guestObjectId;
    }

    return transformed;
  });

const actions: Record<'insert' | 'delete', () => Promise<void>> = {
  async insert() {

      

      await User.deleteMany();
    await Booking.deleteMany();
    await Guest.deleteMany();
    await Cabin.deleteMany();  

  /* for (const cabinData of cabins) {
    const cabin = new Cabin(cabinData);
    await cabin.save();
  } */
   

  
     for (const userData of users) {
  const user = new User(userData);
  await user.save(); 
} 
  const cabinDocs = await Cabin.insertMany(cabins, { lean: true });
  const guestDocs = await Guest.insertMany(guests, { lean: true });

    const cabinMap = mapLegacyIds(cabinDocs);
    const guestMap = mapLegacyIds(guestDocs);
    const transformedBookings = transformLegacyBookings(bookings, cabinMap, guestMap);

    await Booking.insertMany(transformedBookings, { lean: true }); 
    console.log('Database created: cabins, guests, bookings inserted.');
  },

  async delete() {
    await Booking.deleteMany();
    await Guest.deleteMany();
    await Cabin.deleteMany();
    console.log('Database deleted: cabins, guests, bookings removed.');
  },
};

const action = process.argv[2];

if (!action) {
  console.error('Usage: node data/createDatabase.js <insert|delete>');
  process.exit(1);
}

async function executeAction() {
  try {
    await mongoose.connect(DB);
    console.log('Connected to MongoDB');

    if (action === 'insert') {
      await actions.insert();
    } else if (action === 'delete') {
      await actions.delete();
    } else {
      console.error('Usage: node data/createDatabase.js <insert|delete>');
      process.exit(1);
    }
  } catch (err) {
    console.error('Database script error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

executeAction();



