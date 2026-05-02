"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  User as UserIcon,
  Plus
} from "lucide-react";
import { paymentService } from "@/services/payment";
import { Payment } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdminOrWorker = user?.role === "admin" || user?.role === "worker";

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Backend filters automatically based on role for /history
        const data = await paymentService.getPaymentHistory();
        setPayments(data);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => 
    p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (isAdminOrWorker && p.bill?.id.toString().includes(searchTerm))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Lịch sử thanh toán</h2>
          <p className="text-muted-foreground mt-1">
            {isAdminOrWorker 
              ? "Theo dõi và quản lý tất cả giao dịch thanh toán tiền nước." 
              : "Theo dõi các giao dịch thanh toán của bạn."}
          </p>
        </div>

        {isAdminOrWorker && (
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            Ghi nhận thanh toán
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder={isAdminOrWorker ? "Tìm mã giao dịch, mã hóa đơn..." : "Tìm mã giao dịch..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-accent border border-border rounded-xl font-semibold hover:bg-accent/80 transition-all">
          <Filter className="w-5 h-5" />
          Bộ lọc
        </button>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/50 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="p-6 font-bold">Giao dịch</th>
                <th className="p-6 font-bold">Số tiền</th>
                <th className="p-6 font-bold">Ngày thanh toán</th>
                <th className="p-6 font-bold">Phương thức</th>
                <th className="p-6 font-bold">Trạng thái</th>
                <th className="p-6 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((payment, i) => (
                <motion.tr 
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-accent/30 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">#{payment.transaction_id || "N/A"}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hóa đơn #{payment.bill_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 font-bold text-primary">
                    {payment.amount.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="p-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4" />
                       {payment.payment_date ? new Date(payment.payment_date).toLocaleString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                      {payment.payment_method}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit",
                      payment.status === "completed" || payment.status === "success" 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : "bg-amber-500/10 text-amber-500"
                    )}>
                      {payment.status === "completed" || payment.status === "success" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {payment.status === "completed" || payment.status === "success" ? "Thành công" : "Chờ xử lý"}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-all">
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="p-20 text-center">
               <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-10 h-10 text-muted-foreground" />
               </div>
               <h3 className="text-xl font-bold">Chưa có giao dịch nào</h3>
               <p className="text-muted-foreground">Các giao dịch thanh toán sẽ xuất hiện tại đây.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
