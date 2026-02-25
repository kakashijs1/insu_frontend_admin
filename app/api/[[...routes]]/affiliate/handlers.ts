import { WithPrisma } from "@/db";
import {
  requireSuper,
  requireAdmin,
  requireAffiliate,
} from "@/utils/require-auth";
import { toResult } from "lyney";
import argon2 from "argon2";
import { env } from "@/config/env";

interface AuthedHeaders {
  headers: Record<string, string | undefined>;
  set: { status?: number | string };
}
interface CreateAffiliateParams extends AuthedHeaders {
  body: {
    email: string;
    fullName: string;
    phone: string;
    referralCode: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
    commissionRate: number;
  };
}

export const createAffiliate = async ({
  headers,
  body,
  prisma,
  set,
}: CreateAffiliateParams & WithPrisma) => {
  const auth = await requireSuper(headers, set);
  if (!auth.ok) return auth.response;

  const existingEmail = await toResult(
    prisma.user.findUnique({ where: { email: body.email.trim() } }),
  );
  if (!existingEmail.ok) {
    set.status = 500;
    return { success: false, message: "Internal server error" };
  }
  if (existingEmail.data) {
    set.status = 409;
    return { success: false, message: "Email นี้มีผู้ใช้แล้ว" };
  }

  const existingCode = await toResult(
    prisma.user.findUnique({
      where: { referralCode: body.referralCode.trim().toUpperCase() },
    }),
  );
  if (!existingCode.ok) {
    set.status = 500;
    return { success: false, message: "Internal server error" };
  }
  if (existingCode.data) {
    set.status = 409;
    return { success: false, message: "รหัสแนะนำนี้มีผู้ใช้แล้ว" };
  }

  const hashResult = await toResult(
    argon2.hash(env.DEFAULT_AFFILIATE_PASSWORD),
  );
  if (!hashResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to create affiliate" };
  }

  const result = await toResult(
    prisma.user.create({
      data: {
        username: body.fullName.trim(),
        email: body.email.trim(),
        password: hashResult.data,
        role: "Affiliate",
        referralCode: body.referralCode.trim().toUpperCase(),
        fullName: body.fullName.trim(),
        phone: body.phone.trim(),
        bankName: body.bankName.trim(),
        bankAccountNumber: body.bankAccountNumber.trim(),
        bankAccountName: body.bankAccountName.trim(),
        commissionRate: body.commissionRate,
        passwordChanged: false,
      },
      omit: { password: true },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "Failed to create affiliate" };
  }

  set.status = 201;
  return { success: true, data: result.data };
};

export const listAffiliates = async ({
  headers,
  query,
  prisma,
  set,
}: AuthedHeaders & {
  query: { page?: string; limit?: string };
} & WithPrisma) => {
  const auth = await requireAdmin(headers, set);
  if (!auth.ok) return auth.response;

  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    toResult(
      prisma.user.findMany({
        where: { role: "Affiliate" },
        omit: { password: true },
        include: {
          _count: { select: { commissions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ),
    toResult(prisma.user.count({ where: { role: "Affiliate" } })),
  ]);

  if (!dataResult.ok || !countResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to fetch affiliates" };
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

export const getAffiliateById = async ({
  headers,
  params,
  prisma,
  set,
}: AuthedHeaders & { params: { id: string } } & WithPrisma) => {
  const auth = await requireAdmin(headers, set);
  if (!auth.ok) return auth.response;

  const result = await toResult(
    prisma.user.findUnique({
      where: { id: params.id, role: "Affiliate" },
      omit: { password: true },
      include: {
        commissions: {
          select: {
            id: true,
            premiumAmount: true,
            commissionRate: true,
            commissionAmount: true,
            status: true,
            paymentEvidence: true,
            paidAt: true,
            paidById: true,
            createdAt: true,
            quoteRequest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                brand: true,
                model: true,
                year: true,
                tier: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "Failed to fetch affiliate" };
  }

  if (!result.data) {
    set.status = 404;
    return { success: false, message: "Affiliate not found" };
  }

  return { success: true, data: result.data };
};

interface UpdateAffiliateParams extends AuthedHeaders {
  params: { id: string };
  body: {
    fullName?: string;
    phone?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    commissionRate?: number;
    isActive?: boolean;
  };
}

export const updateAffiliate = async ({
  headers,
  params,
  body,
  prisma,
  set,
}: UpdateAffiliateParams & WithPrisma) => {
  const auth = await requireAdmin(headers, set);
  if (!auth.ok) return auth.response;

  const existing = await toResult(
    prisma.user.findUnique({
      where: { id: params.id, role: "Affiliate" },
      select: { id: true },
    }),
  );

  if (!existing.ok || !existing.data) {
    set.status = 404;
    return { success: false, message: "Affiliate not found" };
  }

  const updateData: Record<string, string | number | boolean> = {};
  if (body.fullName !== undefined) {
    updateData.fullName = body.fullName.trim();
    updateData.username = body.fullName.trim();
  }
  if (body.phone !== undefined) updateData.phone = body.phone.trim();
  if (body.bankName !== undefined) updateData.bankName = body.bankName.trim();
  if (body.bankAccountNumber !== undefined)
    updateData.bankAccountNumber = body.bankAccountNumber.trim();
  if (body.bankAccountName !== undefined)
    updateData.bankAccountName = body.bankAccountName.trim();
  if (body.commissionRate !== undefined)
    updateData.commissionRate = body.commissionRate;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  const result = await toResult(
    prisma.user.update({
      where: { id: params.id },
      data: updateData,
      omit: { password: true },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "Failed to update affiliate" };
  }

  return { success: true, data: result.data };
};

export const resetAffiliatePassword = async ({
  headers,
  params,
  prisma,
  set,
}: AuthedHeaders & { params: { id: string } } & WithPrisma) => {
  const auth = await requireAdmin(headers, set);
  if (!auth.ok) return auth.response;

  const existing = await toResult(
    prisma.user.findUnique({
      where: { id: params.id, role: "Affiliate" },
      select: { id: true },
    }),
  );

  if (!existing.ok || !existing.data) {
    set.status = 404;
    return { success: false, message: "Affiliate not found" };
  }

  const hashResult = await toResult(
    argon2.hash(env.DEFAULT_AFFILIATE_PASSWORD),
  );
  if (!hashResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to reset password" };
  }

  const result = await toResult(
    prisma.user.update({
      where: { id: params.id },
      data: {
        password: hashResult.data,
        passwordChanged: false,
      },
      select: { id: true, email: true, username: true },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "Failed to reset password" };
  }

  return { success: true, message: "รีเซ็ตรหัสผ่านสำเร็จ", data: result.data };
};

export const getMyCases = async ({
  headers,
  query,
  prisma,
  set,
}: AuthedHeaders & {
  query: { page?: string; limit?: string; status?: string };
} & WithPrisma) => {
  const auth = await requireAffiliate(headers, set);
  if (!auth.ok) return auth.response;

  const user = await toResult(
    prisma.user.findUnique({
      where: { id: auth.userId },
      select: { referralCode: true },
    }),
  );

  if (!user.ok || !user.data?.referralCode) {
    set.status = 400;
    return { success: false, message: "Affiliate referral code not found" };
  }

  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const where: Record<string, string> = {
    referralCode: user.data.referralCode,
  };
  if (query.status) {
    where.status = query.status;
  }

  const [dataResult, countResult] = await Promise.all([
    toResult(
      prisma.quoteRequest.findMany({
        where,
        select: {
          id: true,
          tier: true,
          brand: true,
          model: true,
          year: true,
          variant: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          insuranceCompany: true,
          premiumAmount: true,
          createdAt: true,
          updatedAt: true,
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
    return { success: false, message: "Failed to fetch cases" };
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

export const getMyCaseById = async ({
  headers,
  params,
  prisma,
  set,
}: AuthedHeaders & { params: { id: string } } & WithPrisma) => {
  const auth = await requireAffiliate(headers, set);
  if (!auth.ok) return auth.response;

  const user = await toResult(
    prisma.user.findUnique({
      where: { id: auth.userId },
      select: { referralCode: true },
    }),
  );

  if (!user.ok || !user.data?.referralCode) {
    set.status = 400;
    return { success: false, message: "Affiliate referral code not found" };
  }

  const result = await toResult(
    prisma.quoteRequest.findUnique({
      where: { id: params.id, referralCode: user.data.referralCode },
      select: {
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
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
        commissions: {
          select: {
            id: true,
            premiumAmount: true,
            commissionRate: true,
            commissionAmount: true,
            status: true,
            paymentEvidence: true,
            paidAt: true,
            createdAt: true,
          },
        },
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "Failed to fetch case" };
  }

  if (!result.data) {
    set.status = 404;
    return { success: false, message: "Case not found" };
  }

  return { success: true, data: result.data };
};

export const getMyCommissions = async ({
  headers,
  query,
  prisma,
  set,
}: AuthedHeaders & {
  query: { page?: string; limit?: string; status?: string };
} & WithPrisma) => {
  const auth = await requireAffiliate(headers, set);
  if (!auth.ok) return auth.response;

  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const where: { affiliateId: string; status?: "PENDING" | "PAID" } = {
    affiliateId: auth.userId,
  };
  if (query.status === "PENDING" || query.status === "PAID") {
    where.status = query.status;
  }

  const [dataResult, countResult, summaryResult] = await Promise.all([
    toResult(
      prisma.affiliateCommission.findMany({
        where,
        select: {
          id: true,
          premiumAmount: true,
          commissionRate: true,
          commissionAmount: true,
          status: true,
          paymentEvidence: true,
          paidAt: true,
          createdAt: true,
          quoteRequest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              brand: true,
              model: true,
              year: true,
              tier: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ),
    toResult(prisma.affiliateCommission.count({ where })),
    toResult(
      prisma.affiliateCommission.aggregate({
        where: { affiliateId: auth.userId },
        _sum: { commissionAmount: true },
        _count: true,
      }),
    ),
  ]);

  if (!dataResult.ok || !countResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to fetch commissions" };
  }

  const [pendingSumResult, paidSumResult] = await Promise.all([
    toResult(
      prisma.affiliateCommission.aggregate({
        where: { affiliateId: auth.userId, status: "PENDING" },
        _sum: { commissionAmount: true },
        _count: true,
      }),
    ),
    toResult(
      prisma.affiliateCommission.aggregate({
        where: { affiliateId: auth.userId, status: "PAID" },
        _sum: { commissionAmount: true },
        _count: true,
      }),
    ),
  ]);

  return {
    success: true,
    data: dataResult.data,
    summary: {
      totalAmount: summaryResult.ok
        ? (summaryResult.data._sum.commissionAmount ?? 0)
        : 0,
      totalCount: summaryResult.ok ? summaryResult.data._count : 0,
      pendingAmount: pendingSumResult.ok
        ? (pendingSumResult.data._sum.commissionAmount ?? 0)
        : 0,
      pendingCount: pendingSumResult.ok ? pendingSumResult.data._count : 0,
      paidAmount: paidSumResult.ok
        ? (paidSumResult.data._sum.commissionAmount ?? 0)
        : 0,
      paidCount: paidSumResult.ok ? paidSumResult.data._count : 0,
    },
    pagination: {
      page,
      limit,
      total: countResult.data,
      totalPages: Math.ceil(countResult.data / limit),
    },
  };
};

interface PayCommissionParams extends AuthedHeaders {
  params: { id: string };
  body: {
    paymentEvidence: string;
  };
}

export const payCommission = async ({
  headers,
  params,
  body,
  prisma,
  set,
}: PayCommissionParams & WithPrisma) => {
  const auth = await requireAdmin(headers, set);
  if (!auth.ok) return auth.response;

  const existing = await toResult(
    prisma.affiliateCommission.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    }),
  );

  if (!existing.ok || !existing.data) {
    set.status = 404;
    return { success: false, message: "Commission record not found" };
  }

  if (existing.data.status === "PAID") {
    set.status = 400;
    return { success: false, message: "ค่าคอมมิชชั่นนี้จ่ายแล้ว" };
  }

  const result = await toResult(
    prisma.affiliateCommission.update({
      where: { id: params.id },
      data: {
        status: "PAID",
        paymentEvidence: body.paymentEvidence,
        paidAt: new Date(),
        paidById: auth.userId,
      },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "Failed to update commission" };
  }

  return { success: true, data: result.data };
};

export const getMyDashboard = async ({
  headers,
  prisma,
  set,
}: AuthedHeaders & WithPrisma) => {
  const auth = await requireAffiliate(headers, set);
  if (!auth.ok) return auth.response;

  const user = await toResult(
    prisma.user.findUnique({
      where: { id: auth.userId },
      select: { referralCode: true },
    }),
  );

  if (!user.ok || !user.data?.referralCode) {
    set.status = 400;
    return { success: false, message: "Affiliate referral code not found" };
  }

  const [totalCases, approvedCases, commissionSummary, pendingCommission] =
    await Promise.all([
      toResult(
        prisma.quoteRequest.count({
          where: { referralCode: user.data.referralCode },
        }),
      ),
      toResult(
        prisma.quoteRequest.count({
          where: { referralCode: user.data.referralCode, status: "APPROVED" },
        }),
      ),
      toResult(
        prisma.affiliateCommission.aggregate({
          where: { affiliateId: auth.userId },
          _sum: { commissionAmount: true },
          _count: true,
        }),
      ),
      toResult(
        prisma.affiliateCommission.aggregate({
          where: { affiliateId: auth.userId, status: "PENDING" },
          _sum: { commissionAmount: true },
          _count: true,
        }),
      ),
    ]);

  return {
    success: true,
    data: {
      totalCases: totalCases.ok ? totalCases.data : 0,
      approvedCases: approvedCases.ok ? approvedCases.data : 0,
      totalCommission: commissionSummary.ok
        ? (commissionSummary.data._sum.commissionAmount ?? 0)
        : 0,
      totalCommissionCount: commissionSummary.ok
        ? commissionSummary.data._count
        : 0,
      pendingCommission: pendingCommission.ok
        ? (pendingCommission.data._sum.commissionAmount ?? 0)
        : 0,
      pendingCommissionCount: pendingCommission.ok
        ? pendingCommission.data._count
        : 0,
    },
  };
};
