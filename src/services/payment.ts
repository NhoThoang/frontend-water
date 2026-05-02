import api from "@/lib/axios";
import { Payment } from "@/types";

export const paymentService = {
  getPaymentHistory: async () => {
    const response = await api.get<Payment[]>("/payments/history");
    return response.data;
  },
  
  getMyPayments: async () => {
    const response = await api.get<Payment[]>("/payments/me");
    return response.data;
  },

  processWebhook: async (data: any) => {
    const response = await api.post("/payments/webhook/sepay", data);
    return response.data;
  }
};
