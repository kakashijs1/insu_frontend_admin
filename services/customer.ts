"use server";

import { api, getAuthHeaders } from "@/libs/api";
import { parseApiError } from "@/utils/error";
import { revalidatePath } from "next/cache";

export async function listCustomers(page = 1, search = "") {
  const headers = await getAuthHeaders();
  const { data, error } = await api.customer.get({
    headers,
    query: { page: String(page), limit: "20", search },
  });

  if (error || !data?.success) {
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }

  return {
    data: data.data ?? [],
    pagination: data.pagination ?? {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function updateCustomer(
  id: string,
  body: { name?: string; phone?: string },
) {
  const headers = await getAuthHeaders();
  const { data, error } = await api.customer({ id }).put(body, { headers });

  if (error) {
    return {
      success: false,
      message: parseApiError(error.value, "อัปเดตไม่สำเร็จ"),
    };
  }

  if (!data?.success) {
    return { success: false, message: data?.message ?? "อัปเดตไม่สำเร็จ" };
  }

  revalidatePath("/admin/members/edit");
  return { success: true };
}

export async function deleteCustomer(id: string) {
  const headers = await getAuthHeaders();
  const { data, error } = await api
    .customer({ id })
    .delete(undefined, { headers });

  if (error) {
    return {
      success: false,
      message: parseApiError(error.value, "ลบไม่สำเร็จ"),
    };
  }

  if (!data?.success) {
    return { success: false, message: data?.message ?? "ลบไม่สำเร็จ" };
  }

  revalidatePath("/admin/members/edit");
  return { success: true };
}
