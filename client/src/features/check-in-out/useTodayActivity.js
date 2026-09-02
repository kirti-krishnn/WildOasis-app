import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "../bookings/bookingsApi.js";

export default function useTodayActivity() {
  return useQuery({
    queryKey: ["today-activity"],
    queryFn: bookingsApi.getStaysTodayActivity,
    select: (response) => response.data ?? [],
  });
}
