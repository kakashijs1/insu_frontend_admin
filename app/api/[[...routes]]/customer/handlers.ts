import { WithPrisma } from "@/db";
import { toResult } from "lyney";

interface ListCustomersParams {
  query: {
    page?: string;
    limit?: string;
  };
  set: { status?: number | string };
}

interface CustomerByIdParams {
  params: { id: string };
  set: { status?: number | string };
}

export const listCustomers = async ({
  query,
  prisma,
  set,
}: ListCustomersParams & WithPrisma) => {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    toResult(
      prisma.customer.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          createdAt: true,
          _count: {
            select: { quoteRequests: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ),
    toResult(prisma.customer.count()),
  ]);

  if (!dataResult.ok || !countResult.ok) {
    set.status = 500;
    return { success: false, message: "Failed to fetch customers" };
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

export const getCustomerById = async ({
  params,
  prisma,
  set,
}: CustomerByIdParams & WithPrisma) => {
  const result = await toResult(
    prisma.customer.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        quoteRequests: {
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
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "Failed to fetch customer" };
  }

  if (!result.data) {
    set.status = 404;
    return { success: false, message: "Customer not found" };
  }

  return { success: true, data: result.data };
};
