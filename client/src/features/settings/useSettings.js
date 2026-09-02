import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "./settingsApi.js";

export default function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.getSettings,
    select: (response) => response.data,
    retry: false,
  });
}
