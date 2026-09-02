import { request } from "../../api.js";

export const dashboardApi = {
  getStats: (days) => request(`/dashboard/stats?days=${encodeURIComponent(days)}`),
};
