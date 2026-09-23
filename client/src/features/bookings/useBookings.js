import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bookingsApi } from "./bookingsApi.js";

export default function useBookings({
  filter = "all",
  page = 1,
  pageSize = 10,
  sortBy = "-startDate",
} = {}) {
  const queryClient = useQueryClient();
  const status = filter === "all" ? undefined : filter;
  const queryKey = ["bookings", status, sortBy, page, pageSize];

  const query = useQuery({
    queryKey,
    queryFn: () => bookingsApi.getAllBookings({
      limit: pageSize,
      page,
      status,
      sort: sortBy,
    }),
    refetchOnMount: "always",
    staleTime: 0,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch bookings");
    },
  });

  const totalResults = query.data?.totalResults ?? 0;
  const hasNextPage = page < Math.ceil(totalResults / pageSize);

  useEffect(() => {
    if (!hasNextPage) return;

    queryClient.prefetchQuery({
      queryKey: ["bookings", status, sortBy, page + 1, pageSize],
      queryFn: () => bookingsApi.getAllBookings({
        limit: pageSize,
        page: page + 1,
        status,
        sort: sortBy,
      }),
    });
  }, [hasNextPage, page, pageSize, queryClient, sortBy, status]);

  return query;
}
