"use client";

import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "ทั้งหมด" },
  { value: "PENDING", label: "รอดำเนินการ" },
  { value: "REVIEWING", label: "กำลังตรวจสอบ" },
  { value: "QUOTED", label: "เสนอราคาแล้ว" },
  { value: "APPROVED", label: "อนุมัติ" },
  { value: "REJECTED", label: "ปฏิเสธ" },
  { value: "EXPIRED", label: "หมดอายุ" },
] as const;

interface QuoteFilterBarProps {
  currentStatus?: string;
}

export default function QuoteFilterBar({ currentStatus }: QuoteFilterBarProps) {
  const router = useRouter();

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    router.push(
      `/admin/quotes${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };

  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-border-light shadow-sm">
      <Filter size={18} className="text-text-light" />
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleStatusChange(opt.value)}
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
  );
}
