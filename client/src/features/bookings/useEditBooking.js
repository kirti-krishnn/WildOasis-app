import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bookingsApi } from "./bookingsApi.js";

export default function useEditBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => bookingsApi.updateBooking(id, payload),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (_data, variables) => {
      toast.success("Booking updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["cabin-availability"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["today-activity"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update booking");
    },
  });
}
