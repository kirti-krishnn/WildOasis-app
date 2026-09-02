import { request } from "../../api.js";

export const settingsApi = {
  getSettings: () => request("/settings"),

  updateSettings: (payload) =>
    request("/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
