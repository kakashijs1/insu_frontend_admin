"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  UserPlus,
  Shield,
  ShieldCheck,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { deleteAdminUser, updateAdminUser } from "@/services/user";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Props {
  users: AdminUser[];
  currentUserId: string;
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

export default function UsersManageClient({ users, currentUserId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");

  const filtered = users.filter((u) => {
    const text = `${u.username} ${u.email} ${u.fullName || ""}`.toLowerCase();
    return text.includes(q.trim().toLowerCase());
  });

  function handleToggleActive(user: AdminUser) {
    startTransition(async () => {
      const result = await updateAdminUser(user.id, {
        isActive: !user.isActive,
      });
      if (result.success) {
        router.refresh();
      } else {
        setError(result.message ?? "อัปเดตไม่สำเร็จ");
      }
    });
  }

  async function handleDelete() {
    if (!deletingUser) return;
    setError("");
    startTransition(async () => {
      const result = await deleteAdminUser(deletingUser.id);
      if (!result.success) {
        setError(result.message ?? "ลบไม่สำเร็จ");
      } else {
        setDeletingUser(null);
        router.refresh();
      }
    });
  }

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[1.5rem] border border-border-light shadow-sm">
        <div className="relative flex-1 w-full font-sans">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light"
            size={18}
          />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหา: ชื่อ / อีเมล / ชื่อเต็ม"
            className="w-full pl-12 pr-4 py-2.5 bg-bg-light border border-transparent rounded-xl focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/5 transition-all outline-none text-sm"
          />
        </div>
        <Link
          href="/admin/users/create"
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-secondary transition-colors inline-flex items-center gap-2"
        >
          <UserPlus size={16} /> สร้างเจ้าหน้าที่ใหม่
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-danger-light border border-danger/20 p-4">
          <p className="text-sm font-medium text-danger">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-border-light shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light">
          <p className="font-bold text-text-dark">
            เจ้าหน้าที่ทั้งหมด{" "}
            <span className="font-normal text-text-medium text-sm">
              ({filtered.length} คน)
            </span>
          </p>
        </div>

        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-light/80 text-text-medium text-[11px] uppercase tracking-[0.1em] font-bold">
                <th className="px-6 py-4 border-b border-border-light">
                  เจ้าหน้าที่
                </th>
                <th className="px-6 py-4 border-b border-border-light">
                  อีเมล
                </th>
                <th className="px-6 py-4 border-b border-border-light">Role</th>
                <th className="px-6 py-4 border-b border-border-light">
                  สถานะ
                </th>
                <th className="px-6 py-4 border-b border-border-light">
                  วันที่สร้าง
                </th>
                <th className="px-6 py-4 border-b border-border-light text-right">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-bg-light/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-bg-light flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        {user.role === "Super" ? (
                          <ShieldCheck size={20} />
                        ) : (
                          <Shield size={20} />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-text-dark">
                          {user.fullName || user.username}
                        </span>
                        <p className="text-[11px] text-text-light">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-dark">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${
                        user.role === "Super"
                          ? "bg-primary/5 text-primary border-primary/15"
                          : "bg-bg-light text-text-dark border-border-light"
                      }`}
                    >
                      {user.role === "Super"
                        ? "Super Admin"
                        : user.role === "Employee"
                          ? "พนักงาน"
                          : user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${
                        user.isActive
                          ? "bg-success-light text-success border-success/20"
                          : "bg-danger-light text-danger border-danger/20"
                      }`}
                    >
                      {user.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-medium">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {user.id !== currentUserId && (
                        <>
                          <button
                            onClick={() => handleToggleActive(user)}
                            disabled={isPending}
                            className={`p-2 rounded-xl transition-all border border-transparent hover:border-border-light hover:shadow-sm ${
                              user.isActive
                                ? "text-success hover:text-warning"
                                : "text-text-light hover:text-success"
                            }`}
                            title={user.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                            type="button"
                          >
                            {user.isActive ? (
                              <ToggleRight size={20} />
                            ) : (
                              <ToggleLeft size={20} />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setDeletingUser(user);
                              setError("");
                            }}
                            className="p-2 text-text-light hover:text-danger hover:bg-white rounded-xl transition-all border border-transparent hover:border-danger-light hover:shadow-sm"
                            title="ลบ"
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      {user.id === currentUserId && (
                        <span className="text-xs text-text-light italic px-2 py-2">
                          (ฉัน)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-text-medium"
                  >
                    ไม่พบเจ้าหน้าที่
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-dark">ยืนยันการลบ</h3>
              <button
                onClick={() => setDeletingUser(null)}
                className="p-1 text-text-light hover:text-text-dark"
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-text-medium">
              ต้องการลบเจ้าหน้าที่{" "}
              <strong>{deletingUser.fullName || deletingUser.username}</strong>{" "}
              ({deletingUser.email}) ใช่หรือไม่?
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
                onClick={() => setDeletingUser(null)}
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
