import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor - No longer needs manual token handling as we use HttpOnly cookies
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors (e.g., token expiration)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Tránh vòng lặp vô tận: nếu lỗi 401 xảy ra ở route login hoặc refresh
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Gọi API refresh (trình duyệt tự gửi refresh_token cookie)
        await api.post("/auth/refresh");
        
        // Nếu thành công (server đã set access_token cookie mới), thực hiện lại request cũ
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng lỗi (hết hạn hoàn toàn), chuyển về login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
