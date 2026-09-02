import mongoose from 'mongoose';

export interface ISettings {
  maximumNights: number;
  minimumNights: number;
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
  maximumGuestsPerBooking: number;
}

const settingsSchema = new mongoose.Schema<ISettings>({
  maximumNights: {
    type: Number,
    required: true,
    min: [0, 'Value must be zero or greater.'],
    validate: {
      validator: function (value: number): boolean {
        const settings = this as unknown as ISettings;
        return !settings.minimumNights || value >= settings.minimumNights;
      },
      message: 'Maximum nights must be greater than or equal to minimum nights.',
    },
  },
  minimumNights: {
    type: Number,
    required: true,
    min: [0, 'Value must be zero or greater.'],
    validate: {
      validator: function (value: number): boolean {
        const settings = this as unknown as ISettings;
        return !settings.maximumNights || value <= settings.maximumNights;
      },
      message: 'Minimum nights must be less than or equal to maximum nights.',
    },
  },
  breakfastPrice: {
    type: Number,
    required: true,
    min: [0, 'Value must be zero or greater.'],
  },
  lunchPrice: {
    type: Number,
    required: true,
    min: [0, 'Value must be zero or greater.'],
  },
  dinnerPrice: {
    type: Number,
    required: true,
    min: [0, 'Value must be zero or greater.'],
  },
  maximumGuestsPerBooking: {
    type: Number,
    required: true,
    min: [1, 'Maximum guests per booking must be at least 1.'],
  },
});

const Settings = mongoose.model<ISettings>('Settings', settingsSchema);

export default Settings;
