"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customer";
import { 
  Plus, 
  FileUp, 
  FileDown, 
  Search, 
  UserPlus,
  Phone,
  MapPin,
  Loader2,
  X,
  Save,
  Pencil,
  Trash2,
  Droplet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error";
import { showToast, showAlert } from "@/lib/swal";
import Dropdown from "@/components/shared/Dropdown";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function CustomersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isWorker = user?.role === "worker";

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    name: "",
    phone_number: "",
    address: "",
    meter_serial: "",
    customer_type: "residential",
    status: "active",
    email: "",
    area: "",
    password: ""
  });

  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll(),
  });

  const resetForm = () => {
    setFormData({ 
      customer_id: "",
      name: "", 
      phone_number: "",
      address: "", 
      meter_serial: "",
      customer_type: "residential", 
      status: "active",
      email: "",
      area: "",
      password: ""
    });
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => editingId 
      ? customerService.update(editingId, data) 
      : customerService.create(data),
    onSuccess: () => {
      setIsAddModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      showToast("success", editingId ? "Cập nhật thành công!" : "Thêm hộ dân thành công!");
    },
    onError: (err: any) => {
      showAlert("error", "Lỗi", getErrorMessage(err, "Lỗi thao tác"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      showToast("success", "Xóa khách hàng thành công!");
    },
    onError: (err: any) => {
      showAlert("error", "Lỗi", getErrorMessage(err, "Lỗi khi xóa khách hàng"));
    }
  });

  const handleEdit = (customer: any) => {
    setFormData({
      customer_id: customer.customer_id || "",
      name: customer.name,
      phone_number: customer.phone_number || "",
      address: customer.address,
      meter_serial: customer.meter_serial || "",
      customer_type: customer.customer_type,
      status: customer.status || "active",
      email: customer.email || "",
      area: customer.area || "",
      password: "" 
    });
    setEditingId(customer.id);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    showAlert("warning", "Xác nhận xóa", `Bạn có chắc chắn muốn xóa khách hàng ${name}? Điều này sẽ xóa cả tài khoản đăng nhập của họ.`, true)
      .then((result) => {
        if (result.isConfirmed) {
          deleteMutation.mutate(id);
        }
      });
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => customerService.uploadExcel(file),
    onSuccess: (data) => {
      showToast("success", `Đã tải lên thành công: ${data.created} tài khoản`);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => {
      showAlert("error", "Lỗi", "Lỗi khi tải lên file Excel");
    }
  });

  const handleExport = async () => {
    try {
      const blob = await customerService.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `danh_sach_khach_hang_${new Date().toLocaleDateString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      showToast("success", "Đã xuất file Excel");
    } catch (err) {
      showAlert("error", "Lỗi", "Lỗi khi xuất file Excel");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Danh sách hộ dân</h2>
          <p className="text-muted-foreground mt-1">Quản lý thông tin và tài khoản khách hàng.</p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-accent transition-all text-sm font-semibold"
              >
                <FileDown className="w-4 h-4" />
                Xuất Excel
              </button>
              
              <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-accent transition-all text-sm font-semibold cursor-pointer">
                <FileUp className="w-4 h-4" />
                Tải lên
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
              </label>

              <button 
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-semibold shadow-lg shadow-primary/20"
              >
                <UserPlus className="w-4 h-4" />
                Thêm hộ dân
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal (Only Admin can Edit/Create) */}
      <AnimatePresence>
        {isAddModalOpen && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-background border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-accent/30">
                <h3 className="text-xl font-bold">{editingId ? "Cập nhật thông tin" : "Thêm hộ dân mới"}</h3>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate(formData);
                }}
                className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">Mã khách hàng</label>
                    <input 
                      type="text"
                      value={formData.customer_id}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                      className="w-full bg-accent/20 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                      placeholder="VD: KH001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Tên khách hàng</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-accent/20 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Số điện thoại</label>
                    <input 
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full bg-accent/20 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="0987..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Số seri đồng hồ</label>
                    <input 
                      type="text"
                      value={formData.meter_serial}
                      onChange={(e) => setFormData({ ...formData, meter_serial: e.target.value })}
                      className="w-full bg-accent/20 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="SN-123456"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Địa chỉ</label>
                  <input 
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-accent/20 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Số 1, Đường ABC, Phường X..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Dropdown 
                      label="Loại hộ"
                      value={formData.customer_type}
                      onChange={(val) => setFormData({ ...formData, customer_type: val })}
                      options={[
                        { label: "Sinh hoạt", value: "residential" },
                        { label: "Kinh doanh", value: "business" }
                      ]}
                    />
                    <Dropdown 
                      label="Trạng thái"
                      value={formData.status}
                      onChange={(val) => setFormData({ ...formData, status: val })}
                      options={[
                        { label: "Đang hoạt động", value: "active" },
                        { label: "Tạm dừng", value: "suspended" }
                      ]}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Email</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-accent/20 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Khu vực / Tuyến</label>
                    <input 
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full bg-accent/20 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Khu A, Tuyến 1..."
                    />
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <label className="text-sm font-bold text-primary flex items-center gap-2">
                    {editingId ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu đăng nhập"}
                  </label>
                  <input 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border border-border rounded-xl font-bold hover:bg-accent transition-all"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Lưu thông tin
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
            placeholder="Tìm kiếm theo tên hoặc mã khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
        <Dropdown 
          className="md:w-64"
          options={[
            { label: "Tất cả khu vực", value: "all" },
            { label: "Khu vực A", value: "a" },
            { label: "Khu vực B", value: "b" }
          ]}
          value="all"
          onChange={() => {}}
        />

      </div>

      {/* Table */}
      <div className="glass-card rounded-[32px] overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/50 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="p-6 font-bold">Khách hàng</th>
                <th className="p-6 font-bold">Liên hệ</th>
                <th className="p-6 font-bold">Khu vực</th>
                <th className="p-6 font-bold">Số Serial</th>
                <th className="p-6 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-muted-foreground">Đang tải dữ liệu khách hàng...</p>
                  </td>
                </tr>
              ) : filteredCustomers?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <p className="text-muted-foreground">Không tìm thấy khách hàng nào.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers?.map((customer, i) => (
                  <motion.tr 
                    key={customer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-accent/30 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{customer.name}</p>
                          <p className="text-xs text-primary font-mono uppercase">{customer.customer_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          {customer.phone_number}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {customer.address}
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm text-muted-foreground">
                      {customer.area || "—"}
                    </td>
                    <td className="p-6 font-mono text-xs">
                      {customer.meter_serial || "—"}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Worker and Admin can go to Record Reading */}
                        {(isAdmin || isWorker) && (
                          <button 
                            onClick={() => router.push(`/readings?customerId=${customer.id}`)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all text-xs font-bold"
                            title="Ghi chỉ số"
                          >
                            <Droplet className="w-4 h-4" />
                            Ghi nước
                          </button>
                        )}
                        
                        {/* Only Admin can Edit/Delete */}
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => handleEdit(customer)}
                              className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-all"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(customer.id, customer.name)}
                              className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
