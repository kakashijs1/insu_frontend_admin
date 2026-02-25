import { WithPrisma } from "@/db";
import { requireSuper } from "@/utils/require-auth";
import { toResult } from "lyney";
import { hash } from "argon2";

interface AuthedRequestParams {
  headers: Record<string, string | undefined>;
  set: { status?: number | string };
}

interface ListUsersParams extends AuthedRequestParams {
  query: { search?: string; page?: string; limit?: string };
}

interface CreateUserParams extends AuthedRequestParams {
  body: {
    email: string;
    username: string;
    password: string;
    role: "Employee" | "Super";
    fullName?: string;
  };
}

interface UpdateUserParams extends AuthedRequestParams {
  params: { id: string };
  body: {
    role?: "Employee" | "Super";
    isActive?: boolean;
    fullName?: string;
  };
}

interface DeleteUserParams extends AuthedRequestParams {
  params: { id: string };
}

export const listUsers = async ({
  headers,
  query,
  prisma,
  set,
}: ListUsersParams & WithPrisma) => {
  const guard = await requireSuper(headers, set);
  if (!guard.ok) return guard.response;

  const search = query.search?.trim() || "";
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { username: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { fullName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [dataResult, countResult] = await Promise.all([
    toResult(
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          fullName: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ),
    toResult(prisma.user.count({ where })),
  ]);

  if (!dataResult.ok || !countResult.ok) {
    set.status = 500;
    return { success: false, message: "ดึงข้อมูลเจ้าหน้าที่ไม่สำเร็จ" };
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

export const createUser = async ({
  headers,
  body,
  prisma,
  set,
}: CreateUserParams & WithPrisma) => {
  const guard = await requireSuper(headers, set);
  if (!guard.ok) return guard.response;

  if (!body.email || !body.username || !body.password || !body.role) {
    set.status = 400;
    return { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  const existing = await toResult(
    prisma.user.findUnique({ where: { email: body.email.trim() } }),
  );
  if (existing.ok && existing.data) {
    set.status = 409;
    return { success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" };
  }

  const hashResult = await toResult(hash(body.password.trim()));
  if (!hashResult.ok) {
    set.status = 500;
    return { success: false, message: "สร้างเจ้าหน้าที่ไม่สำเร็จ" };
  }

  const result = await toResult(
    prisma.user.create({
      data: {
        email: body.email.trim(),
        username: body.username.trim(),
        password: hashResult.data,
        role: body.role,
        fullName: body.fullName?.trim() || null,
      },
      select: { id: true, username: true, email: true, role: true },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "สร้างเจ้าหน้าที่ไม่สำเร็จ" };
  }

  return { success: true, data: result.data };
};

export const updateUser = async ({
  headers,
  params,
  body,
  prisma,
  set,
}: UpdateUserParams & WithPrisma) => {
  const guard = await requireSuper(headers, set);
  if (!guard.ok) return guard.response;

  const data: {
    role?: "Employee" | "Super";
    isActive?: boolean;
    fullName?: string | null;
  } = {};
  if (body.role !== undefined) data.role = body.role;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.fullName !== undefined)
    data.fullName = body.fullName?.trim() || null;

  if (Object.keys(data).length === 0) {
    set.status = 400;
    return { success: false, message: "ไม่มีข้อมูลที่ต้องการอัปเดต" };
  }

  const result = await toResult(
    prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "อัปเดตข้อมูลเจ้าหน้าที่ไม่สำเร็จ" };
  }

  return { success: true, data: result.data };
};

export const deleteUser = async ({
  headers,
  params,
  prisma,
  set,
}: DeleteUserParams & WithPrisma) => {
  const guard = await requireSuper(headers, set);
  if (!guard.ok) return guard.response;

  if (guard.userId === params.id) {
    set.status = 400;
    return { success: false, message: "ไม่สามารถลบบัญชีตัวเองได้" };
  }

  const result = await toResult(
    prisma.user.delete({
      where: { id: params.id },
      select: { id: true },
    }),
  );

  if (!result.ok) {
    set.status = 500;
    return { success: false, message: "ลบเจ้าหน้าที่ไม่สำเร็จ" };
  }

  return { success: true, data: result.data };
};
