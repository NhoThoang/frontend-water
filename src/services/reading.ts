import api from "@/lib/axios";
import { MeterReading, Bill } from "@/types";

export interface ReadingCreate {
  customer_id: number;
  reading: number;
  month: string;
  image_url?: string;
  note?: string;
}

export interface ReadingResponse {
  reading: MeterReading;
  bill: Bill;
}

export const readingService = {
  create: async (data: ReadingCreate) => {
    const response = await api.post<ReadingResponse>("/readings/", data);
    return response.data;
  },

  getAnomalies: async () => {
    const response = await api.get<MeterReading[]>("/readings/anomalies");
    return response.data;
  },

  getCustomerReadings: async (customerId: number) => {
    const response = await api.get<MeterReading[]>(`/readings/customer/${customerId}`);
    return response.data;
  },
  
  getMyReadings: async () => {
    const response = await api.get<MeterReading[]>("/readings/me");
    return response.data;
  },
};
