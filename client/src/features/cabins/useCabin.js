
import { useQuery } from "@tanstack/react-query";
import { cabinsApi } from "./cabinsApi.js";
import toast from "react-hot-toast";

export default function useCabin(cabinId) {
  return useQuery({
    queryKey: ["cabin", cabinId],
     queryFn: async () => {
      const response = await cabinsApi.getCabinById(cabinId);
      return response.data.data;
    },
    enabled: Boolean(cabinId),
    onSuccess: (data) => {
      toast.success("Cabin data fetched successfully:", data);
    },
    onError: (error) => {
      toast.error("Failed to fetch cabin data", error);
    },
   
  });
}

