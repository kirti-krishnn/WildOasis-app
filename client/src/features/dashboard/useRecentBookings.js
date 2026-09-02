import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { bookingsApi } from "../bookings/bookingsApi.js";
import { subtractDays } from "./dateHelpers.js";

export default function useRecentBookings() {
  const [searchParams] = useSearchParams();
  const numDays = Number(searchParams.get("last")) || 7;
  const queryDate = subtractDays(new Date(), numDays).toISOString();

  return useQuery({
    queryKey: ["bookings", `last-${numDays}`],
    queryFn: () => bookingsApi.getBookingsAfterDate(queryDate),
    select: (response) => response.data,
  });
}
