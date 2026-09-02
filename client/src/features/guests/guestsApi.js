import { request } from "../../api.js";

export const guestsApi = {
  getAllGuests: () => request("/guests"),
};
