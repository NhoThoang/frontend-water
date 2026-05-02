import api from "@/lib/axios";
import { DashboardSummary } from "@/types";

export const reportService = {
  getDashboardSummary: async () => {
    const response = await api.get<DashboardSummary>("/reports/dashboard-summary");
    return response.data;
  },
  
  getRevenueStats: async () => {
    const response = await api.get("/reports/revenue-stats");
    return response.data;
  }
};
