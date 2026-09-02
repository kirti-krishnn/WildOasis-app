import { useQuery } from "@tanstack/react-query";
import { guestsApi } from "./guestsApi.js";

export default function useGuests() {
  return useQuery({
    queryKey: ["guests"],
    queryFn: guestsApi.getAllGuests,
    select: (response) => response.data,
  });
}
