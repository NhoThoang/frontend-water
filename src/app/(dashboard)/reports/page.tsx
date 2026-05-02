"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  Calendar,
  ChevronRight,
  Droplets,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";
import { reportService } from "@/services/report";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchReports = async () => {
      try {
        const data = await reportService.getRevenueStats();
        setRevenueData(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (user?.role !== "admin") {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <BarChart3 className="w-16 h-16 text-destructive opacity-20" />
        <h2 className="text-2xl font-bold">Truy cập bị từ chối</h2>
        <p className="text-muted-foreground">Bạn không có quyền truy cập vào trang báo cáo hệ thống.</p>
        <button onClick={() => router.push("/dashboard")} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Báo cáo & Thống kê</h2>
          <p className="text-muted-foreground mt-1">Phân tích dữ liệu sản lượng và doanh thu hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="p-8 glass-card rounded-2xl min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold">Doanh thu theo tháng</h3>
              <p className="text-sm text-muted-foreground">So sánh doanh thu dự kiến và thực thu</p>
            </div>
            <BarChart3 className="w-6 h-6 text-primary opacity-50" />
          </div>
          <div className="h-[350px] w-full relative min-w-0">
            {isClient && (
              <ResponsiveContainer width="100%" height="100%" key="revenue-report-chart">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '12px', 
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="total_billed" name="Dự kiến" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.3} />
                  <Bar dataKey="total_collected" name="Thực thu" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Growth Chart */}
        <div className="p-8 glass-card rounded-2xl min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold">Tăng trưởng sản lượng</h3>
              <p className="text-sm text-muted-foreground">Xu hướng tiêu thụ nước hàng tháng</p>
            </div>
            <TrendingUp className="w-6 h-6 text-emerald-500 opacity-50" />
          </div>
          <div className="h-[350px] w-full relative min-w-0">
            {isClient && (
              <ResponsiveContainer width="100%" height="100%" key="growth-report-chart">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '12px', 
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_billed" 
                    name="Sản lượng" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Hiệu suất thu hồi", value: "92.5%", icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Tiêu thụ bình quân", value: "18.2 m³", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Tỷ lệ thất thoát", value: "4.8%", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 glass-card rounded-2xl flex items-center gap-4"
          >
            <div className={cn("p-3 rounded-xl", item.bg)}>
              <item.icon className={cn("w-6 h-6", item.color)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{item.title}</p>
              <h4 className="text-2xl font-bold">{item.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
