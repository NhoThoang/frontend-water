"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Droplets, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from "lucide-react";

import { useEffect, useState } from "react";
import { reportService } from "@/services/report";
import { useAuthStore } from "@/store/authStore";
import { DashboardSummary } from "@/types";
import { cn } from "@/lib/utils";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchDashboard = async () => {
      try {
        const summary = await reportService.getDashboardSummary();
        setData(summary);
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

        {/* Recent Activity */}
        <div className="p-8 glass-card rounded-2xl flex flex-col">
          <h3 className="text-xl font-bold mb-6">Hoạt động gần đây</h3>
          <div className="space-y-6 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {data?.recent_activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start">
                <div className={cn(
                  "w-2 h-2 mt-2 rounded-full shrink-0",
                  activity.type === "bill" ? "bg-primary" : "bg-amber-500"
                )} />
                <div>
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">{activity.time_ago}</p>
                </div>
              </div>
            ))}
            {data?.recent_activities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center mt-10">Chưa có hoạt động nào.</p>
            )}
          </div>
          <button className="w-full mt-6 text-sm font-semibold text-primary hover:underline">
            Xem tất cả hoạt động
          </button>
        </div>
      </div>
    </div>
  );
}
