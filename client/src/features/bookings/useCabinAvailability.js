import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "./bookingsApi.js";

export default function useCabinAvailability(cabinId, excludeBookingId) {
  return useQuery({
    queryKey: ["cabin-availability", cabinId, excludeBookingId],
    queryFn: () => bookingsApi.getCabinAvailability(cabinId, excludeBookingId),
    select: (response) => response.data || [],
    enabled: Boolean(cabinId),
  });
}