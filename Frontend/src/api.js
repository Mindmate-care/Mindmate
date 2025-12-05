import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// ✅ Request Interceptor
API.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();

    // ✅ Allow public GET routes for games
    if (method === "get" && (url === "/games/all" || url.startsWith("/games/"))) {
      return config;
    }

    // ✅ Attach token for all other routes (chat, users, etc.)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

// 🚨 Response Interceptor — auto logout on expired/invalid token
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      console.warn("🔒 Token expired or invalid — logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // redirect to login page
    }
    return Promise.reject(error);
  }
);

export default API;
