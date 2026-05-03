"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Droplets, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  History,
  Eye,
  Image as ImageIcon,
  X
} from "lucide-react";

import { useEffect, useState } from "react";
import { reportService } from "@/services/report";
import { readingService } from "@/services/reading";
import { useAuthStore } from "@/store/authStore";
import { DashboardSummary, MeterReading } from "@/types";
import { cn, getImageUrl } from "@/lib/utils";
import Dropdown from "@/components/shared/Dropdown";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const fetchDashboard = async () => {
      try {
        const [summary, myReadings] = await Promise.all([
          reportService.getDashboardSummary(),
          user?.role === "user" ? readingService.getMyReadings() : Promise.resolve([])
        ]);
        setData(summary);
        setReadings(myReadings);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "users": return Users;
      case "droplets": return Droplets;
      case "dollar": return DollarSign;
      case "alert": return AlertTriangle;
      default: return Users;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Chào buổi sáng, {user?.username}!</h2>
        <p className="text-muted-foreground mt-1">
          {user?.role === "user" 
            ? "Dưới đây là tóm tắt tài khoản nước của bạn." 
            : "Dưới đây là tóm tắt tình hình hệ thống hôm nay."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.stats.map((stat, i) => {
          const Icon = getIcon(stat.icon_type);
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 glass-card rounded-2xl group hover:border-primary/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl", stat.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  stat.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                )}>
                  {stat.change}
                  {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-8 glass-card rounded-2xl min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
             <div>
               <h3 className="text-xl font-bold">Sản lượng tiêu thụ</h3>
               <p className="text-sm text-muted-foreground">Thống kê 6 tháng gần nhất</p>
             </div>
             <div className="w-40">
               <Dropdown 
                  options={[
                    { label: "Năm 2026", value: "2026" },
                    { label: "Năm 2025", value: "2025" }
                  ]}
                  value="2026"
                  onChange={() => {}}
               />
             </div>
          </div>
          <div className="h-[350px] w-full relative min-w-0">
            {isClient && (
              <ResponsiveContainer width="100%" height="100%" key="revenue-chart">
                <AreaChart data={data?.consumption_history || []}>
                  <defs>
                    <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `${value}m³`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '12px', 
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCons)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Resident Reading History Table (Only for role "user") */}
      {user?.role === "user" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <History className="w-6 h-6 text-primary" />
                Lịch sử ghi chỉ số & Hình ảnh đối chiếu
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Dữ liệu chi tiết các tháng gần nhất của bạn.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="pb-4 font-bold">Kỳ hóa đơn</th>
                  <th className="pb-4 font-bold text-right">Số cũ (m³)</th>
                  <th className="pb-4 font-bold text-right">Số mới (m³)</th>
                  <th className="pb-4 font-bold text-right">Tiêu thụ (m³)</th>
                  <th className="pb-4 font-bold text-center">Ảnh xác thực</th>
                  <th className="pb-4 font-bold text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {readings.map((item) => (
                  <tr key={item.id} className="text-sm hover:bg-accent/30 transition-colors">
                    <td className="py-5 font-bold">Tháng {item.month}</td>
                    <td className="py-5 text-right text-muted-foreground">{item.previous_reading}</td>
                    <td className="py-5 text-right font-bold text-primary">{item.reading}</td>
                    <td className="py-5 text-right">
                      <span className="font-extrabold text-foreground">{Number(item.consumption.toFixed(2))} m³</span>
                    </td>
                    <td className="py-5 text-center">
                      {item.image_url ? (
                        <button 
                          onClick={() => setSelectedImage(getImageUrl(item.image_url))}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all text-xs font-bold"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          Xem ảnh
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Không có ảnh</span>
                      )}
                    </td>
                    <td className="py-5 text-right">
                      {item.is_anomaly ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-md border border-amber-500/20">BẤT THƯỜNG</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-md border border-emerald-500/20">BÌNH THƯỜNG</span>
                      )}
                    </td>
                  </tr>
                ))}
                {readings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground italic">
                      Bạn chưa có lịch sử ghi chỉ số nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedImage(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-primary transition-colors bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedImage} 
              alt="Meter Reading" 
              className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/10"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
