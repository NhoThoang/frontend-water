"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customer";
import { readingService } from "@/services/reading";
import { uploadService } from "@/services/upload";
import { reportService } from "@/services/report";
import { 
  Camera, 
  Search, 
  Send, 
  AlertCircle, 
  CheckCircle2,
  Droplet,
  History,
  Info,
  Loader2,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error";
import { showToast, showAlert } from "@/lib/swal";
import Dropdown from "@/components/shared/Dropdown";
import { useSearchParams } from "next/navigation";

export default function ReadingsPage() {
  const searchParams = useSearchParams();
  const customerIdParam = searchParams.get("customerId");

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

  useEffect(() => {
    if (customerIdParam) {
      setSelectedCustomerId(Number(customerIdParam));
    }
  }, [customerIdParam]);

  const submitMutation = useMutation({
    mutationFn: async (data: { customerId: number, reading: number, month: string, file?: File }) => {
      let image_url = undefined;
      // 1. Upload image if exists
      if (data.file) {
        const uploadRes = await uploadService.uploadMeterImage(data.customerId, data.file);
        image_url = uploadRes.image_url;
      }
      // 2. Submit reading
      return readingService.create({
        customer_id: data.customerId,
        reading: data.reading,
        month: data.month,
        image_url: image_url,
      });
    },
    onSuccess: () => {
      showToast("success", "Ghi chỉ số thành công! Hóa đơn đã được tạo.");
      setSelectedCustomerId(null);
      setReading("");
      setImageFile(null);
      setPreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
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

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["readings", selectedCustomerId],
    queryFn: () => readingService.getCustomerReadings(selectedCustomerId!),
    enabled: !!selectedCustomerId,
  });

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

  const getStatusBadge = (isAnomaly: boolean) => {
    if (isAnomaly) return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-md border border-amber-500/20">BẤT THƯỜNG</span>;
    return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-md border border-emerald-500/20">BÌNH THƯỜNG</span>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Ghi chỉ số nước</h2>
          <p className="text-muted-foreground mt-1 font-medium">Nhập chỉ số đồng hồ và tải ảnh xác thực.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-[32px] space-y-6 border-border/50">
          <div className="space-y-2">
            <Dropdown 
              label="Tìm hộ dân"
              placeholder="Nhập tên hoặc mã hộ dân..."
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
              <label className="text-sm font-bold ml-1">Kỳ hóa đơn</label>
              <input 
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-accent/20 border border-border rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Chỉ số mới (m³)</label>
              <input 
                type="number"
                step="0.01"
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                className="w-full bg-accent/20 border border-border rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-lg font-bold"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Ảnh chụp hiện trường</label>
            <div 
              className={cn(
                "border-2 border-dashed border-border rounded-[24px] h-56 flex flex-col items-center justify-center relative overflow-hidden transition-all bg-accent/10",
                previewUrl ? "border-primary/50" : "hover:border-primary/30"
              )}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <label className="bg-white text-black px-5 py-2.5 rounded-xl cursor-pointer font-bold text-sm shadow-xl">
                      Thay đổi ảnh
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center cursor-pointer p-12 w-full h-full justify-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-3">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground font-bold">Chụp ảnh đồng hồ</p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Hỗ trợ JPG, PNG, HEIC</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/25 active:scale-[0.98]"
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Xác nhận và Tạo hóa đơn
              </>
            )}
          </button>
        </form>

        {/* Lịch sử ghi số của khách hàng đã chọn */}
        {selectedCustomerId && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-[32px] border-border/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Lịch sử ghi số
              </h3>
              {isLoadingHistory && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="pb-3 font-bold">Tháng</th>
                    <th className="pb-3 font-bold text-right">Số cũ</th>
                    <th className="pb-3 font-bold text-right">Số mới</th>
                    <th className="pb-3 font-bold text-right">Tiêu thụ</th>
                    <th className="pb-3 font-bold text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history?.map((item) => (
                    <tr key={item.id} className="text-sm group hover:bg-accent/5 transition-colors">
                      <td className="py-4 font-bold">{item.month}</td>
                      <td className="py-4 text-right font-medium text-muted-foreground">{item.previous_reading}</td>
                      <td className="py-4 text-right font-bold text-primary">{item.reading}</td>
                      <td className="py-4 text-right">
                        <span className="font-extrabold text-foreground">{item.consumption}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">m³</span>
                      </td>
                      <td className="py-4 text-right">
                        {getStatusBadge(item.is_anomaly)}
                      </td>
                    </tr>
                  ))}
                  {history?.length === 0 && !isLoadingHistory && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-muted-foreground text-xs italic">
                        Chưa có lịch sử ghi số cho khách hàng này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="text-amber-500 w-6 h-6" />
              Cần kiểm tra
            </h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Các trường hợp tiêu thụ bất thường.</p>
          </div>
          <History className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[650px] pr-2 custom-scrollbar">
          {summary?.anomalies.map((anomaly, i) => (
            <motion.div 
              key={anomaly.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 rounded-[24px] border-l-4 border-l-amber-500 shadow-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Info className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{anomaly.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Tháng {anomaly.month}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-lg uppercase">Bất thường</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed font-medium">
                Sản lượng tiêu thụ (<span className="text-amber-500 font-bold">{anomaly.consumption}m³</span>) tăng đột biến so với trung bình.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 text-xs font-bold py-2.5 bg-accent rounded-xl hover:bg-accent/70 transition-all">Kiểm tra rò rỉ</button>
                <button className="flex-1 text-xs font-bold py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Xác nhận</button>
              </div>
            </motion.div>
          ))}
          {summary?.anomalies.length === 0 && (
            <div className="p-20 text-center glass-card rounded-[32px] border-dashed">
               <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-20" />
               <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Hệ thống ổn định</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
