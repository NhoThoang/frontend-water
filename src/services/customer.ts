import api from "@/lib/axios";
import { Customer } from "@/types";

export const customerService = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get<Customer[]>(`/customers/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  create: async (data: Partial<Customer>) => {
    const response = await api.post<Customer>("/customers/", data);
    return response.data;
  },

  uploadExcel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/users/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  update: async (id: number, data: Partial<Customer>) => {
    const response = await api.patch<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  exportExcel: async () => {
    const response = await api.get("/users/export", {
      responseType: "blob",
    });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};
