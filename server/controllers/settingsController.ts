import Settings, { type ISettings } from '../models/settings.ts';
import AppError from '../utils/appError.ts';
import { catchAsync } from '../utils/catchAsync.ts';

const allowedFields = [
  'maximumNights',
  'minimumNights',
  'breakfastPrice',
  'lunchPrice',
  'dinnerPrice',
  'maximumGuestsPerBooking',
] as const;

type SettingsField = (typeof allowedFields)[number];
type SettingsUpdate = Partial<Pick<ISettings, SettingsField>>;

const defaultSettings: ISettings = {
  maximumNights: 90,
  minimumNights: 3,
  breakfastPrice: 15,
  lunchPrice: 25,
  dinnerPrice: 35,
  maximumGuestsPerBooking: 8,
};

const filterSettingsBody = (body: Record<string, unknown>) =>
  allowedFields.reduce<SettingsUpdate>((filteredBody, field) => {
    if (field in body) {
      filteredBody[field] = body[field] as ISettings[SettingsField];
    }

    return filteredBody;
  }, {});

export const getSettings = catchAsync(async (req, res, next) => {
  void req;
  void next;

  const settings = await Settings.findOne() || await Settings.create(defaultSettings);

  res.status(200).json({
    status: 'success',
    data: settings,
  });
});

export const createSettings = catchAsync(async (req, res, next) => {
  const existingSettings = await Settings.findOne();

  if (existingSettings) {
    return next(new AppError('Settings already exist', 400));
  }

  const settings = await Settings.create(req.body);

  res.status(201).json({
    status: 'success',
    data: settings,
  });
});

export const updateSettings = catchAsync(async (req, res, next) => {
  const currentSettings = await Settings.findOne() || await Settings.create(defaultSettings);

  Object.assign(currentSettings, filterSettingsBody(req.body));
  await currentSettings.save();

  res.status(200).json({
    status: 'success',
    data: currentSettings,
  });
});
