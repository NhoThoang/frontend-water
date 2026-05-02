import api from "@/lib/axios";
import { Bill } from "@/types";

export const billService = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get<Bill[]>(`/reports/unpaid`); // Using unpaid as a proxy for all if needed, or we can add a general bills route
    return response.data;
  },

  getUnpaid: async () => {
    const response = await api.get<Bill[]>("/reports/unpaid");
    return response.data;
  },

  getRevenueStats: async () => {
    const response = await api.get("/reports/revenue-stats");
    return response.data;
  }
};
