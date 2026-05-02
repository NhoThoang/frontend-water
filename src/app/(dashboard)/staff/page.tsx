"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { 
  UserPlus, 
  Search, 
  Loader2, 
  X, 
  Save, 
  Shield,
  Phone,
  MapPin,
  Mail,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error";
import { showToast, showAlert } from "@/lib/swal";
import Dropdown from "@/components/shared/Dropdown";
import { User } from "@/types";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function StaffPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  if (user?.role !== "admin") {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <Shield className="w-16 h-16 text-destructive opacity-20" />
        <h2 className="text-2xl font-bold">Truy cập bị từ chối</h2>
        <p className="text-muted-foreground">Bạn không có quyền truy cập vào trang quản lý nhân viên.</p>
        <button onClick={() => router.push("/dashboard")} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">
          Quay lại Dashboard
        </button>
      </div>
    );
  }
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "worker",
    phone_number: "",
    address: "",
    is_active: 1
  });

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => userService.create(data),
    onSuccess: () => {
      setIsAddModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("success", "Thêm nhân viên thành công!");
    },
    onError: (err: any) => {
      showAlert("error", "Lỗi", getErrorMessage(err, "Lỗi khi thêm nhân viên"));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => userService.update(id, data),
    onSuccess: () => {
      setIsEditModalOpen(false);
      setEditingUser(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("success", "Cập nhật nhân viên thành công!");
    },
    onError: (err: any) => {
      showAlert("error", "Lỗi", getErrorMessage(err, "Lỗi khi cập nhật nhân viên"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("success", "Xóa nhân viên thành công!");
    },
    onError: (err: any) => {
      showAlert("error", "Lỗi", getErrorMessage(err, "Lỗi khi xóa nhân viên"));
    }
  });

  const resetForm = () => {
    setFormData({ 
      username: "", 
      password: "", 
      role: "worker",
      phone_number: "",
      address: "",
      is_active: 1
    });
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "", // Keep password empty unless changing
      role: user.role,
      phone_number: user.phone_number || "",
      address: user.address || "",
      is_active: user.is_active
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: number, username: string) => {
    showAlert("warning", "Xác nhận xóa", `Bạn có chắc chắn muốn xóa nhân viên ${username}?`, true)
      .then((result) => {
        if (result.isConfirmed) {
          deleteMutation.mutate(id);
        }
      });
  };

  // Only show staff (admin and worker)
  const staffUsers = users?.filter(u => u.role === "admin" || u.role === "worker");

  const filteredUsers = staffUsers?.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Quản lý Nhân viên</h2>
          <p className="text-muted-foreground mt-1">Quản lý tài khoản quản trị và nhân viên ghi nước.</p>
        </div>

        <button 
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-semibold shadow-lg shadow-primary/20"
        >
          <UserPlus className="w-4 h-4" />
          Thêm nhân viên
        </button>
      </div>

      {/* Add/Edit Staff Modal */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-background border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-accent/30">
                <h3 className="text-xl font-bold">
                  {isEditModalOpen ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
                </h3>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isEditModalOpen && editingUser) {
                    updateMutation.mutate({ id: editingUser.id, data: formData });
                  } else {
                    createMutation.mutate(formData);
                  }
                }}
                className="p-6 space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold">Tên đăng nhập</label>
                  <input 
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-accent/20 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="VD: worker_01"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Mật khẩu {isEditModalOpen && "(Để trống nếu không đổi)"}</label>
                  <input 
                    type="password"
                    required={!isEditModalOpen}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-accent/20 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <Dropdown 
                  label="Vai trò"
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val })}
                  options={[
                    { label: "Nhân viên (Worker)", value: "worker" },
                    { label: "Quản trị viên (Admin)", value: "admin" }
                  ]}
                />

                <div className="space-y-2">
                  <label className="text-sm font-bold">Số điện thoại</label>
                  <input 
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full bg-accent/20 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="09xx..."
                  />
                </div>

                {isEditModalOpen && (
                  <div className="flex items-center gap-2 py-2">
                    <input 
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active === 1}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 text-primary rounded border-border"
                    />
                    <label htmlFor="is_active" className="text-sm font-bold cursor-pointer">Tài khoản đang hoạt động</label>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 px-6 py-3 border border-border rounded-xl font-bold hover:bg-accent transition-all"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {isEditModalOpen ? "Cập nhật" : "Lưu tài khoản"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Tìm theo tên đăng nhập hoặc vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                <th className="p-4">Tên đăng nhập</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Liên hệ</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-muted-foreground">Đang tải danh sách nhân viên...</p>
                  </td>
                </tr>
              ) : filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">Không tìm thấy nhân viên nào.</td>
                </tr>
              ) : (
                filteredUsers?.map((u, i) => (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-accent/30 transition-colors group"
                  >
                    <td className="p-4 font-bold">{u.username}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-fit",
                        u.role === "admin" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {u.phone_number || "---"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={cn(
                        "flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-1 rounded-md w-fit",
                        u.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {u.is_active ? "Đang hoạt động" : "Đã khóa"}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(u)}
                            className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(u.id, u.username)}
                            className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
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
