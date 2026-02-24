"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-light">
          <AlertTriangle size={24} className="text-danger" />
        </div>
        <h2 className="text-lg font-bold text-text-dark mb-2">
          เกิดข้อผิดพลาด
        </h2>
        <p className="text-sm text-text-medium mb-6">
          {error.message || "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง"}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
        >
          <RefreshCw size={16} />
          ลองใหม่
        </button>
      </div>
    </div>
  );
}
