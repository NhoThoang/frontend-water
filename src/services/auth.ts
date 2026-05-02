import api from "@/lib/axios";
import { AuthResponse, User } from "@/types";

export const authService = {
  login: async (loginData: any) => {
    const response = await api.post<AuthResponse>("/auth/login", loginData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  updateProfile: async (userData: any) => {
    const response = await api.patch<User>("/auth/me", userData);
    return response.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },
};
