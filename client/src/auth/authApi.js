import { request } from "../api.js";

export const authApi = {
  login: (email, password) => request("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }),
  signup: (payload) => request("/users/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  logout: () => request("/users/logout"),
  me: () => request("/users/me"),
  updateMe: (payload) => request("/users/updateMe", {
    method: "PATCH",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  }),
  updatePassword: (payload) => request("/users/updatePassword", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
  forgotPassword: (email) => request("/users/forgotPassword", {
    method: "POST",
    body: JSON.stringify({ email }),
  }),
  resetPassword: (token, payload) => request(`/users/resetPassword/${token}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
};