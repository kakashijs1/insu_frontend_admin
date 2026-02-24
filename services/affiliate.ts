"use server";

import { api, getAuthHeaders } from "@/libs/api";
import { toResult } from "lyney";
import { parseApiError } from "@/utils/error";
import type {
  AffiliateDetail,
  CreateAffiliateData,
  UpdateAffiliateData,
} from "@/types/affiliate";

interface MutationResult {
  success?: boolean;
  error?: string;
}

export async function getAffiliates(page = 1) {
  const headers = await getAuthHeaders();
  const result = await toResult(
    api.affiliate.get({ headers, query: { page: String(page), limit: "20" } }),
  );

  if (!result.ok) return { data: [], pagination: null };

  const { data, error } = result.data;
  if (error || !data || !("data" in data))
    return { data: [], pagination: null };

  return {
    data: data.data ?? [],
    pagination: data.pagination ?? null,
  };
}

export async function getAffiliateById(
  id: string,
): Promise<AffiliateDetail | null> {
  const headers = await getAuthHeaders();
  const result = await toResult(api.affiliate({ id }).get({ headers }));

  if (!result.ok) return null;

  const { data, error } = result.data;
  if (error || !data || !("data" in data)) return null;

  return data.data as AffiliateDetail;
}

export async function createAffiliate(
  body: CreateAffiliateData,
): Promise<MutationResult> {
  const headers = await getAuthHeaders();
  const result = await toResult(api.affiliate.post(body, { headers }));

  if (!result.ok) {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }

  const { error } = result.data;
  if (error) {
    const msg = parseApiError(error.value, "สร้าง Affiliate ไม่สำเร็จ");
    return { error: msg };
  }

  return { success: true };
}

export async function updateAffiliate(
  id: string,
  body: UpdateAffiliateData,
): Promise<MutationResult> {
  const headers = await getAuthHeaders();
  const result = await toResult(api.affiliate({ id }).put(body, { headers }));

  if (!result.ok) {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }

  const { error } = result.data;
  if (error) {
    const msg = parseApiError(error.value, "แก้ไข Affiliate ไม่สำเร็จ");
    return { error: msg };
  }

  return { success: true };
}

export async function resetAffiliatePassword(
  id: string,
): Promise<MutationResult> {
  const headers = await getAuthHeaders();
  const result = await toResult(
    api.affiliate({ id })["reset-password"].put({}, { headers }),
  );

  if (!result.ok) {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }

  const { error } = result.data;
  if (error) {
    const msg = parseApiError(error.value, "รีเซ็ตรหัสผ่านไม่สำเร็จ");
    return { error: msg };
  }

  return { success: true };
}

export async function payCommission(
  commissionId: string,
  paymentEvidence: string,
): Promise<MutationResult> {
  const headers = await getAuthHeaders();
  const result = await toResult(
    api
      .commission({ id: commissionId })
      .pay.put({ paymentEvidence }, { headers }),
  );

  if (!result.ok) {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }

  const { error } = result.data;
  if (error) {
    const msg = parseApiError(error.value, "อนุมัติค่าคอมมิชชั่นไม่สำเร็จ");
    return { error: msg };
  }

  return { success: true };
}

export async function getMyDashboard() {
  const headers = await getAuthHeaders();
  const result = await toResult(api.affiliate["my-dashboard"].get({ headers }));

  if (!result.ok) return null;

  const { data, error } = result.data;
  if (error || !data || !("data" in data)) return null;

  return data.data;
}

export async function getMyCases(page = 1, status?: string) {
  const headers = await getAuthHeaders();
  const query: Record<string, string> = { page: String(page), limit: "20" };
  if (status) query.status = status;

  const result = await toResult(
    api.affiliate["my-cases"].get({ headers, query }),
  );

  if (!result.ok) return { data: [], pagination: null };

  const { data, error } = result.data;
  if (error || !data || !("data" in data))
    return { data: [], pagination: null };

  return {
    data: data.data ?? [],
    pagination: data.pagination ?? null,
  };
}

export async function getMyCaseById(id: string) {
  const headers = await getAuthHeaders();
  const result = await toResult(
    api.affiliate["my-cases"]({ id }).get({ headers }),
  );

  if (!result.ok) return null;

  const { data, error } = result.data;
  if (error || !data || !("data" in data)) return null;

  return data.data;
}

export async function getMyCommissions(page = 1, status?: string) {
  const headers = await getAuthHeaders();
  const query: Record<string, string> = { page: String(page), limit: "20" };
  if (status) query.status = status;

  const result = await toResult(
    api.affiliate["my-commissions"].get({ headers, query }),
  );

  if (!result.ok) return { data: [], summary: null, pagination: null };

  const { data, error } = result.data;
  if (error || !data || !("data" in data))
    return { data: [], summary: null, pagination: null };

  return {
    data: data.data ?? [],
    summary: "summary" in data ? (data.summary ?? null) : null,
    pagination: data.pagination ?? null,
  };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<MutationResult> {
  const headers = await getAuthHeaders();
  const result = await toResult(
    api.auth["change-password"].put(
      { currentPassword, newPassword },
      { headers },
    ),
  );

  if (!result.ok) {
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }

  const { error } = result.data;
  if (error) {
    const msg = parseApiError(error.value, "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    return { error: msg };
  }

  return { success: true };
}
