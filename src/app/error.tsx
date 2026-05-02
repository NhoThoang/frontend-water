"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.1),transparent_50%)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 space-y-8 glass-card p-12 rounded-[40px] max-w-lg border-destructive/20"
      >
        <div className="w-24 h-24 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto border border-destructive/20 shadow-2xl shadow-destructive/10">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Hệ thống gặp sự cố</h1>
          <p className="text-muted-foreground leading-relaxed">
            Đã có một lỗi xảy ra trong quá trình xử lý dữ liệu. Chúng mình rất tiếc về sự bất tiện này.
          </p>
          {error.message && (
             <div className="bg-destructive/5 p-3 rounded-xl text-xs text-destructive/70 font-mono mt-4 border border-destructive/10">
                {error.message}
             </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="w-full px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
          >
            <RefreshCw className="w-5 h-5" />
            Thử lại ngay
          </button>
          <Link
            href="/"
            className="w-full px-8 py-4 bg-accent text-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent/80 transition-all"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
