import { eachDayOfInterval } from "date-fns";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

const SERVER_API_URL = process.env.SERVER_API_URL || "http://127.0.0.1:5000/api/v1";
const REST_COUNTRIES_API_KEY = process.env.REST_COUNTRIES_API_KEY;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const { forwardCookies = false, ...fetchOptions } = options;
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (forwardCookies) {
    const cookieHeader = (await cookies()).toString();

    if (cookieHeader) {
      headers.set("Cookie", cookieHeader);
    }
  }

  const response = await fetch(`${SERVER_API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (response.status === 204) return null;

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if(response.status === 404) notFound();
    throw new ApiError(payload?.message || "Something went wrong.", response.status);
  }

  return payload?.data ?? payload;
}

function normalizeCabin(cabin) {
  if (!cabin) return cabin;

  return {
    ...cabin,
    id: cabin.id || cabin._id,
  };
}

function normalizeBooking(booking) {
  if (!booking) return booking;

  return {
    ...booking,
    id: booking.id || booking._id,
    cabinId: normalizeCabin(booking.cabinId),
    guestId: booking.guestId,
    cabins: booking.cabins || booking.cabinId,
  };
}

export async function getCabin(id) {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  const cabin = await request(`/cabins/${id}`, {
    next: { revalidate: 3600 },
  });

  return normalizeCabin(cabin);
}

export async function getCabinPrice(id) {
  const cabin = await getCabin(id);

  return cabin
    ? {
        regularPrice: cabin.regularPrice,
        discount: cabin.discount,
      }
    : null;
}

export async function getCabins() {
  const cabins = await request(
   
    
    "/cabins?sort=name&fields=name,maxCapacity,regularPrice,discount,image",
    {
      next: { revalidate: 300 },
    },
  );
  

  return Array.isArray(cabins) ? cabins.map(normalizeCabin) : [];

}

export async function getGuest(id) {
  if (id?.includes("@")) {
    const guests = await request(`/guests?email=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });

    return Array.isArray(guests) ? guests.at(0) : guests;
  }

  return request(`/guests/${id}`, {
    cache: "no-store",
    forwardCookies: true,
  });
}

export async function getBooking(id) {
  const booking = await request(`/bookings/${id}`, {
    cache: "no-store",
    forwardCookies: true,
  });

  return normalizeBooking(booking);
}

export async function getBookings(guestId) {
  const bookings = await request(`/bookings?guestId=${guestId}&sort=startDate`, {
    cache: "no-store",
    forwardCookies: true,
  });

  return Array.isArray(bookings) ? bookings.map(normalizeBooking) : [];
}

export async function getBookedDatesByCabinId(cabinId) {
  const bookings = await request(
    `/bookings?cabinId=${cabinId}&fields=startDate,endDate,status&sort=startDate`,
    {
      cache: "no-store",
      forwardCookies: true,
    },
  );

  if (!Array.isArray(bookings)) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return bookings
    .filter((booking) => {
      const startDate = new Date(booking.startDate);

      return startDate >= today || booking.status === "checked-in";
    })
    .map((booking) =>
      eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      }),
    )
    .flat();
}

export async function getSettings() {
  return request("/settings", {
    next: { revalidate: 3600 },
  });
}

export async function getCountries() {
  if (!REST_COUNTRIES_API_KEY) {
    throw new Error("Missing REST_COUNTRIES_API_KEY");
  }

  try {
    const countries = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(
        `https://api.restcountries.com/countries/v5?limit=100&offset=${offset}&response_fields=names.common,codes.alpha_2`,
        {
          headers: {
            Authorization: `Bearer ${REST_COUNTRIES_API_KEY}`,
          },
          next: { revalidate: 86400 },
        },
      );

      if (!res.ok) {
        throw new Error(`Could not fetch countries: ${res.status}`);
      }

      const payload = await res.json();
      const objects = payload?.data?.objects;

      if (!Array.isArray(objects)) break;

      countries.push(...objects);
      hasMore = Boolean(payload?.data?.meta?.more);
      offset += 100;
    }

    return countries
      .map((country) => ({
        name: country.names?.common,
        flag: country.codes?.alpha_2
          ? `https://flags.restcountries.com/v5/w320/${country.codes.alpha_2.toLowerCase()}.png`
          : "",
      }))
      .filter((country) => country.name && country.flag)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    throw new Error(error.message || "Could not fetch countries");
  }
}

export async function createGuest(newGuest) {
  return request("/guests", {
    method: "POST",
    body: JSON.stringify(newGuest),
    forwardCookies: true,
  });
}

export async function createBooking(newBooking) {
  const booking = await request("/bookings", {
    method: "POST",
    body: JSON.stringify(newBooking),
    forwardCookies: true,
  });

  return normalizeBooking(booking);
}

export async function updateGuest(id, updatedFields) {
  return request(`/guests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updatedFields),
    forwardCookies: true,
  });

}

export async function updateCustomerProfile(data) {
  return request("/guests/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "X-Customer-API-Secret": process.env.CUSTOMER_API_SECRET,
    },
  });
}


export async function updateBooking(id, updatedFields) {
  const booking = await request(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updatedFields),
    forwardCookies: true,
  });

  return normalizeBooking(booking);
}

export async function deleteBooking(id) {
  return request(`/bookings/${id}`, {
    method: "DELETE",
    forwardCookies: true,
  });
}
