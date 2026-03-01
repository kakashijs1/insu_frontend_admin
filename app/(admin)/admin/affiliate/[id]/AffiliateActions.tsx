"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { payCommission } from "@/services/affiliate";
import { CheckCircle, Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { z } from "zod";

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

interface AffiliateActionsProps {
  commissionId: string;
}

async function uploadSlip(file: File): Promise<string> {
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

export default function AffiliateActions({
  commissionId,
}: AffiliateActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("รองรับเฉพาะไฟล์ JPG และ PNG");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 10MB");
      return;
    }

    setError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePay = async () => {
    if (!selectedFile) {
      setError("กรุณาเลือกรูปสลิปการโอน");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const cloudinaryUrl = await uploadSlip(selectedFile);
      const result = await payCommission(commissionId, cloudinaryUrl);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      setIsOpen(false);
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      router.refresh();
    } catch {
      setError("อัพโหลดสลิปไม่สำเร็จ กรุณาลองใหม่");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError("");
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
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

      {previewUrl && selectedFile ? (
        <div className="relative rounded-xl border border-primary/20 overflow-hidden">
          <Image
            src={previewUrl}
            alt={selectedFile.name}
            width={200}
            height={150}
            className="w-full h-auto max-h-32 object-contain bg-bg-light"
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
      ) : (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border-light bg-bg-light/50 p-4">
          <div className="text-center">
            <ImageIcon size={20} className="mx-auto text-text-light" />
            <p className="text-[10px] text-text-medium mt-1">เลือกรูปสลิป</p>
          </div>
        </div>
      )}

      <label className="flex items-center justify-center gap-1.5 cursor-pointer w-full py-2 bg-bg-soft border border-border-light rounded-lg text-[11px] font-semibold text-text-medium hover:bg-muted transition">
        <Upload size={12} />
        {selectedFile ? "เปลี่ยนรูป" : "เลือกรูปสลิปการโอน"}
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
      <p className="text-[10px] text-text-light">
        รองรับ JPG, PNG ขนาดไม่เกิน 10MB
      </p>

      <div className="flex gap-1.5">
        <button
          onClick={handlePay}
          disabled={isSubmitting || !selectedFile}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary transition disabled:opacity-50"
        >
          {isSubmitting ? "กำลังอัพโหลด..." : "ยืนยันจ่าย"}
        </button>
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="rounded-lg border border-border-light px-3 py-1.5 text-xs font-semibold text-text-medium hover:bg-bg-light transition disabled:opacity-50"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
