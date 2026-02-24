import { WithPrisma } from "@/db";
import { toResult } from "lyney";
import { extractUserIdFromHeaders } from "@/utils/extract-token";
import { TERMINAL_STATUSES, ALLOWED_TRANSITIONS } from "@/types/quote";
import type { QuoteStatus } from "@/types/quote";

const QUOTE_STATUSES: readonly string[] = [
  "PENDING",
  "REVIEWING",
  "QUOTED",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
];

function toQuoteStatus(value: string): QuoteStatus | null {
  return QUOTE_STATUSES.includes(value) ? (value as QuoteStatus) : null;
}

interface ListQuotesParams {
  query: {
    page?: string;
    limit?: string;
    status?: string;
    referralCode?: string;
  };
  set: { status?: number | string };
}

interface QuoteByIdParams {
  params: { id: string };
  set: { status?: number | string };
}

interface ReviewQuoteParams {
  params: { id: string };
  headers: Record<string, string | undefined>;
  body: {
    insuranceCompany?: string;
    premiumAmount?: number;
    purchaseDate?: string;
    expiryDate?: string;
    paymentMethod?: "MOBILE_BANKING" | "QR_PROMPTPAY";
    paymentEvidence?: string;
    policyDocumentUrl?: string;
  };
  set: { status?: number | string };
}

interface UpdateStatusParams {
  params: { id: string };
  headers: Record<string, string | undefined>;
  body: {
    status:
      | "PENDING"
      | "REVIEWING"
      | "QUOTED"
      | "APPROVED"
      | "REJECTED"
      | "EXPIRED";
  };
  set: { status?: number | string };
}

const QUOTE_SELECT = {
  id: true,
  tier: true,
  brand: true,
  model: true,
  year: true,
  variant: true,
  firstName: true,
  lastName: true,
  phone: true,
  referralCode: true,
  status: true,
  insuranceCompany: true,
  premiumAmount: true,
  purchaseDate: true,
  expiryDate: true,
  paymentMethod: true,
  paymentEvidence: true,
  policyDocumentUrl: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },
  reviewedBy: {
    select: {
      id: true,
      username: true,
      email: true,
    },
  },
} as const;

export const listQuotes = async ({
  query,
  headers,
  prisma,
  set,
}: ListQuotesParams & {
  headers: Record<string, string | undefined>;
} & WithPrisma) => {
  const auth = await extractUserIdFromHeaders(headers);
  if (!auth.ok) {
    set.status = 401;
    return { success: false, message: "Unauthorized" };
  }

  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const where: Record<string, string> = {};
  if (query.status) {
    where.status = query.status;
  }
  if (query.referralCode) {
    where.referralCode = query.referralCode;
  }

  const [dataResult, countResult] = await Promise.all([
    toResult(
      prisma.quoteRequest.findMany({
        where,
        select: {
          ...QUOTE_SELECT,
          documents: {
            select: { id: true, type: true, fileName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ),
    toResult(prisma.quoteRequest.count({ where })),
  ]);

  if (!dataResult.ok || !countResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to fetch quotes" };
  }

  return {
    success: true,
    data: dataResult.data,
    pagination: {
      page,
      limit,
      total: countResult.data,
      totalPages: Math.ceil(countResult.data / limit),
    },
  };
};

export const getQuoteById = async ({
  params,
  headers,
  prisma,
  set,
}: QuoteByIdParams & {
  headers: Record<string, string | undefined>;
} & WithPrisma) => {
  const auth = await extractUserIdFromHeaders(headers);
  if (!auth.ok) {
    set.status = 401;
    return { success: false, message: "Unauthorized" };
  }

  const result = await toResult(
    prisma.quoteRequest.findUnique({
      where: { id: params.id },
      select: {
        ...QUOTE_SELECT,
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            cloudinaryUrl: true,
            mimeType: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "Failed to fetch quote" };
  }

  if (!result.data) {
    set.status = 404;
    return { success: false, message: "Quote not found" };
  }

  return { success: true, data: result.data };
};

export const reviewQuote = async ({
  params,
  headers,
  body,
  prisma,
  set,
}: ReviewQuoteParams & WithPrisma) => {
  const auth = await extractUserIdFromHeaders(headers);
  if (!auth.ok) {
    set.status = 401;
    return { success: false, message: "Unauthorized" };
  }
  const userId = auth.userId;

  const existing = await toResult(
    prisma.quoteRequest.findUnique({
      where: { id: params.id },
      select: { status: true },
    }),
  );

  if (!existing.ok || !existing.data) {
    set.status = 404;
    return { success: false, message: "Quote not found" };
  }

  const existingStatus = toQuoteStatus(existing.data.status);
  if (!existingStatus) {
    set.status = 400;
    return { success: false, message: "สถานะไม่ถูกต้อง" };
  }

  if (TERMINAL_STATUSES.includes(existingStatus)) {
    set.status = 400;
    return {
      success: false,
      message: "ไม่สามารถแก้ไขข้อมูลได้ สถานะนี้เป็นสถานะสุดท้าย",
    };
  }

  const updateData: Record<string, string | number | Date | null> = {
    reviewedById: userId,
    reviewedAt: new Date(),
  };

  if (body.insuranceCompany !== undefined)
    updateData.insuranceCompany = body.insuranceCompany;
  if (body.premiumAmount !== undefined)
    updateData.premiumAmount = body.premiumAmount;
  if (body.purchaseDate !== undefined)
    updateData.purchaseDate = new Date(body.purchaseDate);
  if (body.expiryDate !== undefined)
    updateData.expiryDate = new Date(body.expiryDate);
  if (body.paymentMethod !== undefined)
    updateData.paymentMethod = body.paymentMethod;
  if (body.paymentEvidence !== undefined)
    updateData.paymentEvidence = body.paymentEvidence;
  if (body.policyDocumentUrl !== undefined)
    updateData.policyDocumentUrl = body.policyDocumentUrl;

  const result = await toResult(
    prisma.quoteRequest.update({
      where: { id: params.id },
      data: updateData,
      select: QUOTE_SELECT,
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "Failed to update quote" };
  }

  return { success: true, data: result.data };
};

export const updateQuoteStatus = async ({
  params,
  headers,
  body,
  prisma,
  set,
}: UpdateStatusParams & WithPrisma) => {
  const auth = await extractUserIdFromHeaders(headers);
  if (!auth.ok) {
    set.status = 401;
    return { success: false, message: "Unauthorized" };
  }
  const userId = auth.userId;

  const existing = await toResult(
    prisma.quoteRequest.findUnique({
      where: { id: params.id },
      select: {
        status: true,
        paymentEvidence: true,
        policyDocumentUrl: true,
        referralCode: true,
        premiumAmount: true,
      },
    }),
  );

  if (!existing.ok || !existing.data) {
    set.status = 404;
    return { success: false, message: "Quote not found" };
  }

  const currentStatus = toQuoteStatus(existing.data.status);
  if (!currentStatus) {
    set.status = 400;
    return { success: false, message: "สถานะไม่ถูกต้อง" };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  if (!allowed.includes(body.status)) {
    set.status = 400;
    return {
      success: false,
      message: `ไม่สามารถเปลี่ยนจาก ${currentStatus} เป็น ${body.status} ได้`,
    };
  }

  if (body.status === "APPROVED") {
    const missing: string[] = [];
    if (!existing.data.paymentEvidence) missing.push("หลักฐานชำระเงิน");
    if (!existing.data.policyDocumentUrl) missing.push("ลิงก์กรมธรรม์");
    if (missing.length > 0) {
      set.status = 400;
      return {
        success: false,
        message: `ไม่สามารถอนุมัติได้ กรุณากรอก: ${missing.join(", ")}`,
      };
    }
  }

  const result = await toResult(
    prisma.quoteRequest.update({
      where: { id: params.id },
      data: {
        status: body.status,
        reviewedById: userId,
        reviewedAt: new Date(),
      },
      select: QUOTE_SELECT,
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "Failed to update status" };
  }

  if (
    body.status === "APPROVED" &&
    existing.data.referralCode &&
    existing.data.premiumAmount
  ) {
    const affiliate = await toResult(
      prisma.user.findUnique({
        where: {
          referralCode: existing.data.referralCode,
          role: "Affiliate",
          isActive: true,
        },
        select: { id: true, commissionRate: true },
      }),
    );

    if (affiliate.ok && affiliate.data && affiliate.data.commissionRate) {
      const commissionAmount =
        existing.data.premiumAmount * (affiliate.data.commissionRate / 100);

      await toResult(
        prisma.affiliateCommission.create({
          data: {
            quoteRequestId: params.id,
            affiliateId: affiliate.data.id,
            premiumAmount: existing.data.premiumAmount,
            commissionRate: affiliate.data.commissionRate,
            commissionAmount,
          },
        }),
      );
    }
  }

  return { success: true, data: result.data };
};

export const getQuoteStats = async ({
  headers,
  prisma,
  set,
}: {
  headers: Record<string, string | undefined>;
  set: { status?: number | string };
} & WithPrisma) => {
  const auth = await extractUserIdFromHeaders(headers);
  if (!auth.ok) {
    set.status = 401;
    return { success: false, message: "Unauthorized" };
  }

  const [totalResult, pendingResult, approvedResult, affiliateResult] =
    await Promise.all([
      toResult(prisma.quoteRequest.count()),
      toResult(prisma.quoteRequest.count({ where: { status: "PENDING" } })),
      toResult(prisma.quoteRequest.count({ where: { status: "APPROVED" } })),
      toResult(
        prisma.quoteRequest.count({
          where: { referralCode: { not: null } },
        }),
      ),
    ]);

  if (
    !totalResult.ok ||
    !pendingResult.ok ||
    !approvedResult.ok ||
    !affiliateResult.ok
  ) {
    set.status = 500;
    return { success: false, message: "Failed to fetch stats" };
  }

  return {
    success: true,
    data: {
      total: totalResult.data,
      pending: pendingResult.data,
      approved: approvedResult.data,
      fromAffiliate: affiliateResult.data,
    },
  };
};
