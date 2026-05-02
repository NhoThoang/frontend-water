import api from "@/lib/axios";
import { User } from "@/types";

export const userService = {
  getAll: async () => {
    const response = await api.get<User[]>("/users/");
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post<User>("/users/", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
