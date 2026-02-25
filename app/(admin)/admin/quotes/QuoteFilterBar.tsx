"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, CreditCard } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "ทั้งหมด" },
  { value: "PENDING", label: "รอดำเนินการ" },
  { value: "REVIEWING", label: "กำลังตรวจสอบ" },
  { value: "QUOTED", label: "เสนอราคาแล้ว" },
  { value: "APPROVED", label: "อนุมัติ" },
  { value: "REJECTED", label: "ปฏิเสธ" },
  { value: "EXPIRED", label: "หมดอายุ" },
] as const;

const INSTALLMENT_OPTIONS = [
  { value: "", label: "ทั้งหมด" },
  { value: "true", label: "ผ่อนชำระ" },
  { value: "false", label: "จ่ายเต็ม" },
] as const;

interface QuoteFilterBarProps {
  currentStatus?: string;
  currentInstallment?: string;
}

export default function QuoteFilterBar({
  currentStatus,
  currentInstallment,
}: QuoteFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(
      `/admin/quotes${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-border-light shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <Filter size={18} className="text-text-light shrink-0" />
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFilter("status", opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                (currentStatus ?? "") === opt.value
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-white text-text-medium border-border-light hover:bg-bg-light"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <CreditCard size={18} className="text-text-light shrink-0" />
        <div className="flex flex-wrap gap-2">
          {INSTALLMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFilter("installment", opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                (currentInstallment ?? "") === opt.value
                  ? "bg-secondary/10 text-secondary border-secondary/20"
                  : "bg-white text-text-medium border-border-light hover:bg-bg-light"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
