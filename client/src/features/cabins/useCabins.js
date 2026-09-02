// useCabins.js


import { useQuery } from "@tanstack/react-query";
import { cabinsApi } from "./cabinsApi.js";
import toast from "react-hot-toast";

export default function useCabins() {
  return useQuery({
    queryKey: ["cabins"],
    queryFn: cabinsApi.getAllCabins,
    select: (response) => response.data,
    onSuccess: (data) => {
      toast.success("Cabins data fetched successfully:", data);
    },
    onError: (error) => {
      toast.error("Failed to fetch cabins data", error);
    },
    
  });
}
