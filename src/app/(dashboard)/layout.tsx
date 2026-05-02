"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth";
import { 
  LayoutDashboard, 
  Users, 
  Droplet, 
  FileText, 
  CreditCard, 
  BarChart3, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          logout();
          router.push("/login");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [user, setUser, logout, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      // Vẫn logout ở client nếu server lỗi
      logout();
      router.push("/login");
    }
  };

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Khách hàng", icon: Users, href: "/customers", roles: ["admin", "worker"] },
    { title: "Nhân viên", icon: ShieldCheck, href: "/staff", roles: ["admin"] },
    { title: "Ghi nước", icon: Droplet, href: "/readings", roles: ["admin", "worker"] },
    { title: "Hóa đơn", icon: FileText, href: "/bills" },
    { title: "Thanh toán", icon: CreditCard, href: "/payments" },
    { title: "Báo cáo", icon: BarChart3, href: "/reports", roles: ["admin"] },
    { title: "Hồ sơ", icon: Users, href: "/profile" },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-card border-r border-border flex flex-col z-20 relative"
      >
        <div className={cn(
          "p-6 flex flex-col gap-6 transition-all",
          !isSidebarOpen && "px-4 py-8 items-center"
        )}>
          {/* Top Row: Toggle Button */}
          <div className={cn("flex", isSidebarOpen ? "justify-end" : "justify-center w-full")}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-primary/10 rounded-xl transition-all text-muted-foreground hover:text-primary group"
            >
              <div className="relative w-5 h-5">
                <motion.div
                  animate={{ rotate: isSidebarOpen ? 0 : 180, opacity: isSidebarOpen ? 1 : 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </motion.div>
                <motion.div
                  animate={{ rotate: isSidebarOpen ? -180 : 0, opacity: isSidebarOpen ? 0 : 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              </div>
            </button>
          </div>

          {/* Bottom Row: Logo Section */}
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "flex-col")}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg whitespace-nowrap bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                >
                  Water Billing
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all group relative",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-6 h-6 shrink-0", isActive && "text-primary")} />
                {isSidebarOpen && (
                  <span className="font-medium text-sm">{item.title}</span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all group relative"
          >
            <LogOut className="w-6 h-6 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Đăng xuất</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             Dashboard <ChevronRight className="w-4 h-4" /> 
             <span className="text-foreground font-medium">
               {menuItems.find(i => i.href === pathname)?.title || "Overview"}
             </span>
          </div>

          <Link href="/profile" className="flex items-center gap-4 hover:bg-accent/50 p-1.5 pr-3 rounded-2xl transition-all group">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold group-hover:text-primary transition-colors">{user?.username}</span>
              <span className="text-[10px] uppercase tracking-wider text-primary font-bold">{user?.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary group-hover:scale-105 transition-transform">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </Link>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
