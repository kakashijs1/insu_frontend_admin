"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Shield, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createAdminUser } from "@/services/user";

export default function CreateUserPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"Employee" | "Super">("Employee");
  const [fullName, setFullName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !username || !password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    startTransition(async () => {
      const result = await createAdminUser({
        email,
        username,
        password,
        role,
        fullName: fullName || undefined,
      });

      if (!result.success) {
        setError(result.message ?? "สร้างเจ้าหน้าที่ไม่สำเร็จ");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/users/manage");
        }, 1500);
      }
    });
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto">
            <Shield size={32} className="text-success" />
          </div>
          <h2 className="text-xl font-bold text-text-dark">
            สร้างเจ้าหน้าที่สำเร็จ
          </h2>
          <p className="text-sm text-text-medium">
            กำลังไปหน้าจัดการเจ้าหน้าที่...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-border-light pb-6">
        <Link
          href="/admin/users/manage"
          className="p-2 bg-white border border-border-light rounded-xl text-text-light hover:text-primary transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-14 h-14 bg-text-dark rounded-2xl flex items-center justify-center text-white">
          <UserCog size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-dark">
            สร้าง User เจ้าหน้าที่ใหม่
          </h1>
          <p className="text-text-medium text-sm">
            กำหนดข้อมูลและสิทธิ์การเข้าถึงของเจ้าหน้าที่ภายใน
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-danger-light border border-danger/20 p-4">
          <AlertCircle size={18} className="text-danger shrink-0" />
          <p className="text-sm font-medium text-danger">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[2rem] border border-border-light shadow-sm p-8 space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 font-sans">
            <label className="text-xs font-bold text-text-light uppercase tracking-widest">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full p-3 bg-bg-light border border-border-light rounded-xl font-medium focus:border-teal focus:ring-4 focus:ring-teal/5 outline-none transition-all"
              required
            />
          </div>
          <div className="space-y-2 font-sans">
            <label className="text-xs font-bold text-text-light uppercase tracking-widest">
              Username <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin_staff_01"
              className="w-full p-3 bg-bg-light border border-border-light rounded-xl font-medium focus:border-teal focus:ring-4 focus:ring-teal/5 outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 font-sans">
            <label className="text-xs font-bold text-text-light uppercase tracking-widest">
              ชื่อ-สกุล
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="นายสมชาย ใจดี"
              className="w-full p-3 bg-bg-light border border-border-light rounded-xl font-medium focus:border-teal focus:ring-4 focus:ring-teal/5 outline-none transition-all"
            />
          </div>
          <div className="space-y-2 font-sans">
            <label className="text-xs font-bold text-text-light uppercase tracking-widest">
              Role / ตำแหน่ง <span className="text-danger">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "Employee" | "Super")}
              className="w-full p-3 bg-bg-light border border-border-light rounded-xl font-medium focus:border-teal focus:ring-4 focus:ring-teal/5 outline-none transition-all"
            >
              <option value="Employee">Employee (พนักงาน)</option>
              <option value="Super">Super Admin</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 font-sans">
            <label className="text-xs font-bold text-text-light uppercase tracking-widest">
              รหัสผ่าน <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              className="w-full p-3 bg-bg-light border border-border-light rounded-xl font-medium focus:border-teal focus:ring-4 focus:ring-teal/5 outline-none transition-all"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2 font-sans">
            <label className="text-xs font-bold text-text-light uppercase tracking-widest">
              ยืนยันรหัสผ่าน <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="w-full p-3 bg-bg-light border border-border-light rounded-xl font-medium focus:border-teal focus:ring-4 focus:ring-teal/5 outline-none transition-all"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-secondary transition-all disabled:opacity-50"
          >
            {isPending ? "กำลังสร้าง..." : "สร้างเจ้าหน้าที่"}
          </button>
          <Link
            href="/admin/users/manage"
            className="px-6 py-4 border border-border-light text-text-light rounded-2xl font-bold hover:bg-bg-light transition-all text-center"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}
