import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { bookingsApi } from "../bookings/bookingsApi.js";
import { subtractDays } from "./dateHelpers.js";

export default function useRecentStays() {
  const [searchParams] = useSearchParams();
  const numDays = Number(searchParams.get("last")) || 7;
  const queryDate = subtractDays(new Date(), numDays).toISOString();

  return useQuery({
    queryKey: ["stays", `last-${numDays}`],
    queryFn: () => bookingsApi.getStaysAfterDate(queryDate),
    select: (response) => {
      const stays = response.data ?? [];
      const confirmedStays = stays.filter(
        (stay) => stay.status === "checked-in" || stay.status === "checked-out",
      );

      return {
        stays,
        confirmedStays,
      };
    },
  });
}
