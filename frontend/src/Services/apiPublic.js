// apiPublic.js  (no auth header)
import axios from "axios";

const apiPublic = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export default apiPublic;
