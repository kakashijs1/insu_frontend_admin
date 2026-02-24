"use client";

import { useState, useActionState } from "react";
import { reviewQuote, updateQuoteStatus } from "@/services/quote";
import { useRouter } from "next/navigation";
import {
  Save,
  RefreshCw,
  Upload,
  X,
  ImageIcon,
  Lock,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import {
  ALLOWED_TRANSITIONS,
  TERMINAL_STATUSES,
  STATUS_CONFIG,
  PAYMENT_METHOD_LABELS,
} from "@/types/quote";
import type { QuoteStatus } from "@/types/quote";
import { z } from "zod";

const AdminSettableStatusSchema = z.enum([
  "PENDING",
  "REVIEWING",
  "QUOTED",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
]);

const PAYMENT_METHODS = [
  { value: "", label: "เลือกวิธีชำระเงิน" },
  ...Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
] as const;

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

interface QuoteReviewFormProps {
  quoteId: string;
  currentStatus: QuoteStatus;
  initialData: {
    insuranceCompany: string;
    premiumAmount: number;
    purchaseDate: string;
    expiryDate: string;
    paymentMethod: string;
    paymentEvidence: string;
    policyDocumentUrl: string;
  };
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

interface FormState {
  error?: string;
  success?: boolean;
  message?: string;
}

async function uploadPaymentEvidence(file: File): Promise<string> {
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

export default function QuoteReviewForm({
  quoteId,
  currentStatus,
  initialData,
}: QuoteReviewFormProps) {
  const router = useRouter();

  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
  const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState(initialData.paymentEvidence);

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

  const [reviewState, reviewAction, isReviewing] = useActionState(
    async (_prev: FormState | null, formData: FormData) => {
      const insuranceCompany = String(formData.get("insuranceCompany") ?? "");
      const premiumAmount = String(formData.get("premiumAmount") ?? "");
      const purchaseDate = String(formData.get("purchaseDate") ?? "");
      const expiryDate = String(formData.get("expiryDate") ?? "");
      const paymentMethod = String(formData.get("paymentMethod") ?? "");
      const policyDocumentUrl = String(formData.get("policyDocumentUrl") ?? "");

      let paymentEvidenceUrl = uploadedUrl;
      if (selectedFile) {
        try {
          paymentEvidenceUrl = await uploadPaymentEvidence(selectedFile);
        } catch {
          return { error: "อัพโหลดหลักฐานชำระเงินไม่สำเร็จ กรุณาลองใหม่" };
        }
      }

      const reviewData: Record<string, string | number> = {};
      if (insuranceCompany) reviewData.insuranceCompany = insuranceCompany;
      if (premiumAmount) reviewData.premiumAmount = parseFloat(premiumAmount);
      if (purchaseDate)
        reviewData.purchaseDate = new Date(purchaseDate).toISOString();
      if (expiryDate)
        reviewData.expiryDate = new Date(expiryDate).toISOString();
      if (paymentMethod) reviewData.paymentMethod = paymentMethod;
      if (paymentEvidenceUrl) reviewData.paymentEvidence = paymentEvidenceUrl;
      if (policyDocumentUrl) reviewData.policyDocumentUrl = policyDocumentUrl;

      const result = await reviewQuote(quoteId, reviewData);

      if (result.error) {
        return { error: result.error };
      }

      if (paymentEvidenceUrl) {
        setUploadedUrl(paymentEvidenceUrl);
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      router.refresh();
      return { success: true, message: "บันทึกข้อมูลสำเร็จ" };
    },
    null,
  );

  const [statusState, statusAction, isUpdatingStatus] = useActionState(
    async (_prev: FormState | null, formData: FormData) => {
      const status = String(formData.get("status") ?? "");
      if (!status) return { error: "กรุณาเลือกสถานะ" };

      const validStatuses = ALLOWED_TRANSITIONS[currentStatus] ?? [];
      const parsed = AdminSettableStatusSchema.safeParse(status);
      if (!parsed.success || !validStatuses.includes(parsed.data)) {
        return { error: "สถานะไม่ถูกต้อง" };
      }

      const result = await updateQuoteStatus(quoteId, parsed.data);

      if (result.error) {
        return { error: result.error };
      }

      router.refresh();
      return { success: true, message: "เปลี่ยนสถานะสำเร็จ" };
    },
    null,
  );

  const inputClass =
    "w-full p-3 bg-bg-light border border-border-light rounded-xl text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all";

  if (isTerminal) {
    return (
      <div className="bg-white rounded-2xl border border-border-light shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-bg-soft">
            <Lock size={20} className="text-text-medium" />
          </div>
          <div>
            <h2 className="font-bold text-text-dark">สถานะสุดท้าย</h2>
            <p className="text-xs text-text-medium">
              ไม่สามารถเปลี่ยนแปลงข้อมูลหรือสถานะได้
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-bg-light border border-border-light text-center">
          <span className="text-sm font-semibold text-text-dark">
            {STATUS_CONFIG[currentStatus]?.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form
        action={reviewAction}
        className="bg-white rounded-2xl border border-border-light shadow-sm p-6 space-y-5"
      >
        <h2 className="font-bold text-text-dark">ประเมินข้อมูล</h2>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-medium uppercase">
            บริษัทประกัน
          </label>
          <input
            type="text"
            name="insuranceCompany"
            defaultValue={initialData.insuranceCompany}
            placeholder="ชื่อบริษัทประกัน"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-medium uppercase">
            ราคาประกัน (บาท)
          </label>
          <input
            type="number"
            name="premiumAmount"
            defaultValue={initialData.premiumAmount || ""}
            placeholder="0.00"
            step="0.01"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-medium uppercase">
              วันที่ซื้อ
            </label>
            <input
              type="date"
              name="purchaseDate"
              defaultValue={formatDateForInput(initialData.purchaseDate)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-medium uppercase">
              วันหมดอายุ
            </label>
            <input
              type="date"
              name="expiryDate"
              defaultValue={formatDateForInput(initialData.expiryDate)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-medium uppercase">
            วิธีชำระเงิน
          </label>
          <select
            name="paymentMethod"
            defaultValue={initialData.paymentMethod}
            className={inputClass}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-medium uppercase">
            หลักฐานชำระเงิน
          </label>

          {uploadedUrl && !selectedFile && (
            <div className="relative rounded-xl border border-border-light overflow-hidden">
              <Image
                src={uploadedUrl}
                alt="หลักฐานชำระเงิน"
                width={400}
                height={300}
                className="w-full h-auto max-h-48 object-contain bg-bg-light"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setUploadedUrl("")}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/90 border border-border-light text-text-medium hover:text-danger transition"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {previewUrl && selectedFile && (
            <div className="relative rounded-xl border border-primary/20 overflow-hidden">
              <Image
                src={previewUrl}
                alt={selectedFile.name}
                width={400}
                height={300}
                className="w-full h-auto max-h-48 object-contain bg-bg-light"
                unoptimized
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-semibold">
                  ไฟล์ใหม่
                </span>
                <button
                  type="button"
                  onClick={() => handleFileSelect(null)}
                  className="p-1 rounded-full bg-white/90 border border-border-light text-text-medium hover:text-danger transition"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {!uploadedUrl && !previewUrl && (
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border-light bg-bg-light/50 p-6">
              <div className="text-center">
                <ImageIcon size={28} className="mx-auto text-text-light" />
                <p className="text-xs text-text-medium mt-2">ยังไม่มีไฟล์</p>
              </div>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 cursor-pointer w-full py-2.5 bg-bg-soft border border-border-light rounded-xl text-xs font-semibold text-text-medium hover:bg-muted transition">
            <Upload size={14} />
            {selectedFile ? "เปลี่ยนไฟล์" : "เลือกรูปหลักฐาน"}
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
          <p className="text-[11px] text-text-light">
            รองรับ JPG, PNG ขนาดไม่เกิน 10MB
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-medium uppercase">
            ไฟล์กรมธรรม์ (URL ของ PDF)
          </label>
          <input
            type="url"
            name="policyDocumentUrl"
            defaultValue={initialData.policyDocumentUrl}
            placeholder="https://drive.google.com/... หรือ URL ไฟล์ PDF"
            className={inputClass}
          />
          <p className="text-[11px] text-text-light">
            อัพโหลด PDF ไปที่ Google Drive / Cloud แล้ววาง URL ที่นี่
            ลูกค้าจะดาวน์โหลดได้
          </p>
        </div>

        {reviewState?.error && (
          <p className="text-sm text-danger font-medium">{reviewState.error}</p>
        )}
        {reviewState?.success && (
          <p className="text-sm text-success font-medium">
            {reviewState.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isReviewing}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isReviewing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save size={16} />
              บันทึกข้อมูล
            </>
          )}
        </button>
      </form>

      <form
        action={statusAction}
        className="bg-white rounded-2xl border border-border-light shadow-sm p-6 space-y-4"
      >
        <h2 className="font-bold text-text-dark">เปลี่ยนสถานะ</h2>

        {allowedNextStatuses.length > 0 ? (
          <>
            <div className="p-3 rounded-xl bg-bg-light border border-border-light">
              <p className="text-xs text-text-medium">
                สถานะปัจจุบัน:{" "}
                <span className="font-semibold text-text-dark">
                  {STATUS_CONFIG[currentStatus]?.label}
                </span>
              </p>
            </div>

            <select name="status" className={inputClass}>
              <option value="">เลือกสถานะใหม่</option>
              {allowedNextStatuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s]?.label}
                </option>
              ))}
            </select>

            {statusState?.error && (
              <p className="text-sm text-danger font-medium">
                {statusState.error}
              </p>
            )}
            {statusState?.success && (
              <p className="text-sm text-success font-medium">
                {statusState.message}
              </p>
            )}

            {allowedNextStatuses.includes("REJECTED") && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-light border border-warning/20">
                <AlertTriangle
                  size={14}
                  className="text-warning mt-0.5 shrink-0"
                />
                <p className="text-[11px] text-warning">
                  การปฏิเสธเป็นการดำเนินการถาวร ไม่สามารถเปลี่ยนกลับได้
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingStatus}
              className="w-full py-3 bg-text-dark text-white rounded-xl font-bold hover:bg-text-dark/90 transition-all disabled:opacity-50"
            >
              {isUpdatingStatus ? "กำลังอัปเดต..." : "อัปเดตสถานะ"}
            </button>
          </>
        ) : (
          <div className="p-3 rounded-xl bg-bg-light border border-border-light text-center">
            <p className="text-xs text-text-medium">
              ไม่มีสถานะที่สามารถเปลี่ยนได้
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
