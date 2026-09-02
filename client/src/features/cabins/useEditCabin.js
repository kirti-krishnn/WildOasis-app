import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cabinsApi } from "./cabinsApi.js";
import toast from "react-hot-toast";

// UPDATE cabin
export default function useEditCabin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      cabinsApi.updateCabin(id, payload),

    onSuccess: (_data, variables) => {
      toast.success("Cabin updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["cabins"],
      });

      queryClient.invalidateQueries({
        queryKey: ["cabins", variables.id],
      });
    },
  });
}