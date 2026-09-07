import axios from "axios";
import { clearAuthToken, getAuthToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
	(config) => {
    const token = getAuthToken();

		if (token) config.headers.Authorization = `Bearer ${token}`;
		return config;
	},
	(error) => Promise.reject(error),
);


// Respose Interceptor
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
      clearAuthToken();

      if (typeof window !== "undefined" && window.location.pathname !== "/signin") {
        window.location.assign("/signin");
      }
		}

		return Promise.reject(error);
	},
);

export default api;
