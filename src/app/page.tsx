"use client";

import { motion } from "framer-motion";
import { Droplets, ArrowRight, ShieldCheck, Zap, BarChart } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        // Not logged in, stay on home
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [user, setUser]);
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-bold mb-8">
          <Droplets className="w-4 h-4" />
          <span>Hệ thống Quản lý Nước Thông minh v2.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Giải pháp quản lý <span className="gradient-text">Hóa đơn Nước</span> hiện đại
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Tự động hóa quy trình ghi chỉ số, tính toán hóa đơn và quản lý công nợ hộ dân với công nghệ Real-time và AI phát hiện bất thường.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href={user ? "/dashboard" : "/login"} 
            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 group"
          >
            {user ? "Vào Dashboard" : "Bắt đầu ngay"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/docs" 
            className="px-8 py-4 bg-card border border-border rounded-2xl font-bold text-lg hover:bg-accent transition-all"
          >
            Tài liệu hướng dẫn
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-8 glass-card rounded-3xl">
            <ShieldCheck className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Bảo mật tuyệt đối</h3>
            <p className="text-muted-foreground text-sm">Xác thực 2 lớp và quản lý quyền truy cập chi tiết cho từng nhân viên.</p>
          </div>
          <div className="p-8 glass-card rounded-3xl">
            <Zap className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Xử lý thần tốc</h3>
            <p className="text-muted-foreground text-sm">Backend Async với PostgreSQL tối ưu hóa cho hàng triệu bản ghi chỉ số.</p>
          </div>
          <div className="p-8 glass-card rounded-3xl">
            <BarChart className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Báo cáo chuyên sâu</h3>
            <p className="text-muted-foreground text-sm">Trực quan hóa doanh thu và cảnh báo rò rỉ nước tức thời.</p>
          </div>
        </div>
      </motion.div>

      <footer className="mt-24 text-sm text-muted-foreground">
        &copy; 2026 Water Billing Management System. All rights reserved.
      </footer>
    </div>
  );
}
