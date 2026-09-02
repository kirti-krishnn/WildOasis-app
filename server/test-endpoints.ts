import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/usersModel.ts';

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

const baseUrl = process.argv[2] || process.env.API_BASE_URL || 'http://localhost:5000';
const dbUrl = process.env.DATABASE && process.env.DATABASE_PASSWORD
  ? process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD)
  : null;

type CookieJar = string[];

const userJar: CookieJar = [];
const adminJar: CookieJar = [];

const log = (...args: unknown[]) => console.log('[endpoint-test]', ...args);

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: string | Record<string, unknown>;
};

const setCookies = (headers: Headers, jar: CookieJar) => {
  const raw = headers.get('set-cookie');
  if (!raw) return;
  const cookies = Array.isArray(raw) ? raw : [raw];
  cookies.forEach((cookie) => {
    const value = cookie.split(';')[0];
    const [name] = value.split('=');
    const index = jar.findIndex((item) => item.startsWith(`${name}=`));
    if (index !== -1) jar.splice(index, 1);
    jar.push(value);
  });
};

const getCookieHeader = (jar: CookieJar) => jar.join('; ');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getDocumentId = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;

  if (typeof body._id === 'string') return body._id;

  const data = body.data;
  if (!isRecord(data)) return undefined;

  if (typeof data._id === 'string') return data._id;

  const user = data.user;
  if (isRecord(user) && typeof user._id === 'string') return user._id;

  return undefined;
};

const request = async (path: string, options: RequestOptions = {}, jar = userJar) => {
  const normalizedPath = path.startsWith('/api/') ? path.replace(/^\/api/, '/api/v1') : path;
  const url = `${baseUrl}${normalizedPath}`;
  const { body: requestBody, headers: optionHeaders, ...requestOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(optionHeaders as Record<string, string> | undefined),
  };

  if (jar.length) {
    headers.Cookie = getCookieHeader(jar);
  }

  const init: RequestInit = {
    ...requestOptions,
    headers,
  };

  if (requestBody !== undefined) {
    init.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
  }

  const res = await fetch(url, init);
  setCookies(res.headers, jar);

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }

  return { status: res.status, ok: res.ok, body, headers: res.headers };
};

const test = async (name: string, fn: () => Promise<void>) => {
  log(`Running: ${name}`);
  try {
    await fn();
    log(`✔ ${name}`);
  } catch (err) {
    log(`✖ ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
};

const randomEmail = () => `test+${Date.now()}@wildoasis.local`;
const randomString = () => Math.random().toString(36).substring(2, 10);

const connectDB = async () => {
  if (!dbUrl) {
    throw new Error('Missing DATABASE or DATABASE_PASSWORD environment variables for DB connection.');
  }
  await mongoose.connect(dbUrl, { autoIndex: false });
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

const createAdminUser = async () => {
  const email = `admin+${Date.now()}@wildoasis.local`;
  const password = 'Admin1234!';
  const existing = await User.findOne({ email });
  if (existing) return { email, password };

  await User.create({
    name: 'Test Admin',
    email,
    password,
    passwordConfirm: password,
    role: 'admin',
  });

  return { email, password };
};

const createResetToken = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error(`Unable to find user for reset token: ${email}`);
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  return resetToken;
};

const run = async () => {
  log(`Base URL: ${baseUrl}`);

  await connectDB();

  const adminCredentials = await createAdminUser();

  await test('Health check', async () => {
    const res = await request('/api/health', {}, []);
    if (!res.ok || res.status !== 200) throw new Error(`Health check failed: ${res.status}`);
  });

  await test('Admin login', async () => {
    const res = await request('/api/users/login', {
      method: 'POST',
      body: { email: adminCredentials.email, password: adminCredentials.password },
    }, adminJar);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Admin login failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Admin list users', async () => {
    const res = await request('/api/users', {}, adminJar);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Admin list users failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  let managedUserId: string | undefined;
  const managedUserEmail = randomEmail();
  const managedUserPassword = 'Managed123!';

  await test('Admin create user', async () => {
    const res = await request('/api/users', {
      method: 'POST',
      body: {
        name: 'Managed User',
        email: managedUserEmail,
        password: managedUserPassword,
        passwordConfirm: managedUserPassword,
      },
    }, adminJar);
    if (!res.ok || res.status !== 201) {
      throw new Error(`Admin create user failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
    managedUserId = getDocumentId(res.body);
    if (!managedUserId) throw new Error('Managed user ID missing from response');
  });

  await test('Admin get user by id', async () => {
    if (!managedUserId) throw new Error('Managed user ID missing');
    const res = await request(`/api/users/${managedUserId}`, {}, adminJar);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Admin get user by id failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Admin update user by id', async () => {
    if (!managedUserId) throw new Error('Managed user ID missing');
    const res = await request(`/api/users/${managedUserId}`, {
      method: 'PATCH',
      body: { role: 'user' },
    }, adminJar);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Admin update user by id failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Admin delete user by id', async () => {
    if (!managedUserId) throw new Error('Managed user ID missing');
    const res = await request(`/api/users/${managedUserId}`, {
      method: 'DELETE',
    }, adminJar);
    if (!res.ok || res.status !== 204) {
      throw new Error(`Admin delete user by id failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  const email = randomEmail();
  const password = 'Test1234!';
  const passwordAfterReset = 'Reset1234!';
  const passwordAfterUpdate = 'Updated123!';

  await test('Signup endpoint', async () => {
    const res = await request('/api/users/signup', {
      method: 'POST',
      body: { name: 'Test User', email, password, passwordConfirm: password },
    });
    if (!res.ok || res.status !== 201) {
      throw new Error(`Signup failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Login endpoint', async () => {
    const res = await request('/api/users/login', {
      method: 'POST',
      body: { email, password },
    });
    if (!res.ok || res.status !== 200) {
      throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Get current user', async () => {
    const res = await request('/api/users/me');
    if (!res.ok || res.status !== 200) {
      throw new Error(`Current user failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  const updatedMeName = 'Updated Test User';
  const updatedMeEmail = `updated+${Date.now()}@wildoasis.local`;

  await test('Update me endpoint', async () => {
    const res = await request('/api/users/updateMe', {
      method: 'PATCH',
      body: { name: updatedMeName, email: updatedMeEmail },
    });
    if (!res.ok || res.status !== 200) {
      throw new Error(`Update me failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Forgot password endpoint (no-op send)', async () => {
    const res = await request('/api/users/forgotPassword', {
      method: 'POST',
      body: { email: `missing+${Date.now()}@wildoasis.local` },
    });
    if (!res.ok || res.status !== 200) {
      throw new Error(`Forgot password failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Reset password endpoint', async () => {
    const token = await createResetToken(updatedMeEmail);
    const res = await request(`/api/users/resetPassword/${token}`, {
      method: 'PATCH',
      body: {
        password: passwordAfterReset,
        passwordConfirm: passwordAfterReset,
      },
    });
    if (!res.ok || res.status !== 200) {
      throw new Error(`Reset password failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Login with reset password', async () => {
    const res = await request('/api/users/login', {
      method: 'POST',
      body: { email: updatedMeEmail, password: passwordAfterReset },
    });
    if (!res.ok || res.status !== 200) {
      throw new Error(`Login after reset failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Update password endpoint', async () => {
    const res = await request('/api/users/updatePassword', {
      method: 'PATCH',
      body: {
        passwordCurrent: passwordAfterReset,
        password: passwordAfterUpdate,
        passwordConfirm: passwordAfterUpdate,
      },
    });
    if (!res.ok || res.status !== 200) {
      throw new Error(`Update password failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Login with updated password', async () => {
    const res = await request('/api/users/login', {
      method: 'POST',
      body: { email: updatedMeEmail, password: passwordAfterUpdate },
    });
    if (!res.ok || res.status !== 200) {
      throw new Error(`Login with updated password failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  let guestId: string | undefined;
  await test('Create guest (protected POST)', async () => {
    const guestData = {
      fullName: `Guest ${randomString()}`,
      email: `guest+${Date.now()}@wildoasis.local`,
      nationality: 'Testland',
      nationalID: `ID${Date.now()}`,
      countryFlag: '🇹🇱',
    };
    const res = await request('/api/guests', {
      method: 'POST',
      body: guestData,
    }, adminJar);
    if (!res.ok || res.status !== 201) {
      throw new Error(`Create guest failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
    guestId = getDocumentId(res.body);
    if (!guestId) throw new Error('Guest ID missing from response');
  });

  let cabinId: string | undefined;
  await test('Create cabin (protected POST)', async () => {
    const cabinData = {
      name: `Cabin ${randomString()}`,
      maxCapacity: 4,
      regularPrice: 120,
      discount: 20,
      image: 'https://placekitten.com/400/300',
      description: 'A test cabin for API checks.',
    };
    const res = await request('/api/cabins', {
      method: 'POST',
      body: cabinData,
    }, adminJar);
    if (!res.ok || res.status !== 201) {
      throw new Error(`Create cabin failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
    cabinId = getDocumentId(res.body);
    if (!cabinId) throw new Error('Cabin ID missing from response');
  });

  let bookingId: string | undefined;
  await test('Create booking (protected POST)', async () => {
    if (!cabinId || !guestId) throw new Error('Cabin or guest ID missing');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const bookingData = {
      created_at: now.toISOString(),
      startDate: tomorrow.toISOString(),
      endDate: dayAfter.toISOString(),
      cabinId,
      guestId,
      hasBreakfast: true,
      observations: 'Testing booking create',
      isPaid: true,
      numGuests: 1,
      totalPrice: 200,
      extrasPrice: 0,
      status: 'unconfirmed',
    };
    const res = await request('/api/bookings', {
      method: 'POST',
      body: bookingData,
    }, adminJar);
    if (!res.ok || res.status !== 201) {
      throw new Error(`Create booking failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
    bookingId = getDocumentId(res.body);
    if (!bookingId) throw new Error('Booking ID missing from response');
  });

  let bookingTodayId: string | undefined;
  await test('Create booking for stay today activity', async () => {
    if (!cabinId || !guestId) throw new Error('Cabin or guest ID missing');
    const now = new Date();
    const laterToday = new Date(now.getTime() + 10 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const bookingData = {
      created_at: now.toISOString(),
      startDate: laterToday.toISOString(),
      endDate: tomorrow.toISOString(),
      cabinId,
      guestId,
      hasBreakfast: false,
      observations: 'Testing stay today',
      isPaid: false,
      numGuests: 2,
      totalPrice: 150,
      extrasPrice: 10,
      status: 'unconfirmed',
    };
    const res = await request('/api/bookings', {
      method: 'POST',
      body: bookingData,
    }, adminJar);
    if (!res.ok || res.status !== 201) {
      throw new Error(`Create stay today booking failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
    bookingTodayId = getDocumentId(res.body);
    if (!bookingTodayId) throw new Error('Booking today ID missing from response');
  });

  await test('Get guest by id', async () => {
    if (!guestId) throw new Error('Guest ID missing');
    const res = await request(`/api/guests/${guestId}`);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Get guest by id failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Get cabin by id', async () => {
    if (!cabinId) throw new Error('Cabin ID missing');
    const res = await request(`/api/cabins/${cabinId}`);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Get cabin by id failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Get booking by id', async () => {
    if (!bookingId) throw new Error('Booking ID missing');
    const res = await request(`/api/bookings/${bookingId}`);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Get booking by id failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Update guest (protected PATCH)', async () => {
    if (!guestId) throw new Error('Guest ID missing');
    const res = await request(`/api/guests/${guestId}`, {
      method: 'PATCH',
      body: { nationality: 'UpdatedLand' },
    }, adminJar);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Update guest failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Update cabin (protected PATCH)', async () => {
    if (!cabinId) throw new Error('Cabin ID missing');
    const res = await request(`/api/cabins/${cabinId}`, {
      method: 'PATCH',
      body: { discount: 10 },
    }, adminJar);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Update cabin failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Update booking (protected PATCH)', async () => {
    if (!bookingId) throw new Error('Booking ID missing');
    const res = await request(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      body: { status: 'checked-in' },
    }, adminJar);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Update booking failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Bookings after-date endpoint', async () => {
    const date = new Date().toISOString();
    const res = await request(`/api/bookings/after-date/${encodeURIComponent(date)}`);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Bookings after-date failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Stays after-date endpoint', async () => {
    const date = new Date().toISOString();
    const res = await request(`/api/bookings/stays-after-date/${encodeURIComponent(date)}`);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Stays after-date failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Stays today activity endpoint', async () => {
    const res = await request('/api/bookings/stays-today-activity');
    if (!res.ok || res.status !== 200) {
      throw new Error(`Stays today activity failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Dashboard stats endpoint', async () => {
    const res = await request('/api/dashboard/stats?days=7');
    if (!res.ok || res.status !== 200) {
      throw new Error(`Dashboard stats failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Delete booking (protected DELETE)', async () => {
    if (!bookingId) throw new Error('Booking ID missing');
    const res = await request(`/api/bookings/${bookingId}`, {
      method: 'DELETE',
    }, adminJar);
    if (!res.ok || res.status !== 204) {
      throw new Error(`Delete booking failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Delete today activity booking (protected DELETE)', async () => {
    if (!bookingTodayId) throw new Error('Booking today ID missing');
    const res = await request(`/api/bookings/${bookingTodayId}`, {
      method: 'DELETE',
    }, adminJar);
    if (!res.ok || res.status !== 204) {
      throw new Error(`Delete today booking failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Delete cabin (protected DELETE)', async () => {
    if (!cabinId) throw new Error('Cabin ID missing');
    const res = await request(`/api/cabins/${cabinId}`, {
      method: 'DELETE',
    }, adminJar);
    if (!res.ok || res.status !== 204) {
      throw new Error(`Delete cabin failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Delete guest (protected DELETE)', async () => {
    if (!guestId) throw new Error('Guest ID missing');
    const res = await request(`/api/guests/${guestId}`, {
      method: 'DELETE',
    }, adminJar);
    if (!res.ok || res.status !== 204) {
      throw new Error(`Delete guest failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Logout admin endpoint', async () => {
    const res = await request('/api/users/logout', {}, adminJar);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Admin logout failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await test('Delete me endpoint', async () => {
    const res = await request('/api/users/deleteMe', {
      method: 'DELETE',
    });
    if (!res.ok || res.status !== 204) {
      throw new Error(`Delete me failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  await disconnectDB();
  log('Endpoint smoke test completed.');
};

run().catch((err) => {
  console.error('[endpoint-test] Fatal error', err);
  process.exit(1);
});



