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
  }
};
