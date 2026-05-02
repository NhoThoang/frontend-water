"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customer";
import { readingService } from "@/services/reading";
import { uploadService } from "@/services/upload";
import { 
  Camera, 
  Search, 
  Send, 
  AlertCircle, 
  CheckCircle2,
  Droplet,
  History,
  Info,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error";
import { showToast, showAlert } from "@/lib/swal";
import Dropdown from "@/components/shared/Dropdown";

export default function ReadingsPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [reading, setReading] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ["customers-lite"],
    queryFn: () => customerService.getAll(0, 1000),
  });

  const submitMutation = useMutation({
    mutation_fn: async (data: { customerId: number, reading: number, month: string, file?: File }) => {
      // 1. Upload image if exists
      if (data.file) {
        await uploadService.uploadMeterImage(data.customerId, data.file);
      }
      // 2. Submit reading
      return readingService.create({
        customer_id: data.customerId,
        reading: data.reading,
        month: data.month,
      });
    },
    onSuccess: (res) => {
      showToast("success", "Ghi chỉ số thành công! Hóa đơn đã được tạo.");
      setSelectedCustomerId(null);
      setReading("");
      setImageFile(null);
      setPreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    },
    onError: (err: any) => {
      showAlert("error", "Lỗi", getErrorMessage(err, "Lỗi khi ghi chỉ số."));
    }
  });

  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => reportService.getDashboardSummary(),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !reading) return;
    
    submitMutation.mutate({
      customerId: selectedCustomerId,
      reading: parseFloat(reading),
      month,
      file: imageFile || undefined
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Ghi chỉ số nước</h2>
          <p className="text-muted-foreground mt-1">Nhập chỉ số đồng hồ hàng tháng cho khách hàng.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-6">
          <div className="space-y-2">
            <Dropdown 
              label="Chọn khách hàng"
              placeholder="Tìm chọn khách hàng..."
              value={selectedCustomerId || ""}
              onChange={(val) => setSelectedCustomerId(Number(val))}
              options={customers?.map(c => ({
                label: `${c.name} (${c.customer_id})`,
                value: c.id
              })) || []}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Tháng ghi</label>
              <input 
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Chỉ số mới (m³)</label>
              <input 
                type="number"
                step="0.01"
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Ảnh chụp đồng hồ (MinIO)</label>
            <div 
              className={cn(
                "border-2 border-dashed border-border rounded-2xl h-48 flex flex-col items-center justify-center relative overflow-hidden transition-all",
                previewUrl ? "border-primary/50" : "hover:border-primary/30"
              )}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <label className="bg-white text-black px-4 py-2 rounded-lg cursor-pointer font-bold text-sm">
                      Đổi ảnh
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center cursor-pointer p-12 w-full">
                  <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">Nhấn để chụp hoặc chọn ảnh</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gửi và Lập hóa đơn
              </>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="text-amber-500" />
            Cảnh báo bất thường
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">Các trường hợp sản lượng tăng đột biến.</p>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
          {summary?.anomalies.map((anomaly, i) => (
            <motion.div 
              key={anomaly.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Info className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{anomaly.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Tháng {anomaly.month}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded">Bất thường</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Sản lượng tiêu thụ ({anomaly.consumption}m³) được đánh dấu là bất thường bởi hệ thống.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 text-xs font-bold py-2 bg-accent rounded-lg hover:bg-accent/70 transition-all">Kiểm tra rò rỉ</button>
                <button className="flex-1 text-xs font-bold py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all">Xác nhận</button>
              </div>
            </motion.div>
          ))}
          {summary?.anomalies.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">Không có cảnh báo rò rỉ nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
