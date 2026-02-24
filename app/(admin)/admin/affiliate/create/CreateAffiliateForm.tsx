"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toResult } from "lyney";
import { createAffiliate } from "@/services/affiliate";
import {
  Mail,
  User,
  Phone,
  Building2,
  CreditCard,
  Percent,
  Hash,
} from "lucide-react";

export default function CreateAffiliateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    referralCode: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    commissionRate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (form.referralCode.length !== 6) {
      setError("รหัสแนะนำต้องมี 6 ตัวอักษร");
      setIsSubmitting(false);
      return;
    }

    const rate = parseFloat(form.commissionRate);
    if (isNaN(rate) || rate < 1 || rate > 20) {
      setError("ค่าคอมมิชชั่นต้องอยู่ระหว่าง 1-20%");
      setIsSubmitting(false);
      return;
    }

    const result = await toResult(
      createAffiliate({
        email: form.email,
        fullName: form.fullName,
        phone: form.phone,
        referralCode: form.referralCode,
        bankName: form.bankName,
        bankAccountNumber: form.bankAccountNumber,
        bankAccountName: form.bankAccountName,
        commissionRate: rate,
      }),
    );

    if (!result.ok || result.data.error) {
      setError(
        result.ok
          ? (result.data.error ?? "เกิดข้อผิดพลาด")
          : "เกิดข้อผิดพลาด กรุณาลองใหม่",
      );
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/affiliate");
    router.refresh();
  };

  const fields = [
    {
      name: "fullName",
      label: "ชื่อ-นามสกุล",
      type: "text",
      placeholder: "ชื่อจริง นามสกุล",
      icon: User,
      required: true,
    },
    {
      name: "email",
      label: "Email (ใช้เข้าสู่ระบบ)",
      type: "email",
      placeholder: "email@example.com",
      icon: Mail,
      required: true,
    },
    {
      name: "phone",
      label: "เบอร์โทรศัพท์",
      type: "tel",
      placeholder: "0812345678",
      icon: Phone,
      required: true,
    },
    {
      name: "referralCode",
      label: "รหัสแนะนำ (6 ตัว)",
      type: "text",
      placeholder: "ABC123",
      icon: Hash,
      required: true,
      maxLength: 6,
    },
    {
      name: "bankName",
      label: "ธนาคาร",
      type: "text",
      placeholder: "เช่น กสิกรไทย, กรุงเทพ",
      icon: Building2,
      required: true,
    },
    {
      name: "bankAccountNumber",
      label: "เลขบัญชี",
      type: "text",
      placeholder: "xxx-x-xxxxx-x",
      icon: CreditCard,
      required: true,
    },
    {
      name: "bankAccountName",
      label: "ชื่อบัญชี",
      type: "text",
      placeholder: "ชื่อตามบัญชีธนาคาร",
      icon: User,
      required: true,
    },
    {
      name: "commissionRate",
      label: "ค่าคอมมิชชั่น (%)",
      type: "number",
      placeholder: "1-20",
      icon: Percent,
      required: true,
      min: 1,
      max: 20,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        {error && (
          <div className="rounded-xl border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <div
              key={f.name}
              className={f.name === "email" ? "sm:col-span-2" : ""}
            >
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {f.label}
              </label>
              <div className="relative">
                <f.icon
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  required={f.required}
                  maxLength={f.maxLength}
                  min={f.min}
                  max={f.max}
                  value={form[f.name as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">รหัสผ่านเริ่มต้น:</span> Aa112233* —
            Affiliate จะต้องเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบครั้งแรก
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "กำลังสร้าง..." : "สร้าง Affiliate"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </form>
  );
}
