import api from "@/lib/axios";

export const uploadService = {
  uploadMeterImage: async (customerId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/uploads/meter-image/${customerId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // { image_path: "...", filename: "..." }
  },
};
