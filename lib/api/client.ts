import axios from "axios";

// Shared axios instance for every client-side call into our own /api
// routes. Relative baseURL means it works the same in dev and prod without
// an env var.
export const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});
