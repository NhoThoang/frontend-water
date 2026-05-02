"use client";

import { motion } from "framer-motion";
import { Droplets, Home, ArrowLeft, Ghost } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10 space-y-8"
      >
        <div className="relative inline-block">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-32 h-32 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 backdrop-blur-xl border border-white/10"
          >
            <Ghost className="w-16 h-16 text-primary" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-primary/20 rounded-full blur-md"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-8xl font-black gradient-text tracking-tighter">404</h1>
          <h2 className="text-3xl font-bold text-foreground">Ối! Trang này biến mất rồi</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Có vẻ như đường dẫn bạn đang tìm kiếm đã bị rò rỉ đi đâu đó hoặc không còn tồn tại nữa. Đừng lo, hãy quay lại dòng chảy chính nhé!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-8 py-3 bg-accent text-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent/80 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Home className="w-5 h-5" />
            Về Dashboard
          </Link>
        </div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: i * 0.8,
          }}
          className="absolute w-2 h-2 bg-primary rounded-full hidden md:block"
          style={{
            left: `${15 + i * 15}%`,
            bottom: '10%',
          }}
        />
      ))}
    </div>
  );
}
