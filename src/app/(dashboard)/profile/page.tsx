"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Save,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: (user as any).name || "",
        email: (user as any).email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        password: "",
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Chỉ gửi những trường có thay đổi hoặc password nếu có nhập
      const updateData: any = { ...formData };
      if (!updateData.password) delete updateData.password;

      const updatedUser = await authService.updateProfile(updateData);
      setUser(updatedUser);
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Thông tin cá nhân đã được cập nhật!',
        timer: 2000,
        showConfirmButton: false,
        background: 'hsl(var(--card))',
        color: 'hsl(var(--foreground))',
      });
    } catch (error) {
      console.error("Update failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể cập nhật thông tin. Vui lòng thử lại sau.',
        background: 'hsl(var(--card))',
        color: 'hsl(var(--foreground))',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Hồ sơ cá nhân</h2>
        <p className="text-muted-foreground mt-1">Quản lý thông tin tài khoản và mật khẩu của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Avatar & Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1 space-y-6"
        >
          <div className="glass-card p-8 rounded-3xl text-center space-y-4">
            <div className="w-32 h-32 mx-auto rounded-full bg-primary/20 border-4 border-primary/30 flex items-center justify-center relative group">
              <UserIcon className="w-16 h-16 text-primary" />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Đổi ảnh</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">{user?.username}</h3>
              <p className="text-sm text-primary font-bold uppercase tracking-widest mt-1">{user?.role}</p>
            </div>
            {user?.customer_id && (
              <div className="bg-accent/30 rounded-xl p-3 text-xs">
                <p className="text-muted-foreground">Mã khách hàng</p>
                <p className="font-bold text-foreground mt-0.5">{user.customer_id}</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Trạng thái tài khoản
            </h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Xác thực:</span>
              <span className="text-emerald-500 font-medium">Đã xác thực</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Hoạt động:</span>
              <span className="text-emerald-500 font-medium">Đang hoạt động</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2"
        >
          <form onSubmit={handleUpdate} className="glass-card p-8 rounded-3xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" />
                  Họ và tên
                </label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-accent/20 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-accent/20 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Số điện thoại
              </label>
              <input 
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full bg-accent/20 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="09xx xxx xxx"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Địa chỉ
              </label>
              <input 
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-accent/20 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Số nhà, đường, phường, quận..."
              />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  Đổi mật khẩu
                </label>
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-accent/20 border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  placeholder="Để trống nếu không muốn đổi"
                />
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  Lưu ý: Sau khi đổi mật khẩu, bạn cần dùng mật khẩu mới cho lần đăng nhập sau.
                </p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
