import { request } from "../../api.js";

export const bookingsApi = {
  getAllBookings: (params = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();

    return request(`/bookings${queryString ? `?${queryString}` : ""}`);
  },

  getBookingById: (id) => request(`/bookings/${id}`),

  getCabinAvailability: (cabinId, excludeBookingId) => request(
    `/bookings/availability/${cabinId}${excludeBookingId ? `?excludeBookingId=${encodeURIComponent(excludeBookingId)}` : ""}`,
  ),

  getBookingsAfterDate: (date) => request(`/bookings/after-date/${encodeURIComponent(date)}`),

  getStaysAfterDate: (date) => request(`/bookings/stays-after-date/${encodeURIComponent(date)}`),

  getStaysTodayActivity: () => request("/bookings/stays-today-activity"),

  createBooking: (payload) =>
    request("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateBooking: (id, payload) =>
    request(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteBooking: (id) =>
    request(`/bookings/${id}`, {
      method: "DELETE",
    }),
};
