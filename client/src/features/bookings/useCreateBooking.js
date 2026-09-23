import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bookingsApi } from "./bookingsApi.js";

export default function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.createBooking,
    meta: { skipGlobalErrorToast: true },
    onSuccess: () => {
      toast.success("Booking created successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.refetchQueries({ queryKey: ["bookings"], type: "active" });
      queryClient.invalidateQueries({ queryKey: ["cabin-availability"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["today-activity"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create booking");
    },
  });
}
