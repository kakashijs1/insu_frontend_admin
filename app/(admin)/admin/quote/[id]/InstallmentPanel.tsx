"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import Image from "next/image";
import { recordInstallmentPayment } from "@/services/quote";
import { z } from "zod";
import type { InstallmentPaymentItem } from "@/types/quote";
import Link from "next/link";

const UploadResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    cloudinaryUrl: z.string().url(),
    publicId: z.string().min(1),
    fileName: z.string(),
    mimeType: z.string(),
    fileSize: z.number(),
  }),
});

async function uploadEvidence(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/payment-evidence", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const json: unknown = await response.json();

  if (!response.ok) {
    throw new Error("อัพโหลดไฟล์ไม่สำเร็จ");
  }

  const parsed = UploadResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("รูปแบบข้อมูลจาก server ไม่ถูกต้อง");
  }

  return parsed.data.data.cloudinaryUrl;
}

interface InstallmentPanelProps {
  quoteId: string;
  premiumAmount: number;
  installmentPlan: number;
  installments: InstallmentPaymentItem[];
}

function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTHB(amount: number): string {
  return amount.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  });
}

const STATUS_MAP = {
  PENDING: {
    label: "รอชำระ",
    cls: "text-warning bg-warning-light",
    icon: Clock,
  },
  OVERDUE: {
    label: "เลยกำหนด",
    cls: "text-danger bg-danger-light",
    icon: AlertTriangle,
  },
  PAID: {
    label: "ชำระแล้ว",
    cls: "text-success bg-success-light",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "ยกเลิก",
    cls: "text-text-medium bg-bg-soft",
    icon: XCircle,
  },
} as const;

interface FormState {
  error?: string;
  success?: boolean;
}

export default function InstallmentPanel({
  quoteId,
  premiumAmount,
  installmentPlan,
  installments,
}: InstallmentPanelProps) {
  const router = useRouter();
  const totalPaid = installments.reduce((sum, i) => sum + i.amountPaid, 0);
  const remaining = premiumAmount - totalPaid;
  const paidCount = installments.filter((i) => i.status === "PAID").length;

  const [payingId, setPayingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const [formState, formAction, isPending] = useActionState(
    async (_prev: FormState | null, formData: FormData) => {
      const installmentId = String(formData.get("installmentId") ?? "");
      const amountPaidStr = String(formData.get("amountPaid") ?? "");
      const amountPaid = parseFloat(amountPaidStr);

      if (!installmentId || isNaN(amountPaid) || amountPaid <= 0) {
        return { error: "กรุณากรอกจำนวนเงินที่ถูกต้อง" };
      }

      let evidenceUrl: string | undefined;
      if (selectedFile) {
        try {
          evidenceUrl = await uploadEvidence(selectedFile);
        } catch {
          return { error: "อัพโหลดหลักฐานไม่สำเร็จ กรุณาลองใหม่" };
        }
      }

      const result = await recordInstallmentPayment(quoteId, installmentId, {
        amountPaid,
        paymentEvidence: evidenceUrl,
      });

      if (result.error) {
        return { error: result.error };
      }

      setPayingId(null);
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      router.refresh();
      return { success: true };
    },
    null,
  );

  return (
    <div className="bg-white rounded-2xl border border-border-light shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-secondary/10">
          <CreditCard size={20} className="text-secondary" />
        </div>
        <div>
          <h2 className="font-bold text-text-dark">
            ผ่อนชำระ {installmentPlan} งวด
          </h2>
          <p className="text-xs text-text-medium">0% ดอกเบี้ย</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-bg-light border border-border-light p-3 text-center">
          <p className="text-[10px] font-medium text-text-light uppercase">
            ยอดรวม
          </p>
          <p className="text-sm font-bold text-text-dark mt-0.5">
            {formatTHB(premiumAmount)}
          </p>
        </div>
        <div className="rounded-xl bg-success-light border border-success/20 p-3 text-center">
          <p className="text-[10px] font-medium text-success uppercase">
            จ่ายแล้ว
          </p>
          <p className="text-sm font-bold text-success mt-0.5">
            {formatTHB(totalPaid)}
          </p>
        </div>
        <div className="rounded-xl bg-warning-light border border-warning/20 p-3 text-center">
          <p className="text-[10px] font-medium text-warning uppercase">
            คงเหลือ
          </p>
          <p className="text-sm font-bold text-warning mt-0.5">
            {formatTHB(remaining)}
          </p>
        </div>
      </div>

      <div className="w-full bg-bg-soft rounded-full h-2">
        <div
          className="bg-success h-2 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, (totalPaid / premiumAmount) * 100)}%`,
          }}
        />
      </div>
      <p className="text-[11px] text-text-medium text-center">
        ชำระแล้ว {paidCount}/{installmentPlan} งวด
      </p>

      <div className="space-y-2">
        {installments.map((inst) => {
          const statusInfo = STATUS_MAP[inst.status];
          const StatusIcon = statusInfo.icon;
          const isPayingThis = payingId === inst.id;

          return (
            <div key={inst.id}>
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isPayingThis
                    ? "border-primary/30 bg-primary/5"
                    : "border-border-light"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-bg-light flex items-center justify-center text-xs font-bold text-text-dark">
                  {inst.installmentNumber}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-text-dark">
                      {formatTHB(inst.amountDue)}
                    </p>
                    {inst.status === "PAID" &&
                      inst.amountPaid !== inst.amountDue && (
                        <p className="text-[10px] text-text-medium">
                          (จ่ายจริง {formatTHB(inst.amountPaid)})
                        </p>
                      )}
                  </div>
                  <p className="text-[10px] text-text-light">
                    กำหนด {formatDate(inst.dueDate)}
                    {inst.paidAt && ` — ชำระ ${formatDate(inst.paidAt)}`}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.cls}`}
                >
                  <StatusIcon size={10} />
                  {statusInfo.label}
                </span>

                {(inst.status === "PENDING" || inst.status === "OVERDUE") && (
                  <button
                    type="button"
                    onClick={() => setPayingId(isPayingThis ? null : inst.id)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary text-white hover:bg-secondary transition"
                  >
                    {isPayingThis ? "ยกเลิก" : "บันทึก"}
                  </button>
                )}

                {inst.paymentEvidence && (
                  <Link
                    href={inst.paymentEvidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-border-light hover:border-primary/20 transition"
                  >
                    <Upload size={12} className="text-text-light" />
                  </Link>
                )}
              </div>

              {isPayingThis && (
                <form
                  action={formAction}
                  className="mt-2 p-3 rounded-xl bg-bg-light border border-border-light space-y-3"
                >
                  <input type="hidden" name="installmentId" value={inst.id} />

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-text-medium uppercase">
                      จำนวนเงิน (บาท)
                    </label>
                    <input
                      type="number"
                      name="amountPaid"
                      defaultValue={inst.amountDue}
                      step="0.01"
                      min="0.01"
                      className="w-full p-2 bg-white border border-border-light rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-text-medium uppercase">
                      หลักฐานชำระ
                    </label>

                    {previewUrl && selectedFile && (
                      <div className="relative rounded-lg border border-primary/20 overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt={selectedFile.name}
                          width={300}
                          height={200}
                          className="w-full h-auto max-h-32 object-contain bg-white"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => handleFileSelect(null)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-white/90 border border-border-light text-text-medium hover:text-danger transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    <label className="flex items-center justify-center gap-1.5 cursor-pointer w-full py-2 bg-white border border-border-light rounded-lg text-[10px] font-semibold text-text-medium hover:bg-bg-soft transition">
                      <Upload size={12} />
                      {selectedFile ? "เปลี่ยนรูป" : "เลือกรูป"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          handleFileSelect(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {formState?.error && (
                    <p className="text-[11px] text-danger font-medium">
                      {formState.error}
                    </p>
                  )}
                  {formState?.success && (
                    <p className="text-[11px] text-success font-medium">
                      บันทึกสำเร็จ
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-secondary transition disabled:opacity-50"
                  >
                    {isPending ? "กำลังบันทึก..." : "ยืนยันการชำระ"}
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
