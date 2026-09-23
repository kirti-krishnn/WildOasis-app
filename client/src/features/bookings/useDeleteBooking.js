import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bookingsApi } from "./bookingsApi.js";

export default function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.deleteBooking,
    meta: { skipGlobalErrorToast: true },
    onSuccess: () => {
      toast.success("Booking deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.refetchQueries({ queryKey: ["bookings"], type: "active" });
      queryClient.invalidateQueries({ queryKey: ["cabin-availability"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["today-activity"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete booking");
    },
  });
}
