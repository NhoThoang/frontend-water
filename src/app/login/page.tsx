"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/lib/error";
import { showToast } from "@/lib/swal";
import { LogIn, User, Lock, Droplets, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.login({ username, password });

      // Get current user info after login (tokens are now in cookies)
      const user = await authService.getCurrentUser();
      setUser(user);

      showToast("success", `Chào mừng trở lại, ${user.username}!`);
      router.push("/dashboard");
    } catch (err: any) {
      setError(getErrorMessage(err, "Đăng nhập thất bại. Vui lòng kiểm tra lại."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 glass-card rounded-2xl z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
            <Droplets className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Water Billing</h1>
          <p className="text-muted mt-2">Hệ thống quản lý nước thông minh</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Tên đăng nhập hoặc Mã khách hàng</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="Nhập username hoặc mã KH"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-12 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-accent rounded-lg text-muted transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Đăng nhập
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted">
          &copy; 2026 Water App Backend. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
}
