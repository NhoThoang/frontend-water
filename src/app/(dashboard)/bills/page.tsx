"use client";

import { useQuery } from "@tanstack/react-query";
import { billService } from "@/services/bill";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Calendar,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { reportService } from "@/services/report";

export default function BillsPage() {
  const { data: bills, isLoading } = useQuery({
    queryKey: ["unpaid-bills"],
    queryFn: () => billService.getUnpaid(),
  });

  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => reportService.getDashboardSummary(),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" /> Đã thanh toán
          </div>
        );
      case "partial":
        return (
          <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
            <Clock className="w-3 h-3" /> Chờ xử lý
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
            <AlertCircle className="w-3 h-3" /> Chưa thanh toán
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Quản lý Hóa đơn</h2>
          <p className="text-muted-foreground mt-1">Theo dõi công nợ và tình trạng thanh toán hàng tháng.</p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20">
          <Download className="w-5 h-5" />
          Báo cáo công nợ
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 glass-card rounded-2xl border-l-4 border-l-destructive">
          <p className="text-sm text-muted-foreground font-medium mb-1">Tổng nợ chưa thu</p>
          <h3 className="text-2xl font-bold text-destructive">
            {summary?.bill_overview.total_unpaid.toLocaleString("vi-VN") || 0}đ
          </h3>
        </div>
        <div className="p-6 glass-card rounded-2xl border-l-4 border-l-amber-500">
          <p className="text-sm text-muted-foreground font-medium mb-1">Hóa đơn quá hạn</p>
          <h3 className="text-2xl font-bold text-amber-500">
            {summary?.bill_overview.unpaid_count || 0} hóa đơn
          </h3>
        </div>
        <div className="p-6 glass-card rounded-2xl border-l-4 border-l-emerald-500">
          <p className="text-sm text-muted-foreground font-medium mb-1">Đã thu trong tháng</p>
          <h3 className="text-2xl font-bold text-emerald-500">
            {summary?.bill_overview.total_collected.toLocaleString("vi-VN") || 0}đ
          </h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Tìm theo mã hóa đơn hoặc tên khách hàng..."
            className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-card border border-border rounded-xl hover:bg-accent transition-all flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" /> Tháng 05/2026
          </button>
          <button className="px-4 py-2 bg-card border border-border rounded-xl hover:bg-accent transition-all flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4" /> Lọc trạng thái
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/50 text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                <th className="p-4">Mã Hóa đơn</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4 text-right">Tiêu thụ</th>
                <th className="p-4 text-right">Tổng tiền</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Hạn thanh toán</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">Đang tải hóa đơn...</td>
                </tr>
              ) : bills?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">Không có hóa đơn nào.</td>
                </tr>
              ) : (
                bills?.map((bill, i) => (
                  <motion.tr 
                    key={bill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-accent/30 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs font-bold text-primary">
                      {bill.bill_number || `BILL-${bill.id}`}
                    </td>
                    <td className="p-4">
                       <p className="text-sm font-semibold">Khách hàng #{bill.customer_id}</p>
                       <p className="text-[10px] text-muted-foreground uppercase">Tháng {bill.month}</p>
                    </td>
                    <td className="p-4 text-right font-medium">{bill.consumption} m³</td>
                    <td className="p-4 text-right font-bold text-primary">
                      {bill.total_amount.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-4 flex justify-center">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(bill.due_date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors" title="Chi tiết">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-lg transition-colors" title="Tải PDF">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
