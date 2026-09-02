// useCreateCabin.js

import { useQueryClient , useMutation} from "@tanstack/react-query";
import { cabinsApi } from "./cabinsApi.js";
import toast from "react-hot-toast";

export default function useCreateCabin() {
   const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cabinsApi.createCabin,
    meta: { skipGlobalErrorToast: true },

    onSuccess: () => {
      toast.success("Cabin created successfully");
      queryClient.invalidateQueries({
        queryKey: ["cabins"],
      });
    },
    onError: (error) => {
      toast.error("Failed to create cabin", error);
    },
  });
}
