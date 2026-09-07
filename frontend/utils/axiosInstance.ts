import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
	(config) => {
		const storedToken = document.cookie.split('; ').find(row => row.startsWith('token='));
        const token = storedToken?.split('=')[1];

        console.log('Request Interceptor - Token:', token); // Debugging line to check token presence

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);


// Respose Interceptor
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			console.log('Unauthorized - login again');
		}

		return Promise.reject(error);
	},
);

export default api;