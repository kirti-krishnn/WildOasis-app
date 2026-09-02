# Implementation Summary

## 1. What changed

### Environment validation
- Added `server/utils/validateEnv.js`.
- Applied validation in `server/server.js` and `server/data/createDatabase.js`.
- Required env keys now include `DATABASE`, `DATABASE_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_COOKIE_EXPIRES_IN`, `EMAIL_USERNAME`, and `EMAIL_PASSWORD`.

### Graceful shutdown
- Added process-level handlers in `server/server.js` for:
  - `uncaughtException`
  - `unhandledRejection`
  - `SIGTERM`
  - `SIGINT`
- On shutdown the server closes cleanly and disconnects from the database.

### Seed script corrections
- Updated `server/data/createDatabase.js` so the insert flow now:
  1. deletes existing records
  2. inserts `Cabin` documents
  3. inserts `Guest` documents
  4. transforms legacy numeric `cabinId` / `guestId` references into real Mongo ObjectIds
  5. inserts transformed `Booking` documents
- Ensured `Booking` insertion uses real object id relationships rather than legacy IDs.

### Booking model validation
- Updated `server/models/bookingsModel.js`:
  - `created_at` must be present and cannot be in the future
  - `startDate` must be present
  - `endDate` must be on or after `startDate`
- This allows historical bookings while still enforcing ordering rules.
- Added `findOneAndUpdate` hook to validate updates against the existing stored document.

### Booking update restrictions
- Updated `server/controllers/bookingsController.js` so `updateBooking` only allows:
  - `startDate`
  - `endDate`
  - `hasBreakfast`
  - `observations`
  - `isPaid`
  - `numGuests`
  - `extrasPrice`
  - `status`
- Removed `totalPrice` from the update whitelist.

### Response consistency
- `server/controllers/handlerFactory.js` provides a standardized envelope:
  - `status`
  - `data`
  - `results` when appropriate
- This keeps API responses predictable for React Query consumers.

### Email/Mailtrap validation
- Confirmed that `server/utils/email.js` uses env-driven SMTP settings.
- The code now relies on validated `EMAIL_USERNAME` and `EMAIL_PASSWORD` env vars.

## 2. Why these changes were made

### Environment validation
- To fail early with a clear error when required secrets are missing.
- To avoid runtime surprises during server startup or when seeding the database.

### Graceful shutdown
- To ensure the server closes cleanly and drops DB connections on signals or fatal errors.
- To avoid leaving a partial process or connection hanging.

### Seed script corrections
- The old flow was incorrect because bookings depend on cabins and guests.
- Inserting bookings first would create invalid references or require manual legacy ID mapping.
- The corrected flow preserves referential integrity and makes seed runs reliable.

### Booking date validation
- Historical booking data must be supported in the model.
- The original future-only constraints were too restrictive for real booking history.
- The revised validation enforces meaningful ordering without rejecting past records.

### Booking update restrictions
- `totalPrice` is often derived or sensitive, and letting clients overwrite it freely is unsafe.
- Restricting update fields prevents unauthorized price manipulation.
- Fields that are safe for patch operations are still permitted.

### Response consistency
- React Query expects a stable data structure for caching and invalidation.
- A shared response envelope prevents inconsistencies across endpoints.

### Email/Mailtrap validation
- The app must not assume email credentials are present.
- Shared env validation catches missing Mailtrap credentials before mail logic runs.

## 3. Why implementation choices were corrected

### Seed flow choice
- Corrected: `Booking` documents now load after `Cabin` and `Guest` records.
- Chosen because bookings reference those parent documents, and the seed data included legacy numeric IDs.
- This was superior to leaving booking insertion isolated and broken.

### Historical booking support
- Corrected: `startDate` is now only required instead of validated against `new Date()`.
- Chosen because historical bookings are valid, and the only necessary constraint is `endDate >= startDate`.
- This is a better fit for real booking systems than rejecting all past stays.

### Update restriction choice
- Corrected: removed `totalPrice` from the booking update whitelist.
- Chosen because direct price updates are unsafe if the system is not explicitly recalculating totals.
- This is a safer API design than allowing unrestricted booking patches.

### Env validation design
- Corrected: centralized validation in `utils/validateEnv.js` instead of duplicating checks.
- Chosen because it is easier to maintain and keeps startup and seed scripts aligned.

### API response design
- Corrected: preserved the on-model handler factory envelope.
- Chosen because React Query integration relies on predictable `status`/`data` structure.
- This is better than ad-hoc response bodies that vary per endpoint.

---

### Notes
- The current MongoDB auth error is an environment credential issue, not a code issue.
- Make sure the Atlas password in `server/.env` matches the user credentials and is URL-encoded if needed.
