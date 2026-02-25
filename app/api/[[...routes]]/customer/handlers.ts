import { WithPrisma } from "@/db";
import { toResult } from "lyney";

interface ListCustomersParams {
  query: {
    page?: string;
    limit?: string;
    search?: string;
  };
  set: { status?: number | string };
}

interface CustomerByIdParams {
  params: { id: string };
  set: { status?: number | string };
}

interface UpdateCustomerParams {
  params: { id: string };
  body: { name?: string; phone?: string };
  set: { status?: number | string };
}

interface DeleteCustomerParams {
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
  const search = query.search?.trim() || "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
        ],
      }
    : {};

  const [dataResult, countResult] = await Promise.all([
    toResult(
      prisma.customer.findMany({
        where,
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
    toResult(prisma.customer.count({ where })),
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

export const updateCustomer = async ({
  params,
  body,
  prisma,
  set,
}: UpdateCustomerParams & WithPrisma) => {
  const data: Record<string, string> = {};
  if (body.name) data.name = body.name;
  if (body.phone) data.phone = body.phone;

  if (Object.keys(data).length === 0) {
    set.status = 400;
    return { success: false, message: "ไม่มีข้อมูลที่ต้องการอัปเดต" };
  }

  if (body.phone) {
    const existing = await toResult(
      prisma.customer.findUnique({ where: { phone: body.phone } }),
    );
    if (existing.ok && existing.data && existing.data.id !== params.id) {
      set.status = 409;
      return { success: false, message: "เบอร์โทรนี้ถูกใช้งานแล้ว" };
    }
  }

  const result = await toResult(
    prisma.customer.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, phone: true },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "อัปเดตข้อมูลลูกค้าไม่สำเร็จ" };
  }

  return { success: true, data: result.data };
};

export const deleteCustomer = async ({
  params,
  prisma,
  set,
}: DeleteCustomerParams & WithPrisma) => {
  const result = await toResult(
    prisma.customer.delete({
      where: { id: params.id },
      select: { id: true },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "ลบข้อมูลลูกค้าไม่สำเร็จ" };
  }

  return { success: true, data: result.data };
};
