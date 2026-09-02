import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bookingsApi } from "./bookingsApi.js";

export default function useBooking(bookingId) {
  return useQuery({
    queryKey: ["bookings", bookingId],
    queryFn: async () => {
      const response = await bookingsApi.getBookingById(bookingId);
      return response.data;
    },
    enabled: Boolean(bookingId),
    onError: (error) => {
      toast.error(error.message || "Failed to fetch booking");
    },
  });
}
