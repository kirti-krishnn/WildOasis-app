import { eachDayOfInterval } from "date-fns";

import { notFound } from "next/navigation";

const SERVER_API_URL = process.env.SERVER_API_URL || "http://localhost:5000/api/v1";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${SERVER_API_URL}${path}`, {
    ...options,
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
   await new Promise((res) => globalThis.setTimeout(res, 2000));
  const cabins = await request(
   
    
    "/cabins?sort=name&fields=name,maxCapacity,regularPrice,discount,image",
    {
      next: { revalidate: 3600 },
    },
  );
  

  return Array.isArray(cabins) ? cabins.map(normalizeCabin) : [];

}

export async function getGuest(id) {
  return request(`/guests/${id}`, {
    cache: "no-store",
  });
}

export async function getBooking(id) {
  const booking = await request(`/bookings/${id}`, {
    cache: "no-store",
  });

  return normalizeBooking(booking);
}

export async function getBookings(guestId) {
  const bookings = await request(`/bookings?guestId=${guestId}&sort=startDate`, {
    cache: "no-store",
  });

  return Array.isArray(bookings) ? bookings.map(normalizeBooking) : [];
}

export async function getBookedDatesByCabinId(cabinId) {
  const bookings = await request(
    `/bookings?cabinId=${cabinId}&fields=startDate,endDate,status&sort=startDate`,
    {
      cache: "no-store",
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
  try {
    const res = await fetch("https://restcountries.com/v2/all?fields=name,flag");
    const countries = await res.json();

    return Array.isArray(countries) ? countries : [];
  } catch {
    throw new Error("Could not fetch countries");
  }
}

export async function createGuest(newGuest) {
  return request("/guests", {
    method: "POST",
    body: JSON.stringify(newGuest),
  });
}

export async function createBooking(newBooking) {
  const booking = await request("/bookings", {
    method: "POST",
    body: JSON.stringify(newBooking),
  });

  return normalizeBooking(booking);
}

export async function updateGuest(id, updatedFields) {
  return request(`/guests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updatedFields),
  });
}

export async function updateBooking(id, updatedFields) {
  const booking = await request(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updatedFields),
  });

  return normalizeBooking(booking);
}

export async function deleteBooking(id) {
  return request(`/bookings/${id}`, {
    method: "DELETE",
  });
}
