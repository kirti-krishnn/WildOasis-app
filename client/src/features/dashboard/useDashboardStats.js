import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { dashboardApi } from "./dashboardApi.js";

export default function useDashboardStats() {
  const [searchParams] = useSearchParams();
  const numDays = Number(searchParams.get("last")) || 7;

  return useQuery({
    queryKey: ["dashboard-stats", numDays],
    queryFn: () => dashboardApi.getStats(numDays),
    select: (response) => response.data,
  });
}
