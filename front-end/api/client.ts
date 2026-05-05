import axios from "axios";

import { tokenStorage } from "../services/tokenStorage";

const API_URL = "http://localhost:8080";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  responseType: "json",
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
}

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefresh = await tokenStorage.getRefreshToken();
        if (!storedRefresh) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: storedRefresh,
        });

        const newTokens = data.data as {
          accessToken: string;
          refreshToken: string;
        };
        const user = await tokenStorage.getUser();
        await tokenStorage.saveAuth(newTokens, user);

        processQueue(null, newTokens.accessToken);
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await tokenStorage.clear();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
