import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { settingsApi } from "./settingsApi.js";

export default function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateSettings,
    meta: { skipGlobalErrorToast: true },
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });
}
