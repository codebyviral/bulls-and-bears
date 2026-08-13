// apiClient.js
import axios from "axios";
import apiPublic from "./apiPublic";
import { toast } from "react-toastify";
// import { getDecryptedToken } from "../utils/cryptoUtil";

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      toast.info("Session expired, logging out...");
      // Clear local user state
      localStorage.removeItem("authenticated-data-storage");
      // Redirect to login
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
    return Promise.reject(error);
  }
);

export default api;
