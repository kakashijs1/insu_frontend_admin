"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { payCommission } from "@/services/affiliate";
import { CheckCircle } from "lucide-react";

interface AffiliateActionsProps {
  commissionId: string;
}

export default function AffiliateActions({
  commissionId,
}: AffiliateActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!evidenceUrl.trim()) {
      setError("กรุณากรอก URL หลักฐานการโอน");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await payCommission(commissionId, evidenceUrl.trim());

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsOpen(false);
    router.refresh();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary transition"
      >
        <CheckCircle size={12} />
        จ่ายค่าคอม
      </button>
    );
  }

  return (
    <div className="space-y-2 text-left">
      {error && <p className="text-xs text-danger">{error}</p>}
      <input
        type="url"
        placeholder="URL หลักฐานการโอน"
        value={evidenceUrl}
        onChange={(e) => {
          setEvidenceUrl(e.target.value);
          setError("");
        }}
        className="w-full rounded-lg border border-border-light px-3 py-1.5 text-xs text-text-dark placeholder:text-text-light focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal/20"
      />
      <div className="flex gap-1.5">
        <button
          onClick={handlePay}
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary transition disabled:opacity-50"
        >
          {isSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
        </button>
        <button
          onClick={() => {
            setIsOpen(false);
            setError("");
          }}
          className="rounded-lg border border-border-light px-3 py-1.5 text-xs font-semibold text-text-medium hover:bg-bg-light transition"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
