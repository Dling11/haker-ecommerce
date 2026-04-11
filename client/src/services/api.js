import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const persistedAuth = localStorage.getItem("haker-ecommerce-auth");

  if (persistedAuth) {
    const { token } = JSON.parse(persistedAuth);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
