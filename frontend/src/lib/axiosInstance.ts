import axios from "axios";
import { getAuth } from "firebase/auth";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
    withCredentials: true,
})

// Request interceptor
api.interceptors.request.use(
    async (config: any) => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const token = await user.getIdToken(); // Firebase refreshes automatically
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized: token invalid/expired");
        }
        return Promise.reject(error);
    }
);

const JUDGE0_BASE_URL =
    import.meta.env.VITE_JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";

const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_KEY; // Only needed if using RapidAPI

export const axiosJudge0 = axios.create({
    baseURL: JUDGE0_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        ...(JUDGE0_API_KEY
            ? {
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                "X-RapidAPI-Key": JUDGE0_API_KEY,
            }
            : {}),
    },
});