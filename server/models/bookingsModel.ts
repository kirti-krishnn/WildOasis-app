import mongoose from 'mongoose';
import type { UpdateQuery } from 'mongoose';

interface IBooking {
    created_at: Date;
    startDate: Date;
    endDate: Date;
    cabinId: mongoose.Types.ObjectId;
    guestId: mongoose.Types.ObjectId;
    hasBreakfast: boolean;
    observations: string;
    isPaid: boolean;
    numGuests: number;
    totalPrice: number;
    extrasPrice: number;
    status: 'unconfirmed' | 'checked-in' | 'checked-out';
}

const bookingSchema = new mongoose.Schema<IBooking>({ 
    created_at: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date): boolean {
          return value <= new Date();
        },
        message: 'Creation date cannot be in the future.',
      },
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date): boolean {
          return Boolean(value);
        },
        message: 'Start date must be provided.',
      },
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date): boolean {
          if (!value) return false;
          const booking = this as unknown as IBooking;
          if (!booking.startDate) return true;
          return value >= booking.startDate;
        },
        message: 'End date must be on or after the start date.',
      },
    },
    cabinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cabin',
      required: true,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    hasBreakfast: { type: Boolean, required: true },
    observations: { type: String, default: '' },
    isPaid: { type: Boolean, required: true },
    numGuests: { type: Number, required: true, validate: {
      validator: function(value: number): boolean {
        return value > 0; }}},
    totalPrice: { type: Number, required: true, validate: {
      validator: function(value: number): boolean {
        return value >= 0; }}},
    extrasPrice: { type: Number, required: true, validate: {
      validator: function(value: number): boolean {
        return value >= 0; }}},
    status: {
      type: String,
      enum: ['unconfirmed', 'checked-in', 'checked-out'],
      default: 'unconfirmed',
      required: true,
    },
  }); 
  
bookingSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as UpdateQuery<Record<string, unknown>> | null;
  if (!update) return;

  const currentDoc = await this.model.findOne(this.getQuery());
  if (!currentDoc) return;

  const startDate = update.startDate || update.$set?.startDate;
  const endDate = update.endDate || update.$set?.endDate;
  const createdAt = update.created_at || update.$set?.created_at;

  const effectiveCreatedAt = createdAt ? new Date(createdAt) : currentDoc.created_at;
  const effectiveStartDate = startDate ? new Date(startDate) : currentDoc.startDate;
  const effectiveEndDate = endDate ? new Date(endDate) : currentDoc.endDate;

  if (createdAt && new Date(createdAt) > new Date()) {
    throw new Error('Creation date cannot be in the future.');
  }

  if (startDate && effectiveCreatedAt && effectiveStartDate < effectiveCreatedAt) {
    throw new Error('Start date must be on or after the booking creation date.');
  }

  if (endDate && effectiveStartDate && effectiveEndDate < effectiveStartDate) {
    throw new Error('End date must be on or after the start date.');
  }
});

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;


