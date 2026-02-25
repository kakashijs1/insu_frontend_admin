"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Phone,
  Edit2,
  Trash2,
  Calendar,
  X,
  FileText,
} from "lucide-react";
import { updateCustomer, deleteCustomer } from "@/services/customer";

interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string | Date;
  _count: { quoteRequests: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Props {
  customers: Customer[];
  pagination: Pagination;
  initialSearch: string;
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

function formatPhone(phone: string): string {
  if (phone.length === 10) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  return phone;
}

export default function MembersEditClient({
  customers,
  pagination,
  initialSearch,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [error, setError] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/members/edit?search=${encodeURIComponent(search)}`);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setError("");
  }

  async function handleUpdate() {
    if (!editingCustomer) return;
    setError("");
    startTransition(async () => {
      const result = await updateCustomer(editingCustomer.id, {
        name: editName,
        phone: editPhone,
      });
      if (!result.success) {
        setError(result.message ?? "อัปเดตไม่สำเร็จ");
      } else {
        setEditingCustomer(null);
        router.refresh();
      }
    });
  }

  async function handleDelete() {
    if (!deletingCustomer) return;
    setError("");
    startTransition(async () => {
      const result = await deleteCustomer(deletingCustomer.id);
      if (!result.success) {
        setError(result.message ?? "ลบไม่สำเร็จ");
      } else {
        setDeletingCustomer(null);
        router.refresh();
      }
    });
  }

  function goToPage(page: number) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    router.push(`/admin/members/edit?${params.toString()}`);
  }

  return (
    <>
      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[1.5rem] border border-border-light shadow-sm"
      >
        <div className="relative flex-1 w-full font-sans">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาด้วยชื่อ หรือ เบอร์โทร..."
            className="w-full pl-12 pr-4 py-2.5 bg-bg-light border border-transparent rounded-xl focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/5 transition-all outline-none text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
        >
          ค้นหา
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-border-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-light/80 text-text-medium text-[11px] uppercase tracking-[0.1em] font-bold">
                <th className="px-6 py-4 border-b border-border-light">
                  สมาชิก
                </th>
                <th className="px-6 py-4 border-b border-border-light">
                  ใบเสนอราคา
                </th>
                <th className="px-6 py-4 border-b border-border-light">
                  วันที่สมัคร
                </th>
                <th className="px-6 py-4 border-b border-border-light text-right">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {customers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-bg-light/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-bg-light flex items-center justify-center text-text-medium font-bold group-hover:bg-primary group-hover:text-white transition-all">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-dark">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-text-light flex items-center gap-1">
                          <Phone size={10} /> {formatPhone(member.phone)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-text-medium">
                      <FileText size={14} className="text-text-light" />
                      {member._count.quoteRequests} รายการ
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-text-medium">
                      <Calendar size={14} className="text-text-light" />
                      {formatDate(member.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(member)}
                        className="p-2 text-text-light hover:text-primary hover:bg-white rounded-xl transition-all border border-transparent hover:border-border-light shadow-none hover:shadow-sm"
                        title="แก้ไข"
                        type="button"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingCustomer(member);
                          setError("");
                        }}
                        className="p-2 text-text-light hover:text-danger hover:bg-white rounded-xl transition-all border border-transparent hover:border-danger-light shadow-none hover:shadow-sm"
                        title="ลบ"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-text-medium"
                  >
                    ไม่พบข้อมูลสมาชิก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-bg-light/50 border-t border-border-light flex items-center justify-between text-xs font-medium text-text-light">
          <p>
            แสดง {customers.length} จาก {pagination.total} รายการสมาชิก
          </p>
          <div className="flex gap-2 font-sans">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 bg-white border border-border-light rounded-xl hover:bg-bg-light disabled:opacity-50 transition-colors"
              type="button"
            >
              ก่อนหน้า
            </button>
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 bg-white border border-border-light rounded-xl hover:bg-bg-light disabled:opacity-50 transition-colors"
              type="button"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-dark">
                แก้ไขข้อมูลลูกค้า
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-1 text-text-light hover:text-text-dark"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger-light rounded-xl p-3">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-medium uppercase tracking-wider">
                  ชื่อ
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 bg-bg-light border border-border-light rounded-xl text-sm focus:border-teal focus:ring-4 focus:ring-teal/5 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-medium uppercase tracking-wider">
                  เบอร์โทร
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-3 bg-bg-light border border-border-light rounded-xl text-sm focus:border-teal focus:ring-4 focus:ring-teal/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                disabled={isPending}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-all disabled:opacity-50"
                type="button"
              >
                {isPending ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                onClick={() => setEditingCustomer(null)}
                className="px-5 py-3 border border-border-light text-text-medium rounded-xl font-medium hover:bg-bg-light transition-all"
                type="button"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-5">
            <h3 className="text-lg font-bold text-text-dark">ยืนยันการลบ</h3>
            <p className="text-sm text-text-medium">
              ต้องการลบลูกค้า <strong>{deletingCustomer.name}</strong>{" "}
              ใช่หรือไม่? การลบจะไม่สามารถย้อนกลับได้
            </p>

            {error && (
              <p className="text-sm text-danger bg-danger-light rounded-xl p-3">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-3 bg-danger text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                type="button"
              >
                {isPending ? "กำลังลบ..." : "ลบ"}
              </button>
              <button
                onClick={() => setDeletingCustomer(null)}
                className="px-5 py-3 border border-border-light text-text-medium rounded-xl font-medium hover:bg-bg-light transition-all"
                type="button"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
