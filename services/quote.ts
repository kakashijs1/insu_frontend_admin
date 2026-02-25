"use server";

import { api, getAuthHeaders } from "@/libs/api";
import { toResult } from "lyney";
import { parseApiError } from "@/utils/error";
import { z } from "zod";
import type { QuoteStatus, PaymentMethod } from "@/types/quote";

const QuoteCustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
});

const QuoteReviewerSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
});

const QuoteListItemSchema = z.object({
  id: z.string(),
  tier: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  variant: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  referralCode: z.string().nullable(),
  installmentPlan: z.number().nullable(),
  status: z.enum([
    "PENDING",
    "REVIEWING",
    "QUOTED",
    "APPROVED",
    "REJECTED",
    "EXPIRED",
    "CANCELLED",
  ]),
  insuranceCompany: z.string().nullable(),
  premiumAmount: z.number().nullable(),
  purchaseDate: z.union([z.string(), z.date()]).nullable(),
  expiryDate: z.union([z.string(), z.date()]).nullable(),
  paymentMethod: z.string().nullable(),
  paymentEvidence: z.string().nullable(),
  policyDocumentUrl: z.string().nullable(),
  reviewedAt: z.union([z.string(), z.date()]).nullable(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  customer: QuoteCustomerSchema,
  reviewedBy: QuoteReviewerSchema.nullable(),
  documents: z.array(
    z.object({ id: z.string(), type: z.string(), fileName: z.string() }),
  ),
});

const InstallmentPaymentSchema = z.object({
  id: z.string(),
  installmentNumber: z.number(),
  amountDue: z.number(),
  amountPaid: z.number(),
  dueDate: z.union([z.string(), z.date()]),
  paidAt: z.union([z.string(), z.date()]).nullable(),
  paymentEvidence: z.string().nullable(),
  status: z.enum(["PENDING", "OVERDUE", "PAID", "CANCELLED"]),
  recordedBy: z.object({ id: z.string(), username: z.string() }).nullable(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

const QuoteDetailSchema = QuoteListItemSchema.extend({
  documents: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      fileName: z.string(),
      cloudinaryUrl: z.string(),
      mimeType: z.string(),
      fileSize: z.number(),
      createdAt: z.union([z.string(), z.date()]),
    }),
  ),
  installments: z.array(InstallmentPaymentSchema),
});

const QuotePaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

const QuoteStatsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  approved: z.number(),
  fromAffiliate: z.number(),
});

type QuoteListItem = z.infer<typeof QuoteListItemSchema>;
type QuoteDetail = z.infer<typeof QuoteDetailSchema>;
type QuotePagination = z.infer<typeof QuotePaginationSchema>;
type QuoteStats = z.infer<typeof QuoteStatsSchema>;

interface QuoteListResult {
  data: QuoteListItem[];
  pagination: QuotePagination | null;
}

interface ReviewData {
  insuranceCompany?: string;
  premiumAmount?: number;
  purchaseDate?: string;
  expiryDate?: string;
  paymentMethod?: PaymentMethod;
  paymentEvidence?: string;
  policyDocumentUrl?: string;
}

interface MutationResult {
  success?: boolean;
  error?: string;
}

export async function getQuoteRequests(
  page = 1,
  status?: string,
  referralCode?: string,
  installment?: string,
): Promise<QuoteListResult> {
  const headers = await getAuthHeaders();
  const query: Record<string, string> = { page: String(page), limit: "20" };
  if (status) query.status = status;
  if (referralCode) query.referralCode = referralCode;
  if (installment) query.installment = installment;

  const result = await toResult(api.quote.get({ headers, query }));

  if (!result.ok) return { data: [], pagination: null };

  const { data, error } = result.data;
  if (error || !data) return { data: [], pagination: null };

  const parsed = z.array(QuoteListItemSchema).safeParse(data.data);
  const pagination = QuotePaginationSchema.safeParse(data.pagination);

  return {
    data: parsed.success ? parsed.data : [],
    pagination: pagination.success ? pagination.data : null,
  };
}

export async function getQuoteStats(): Promise<QuoteStats | null> {
  const headers = await getAuthHeaders();
  const result = await toResult(api.quote.stats.get({ headers }));

  if (!result.ok) return null;

  const { data, error } = result.data;
  if (error || !data) return null;

  const parsed = QuoteStatsSchema.safeParse(data.data);
  return parsed.success ? parsed.data : null;
}

export async function getQuoteDetail(id: string): Promise<QuoteDetail | null> {
  const headers = await getAuthHeaders();
  const result = await toResult(api.quote({ id }).get({ headers }));

  if (!result.ok) return null;

  const { data, error } = result.data;
  if (error || !data) return null;

  const parsed = QuoteDetailSchema.safeParse(data.data);
  return parsed.success ? parsed.data : null;
}

export async function reviewQuote(
  id: string,
  reviewData: ReviewData,
): Promise<MutationResult> {
  const headers = await getAuthHeaders();
  const result = await toResult(
    api.quote({ id }).review.put(reviewData, { headers }),
  );

  if (!result.ok) {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }

  const { error } = result.data;
  if (error) {
    const msg = parseApiError(error.value, "บันทึกข้อมูลไม่สำเร็จ");
    return { error: msg };
  }

  return { success: true };
}

type AdminSettableStatus = Exclude<QuoteStatus, "CANCELLED">;

export async function recordInstallmentPayment(
  quoteId: string,
  installmentId: string,
  data: { amountPaid: number; paymentEvidence?: string },
): Promise<MutationResult> {
  const headers = await getAuthHeaders();
  const result = await toResult(
    api
      .quote({ id: quoteId })
      .installment({ installmentId })
      .pay.put(data, { headers }),
  );

  if (!result.ok) {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }

  const { error } = result.data;
  if (error) {
    const msg = parseApiError(error.value, "บันทึกการชำระไม่สำเร็จ");
    return { error: msg };
  }

  return { success: true };
}

export async function updateQuoteStatus(
  id: string,
  status: AdminSettableStatus,
): Promise<MutationResult> {
  const headers = await getAuthHeaders();
  const result = await toResult(
    api.quote({ id }).status.put({ status }, { headers }),
  );

  if (!result.ok) {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }

  const { error } = result.data;
  if (error) {
    const msg = parseApiError(error.value, "เปลี่ยนสถานะไม่สำเร็จ");
    return { error: msg };
  }

  return { success: true };
}
