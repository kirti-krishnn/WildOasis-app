import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cabinsApi } from "./cabinsApi";
import toast from "react-hot-toast";

// DELETE cabin
export default function useDeleteCabin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cabinsApi.deleteCabin,
    meta: { skipGlobalErrorToast: true },

    onSuccess: () => {
      toast.success("Cabin deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["cabins"],
      });
    },
    onError: (error) => {
      toast.error("Failed to delete cabin", error);
    }
  });
}
