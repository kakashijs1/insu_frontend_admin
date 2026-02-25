"use server";

import { api, getAuthHeaders } from "@/libs/api";
import { parseApiError } from "@/utils/error";
import { revalidatePath } from "next/cache";

export async function listAdminUsers(search = "") {
  const headers = await getAuthHeaders();
  const { data, error } = await api.user.get({
    headers,
    query: { search },
  });

  if (error || !data?.success) {
    return [];
  }

  return data.data ?? [];
}

interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  role: "Employee" | "Super";
  fullName?: string;
}

export async function createAdminUser(input: CreateUserInput) {
  const headers = await getAuthHeaders();
  const { data, error } = await api.user.post(input, { headers });

  if (error) {
    return {
      success: false,
      message: parseApiError(error.value, "สร้างเจ้าหน้าที่ไม่สำเร็จ"),
    };
  }

  if (!data?.success) {
    return {
      success: false,
      message: data?.message ?? "สร้างเจ้าหน้าที่ไม่สำเร็จ",
    };
  }

  revalidatePath("/admin/users/manage");
  return { success: true };
}

export async function updateAdminUser(
  id: string,
  body: { role?: "Employee" | "Super"; isActive?: boolean; fullName?: string },
) {
  const headers = await getAuthHeaders();
  const { data, error } = await api.user({ id }).put(body, { headers });

  if (error) {
    return {
      success: false,
      message: parseApiError(error.value, "อัปเดตไม่สำเร็จ"),
    };
  }

  if (!data?.success) {
    return { success: false, message: data?.message ?? "อัปเดตไม่สำเร็จ" };
  }

  revalidatePath("/admin/users/manage");
  return { success: true };
}

export async function deleteAdminUser(id: string) {
  const headers = await getAuthHeaders();
  const { data, error } = await api.user({ id }).delete(undefined, { headers });

  if (error) {
    return {
      success: false,
      message: parseApiError(error.value, "ลบไม่สำเร็จ"),
    };
  }

  if (!data?.success) {
    return { success: false, message: data?.message ?? "ลบไม่สำเร็จ" };
  }

  revalidatePath("/admin/users/manage");
  return { success: true };
}
