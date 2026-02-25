import { extractUserIdFromHeaders } from "@/utils/extract-token";

type AuthGuardResult =
  | { ok: true; userId: string }
  | { ok: false; response: { success: false; message: string } };

export async function requireSuper(
  headers: Record<string, string | undefined>,
  set: { status?: number | string },
): Promise<AuthGuardResult> {
  const auth = await extractUserIdFromHeaders(headers);
  if (!auth.ok) {
    set.status = 401;
    return {
      ok: false,
      response: { success: false, message: "Unauthorized" },
    };
  }
  if (auth.role !== "Super") {
    set.status = 403;
    return {
      ok: false,
      response: { success: false, message: "Forbidden: Super role required" },
    };
  }
  return { ok: true, userId: auth.userId };
}

export async function requireAdmin(
  headers: Record<string, string | undefined>,
  set: { status?: number | string },
): Promise<AuthGuardResult> {
  const auth = await extractUserIdFromHeaders(headers);
  if (!auth.ok) {
    set.status = 401;
    return {
      ok: false,
      response: { success: false, message: "Unauthorized" },
    };
  }
  if (auth.role !== "Super" && auth.role !== "Employee") {
    set.status = 403;
    return {
      ok: false,
      response: { success: false, message: "Forbidden: Admin role required" },
    };
  }
  return { ok: true, userId: auth.userId };
}

export async function requireAffiliate(
  headers: Record<string, string | undefined>,
  set: { status?: number | string },
): Promise<AuthGuardResult> {
  const auth = await extractUserIdFromHeaders(headers);
  if (!auth.ok) {
    set.status = 401;
    return {
      ok: false,
      response: { success: false, message: "Unauthorized" },
    };
  }
  if (auth.role !== "Affiliate") {
    set.status = 403;
    return {
      ok: false,
      response: {
        success: false,
        message: "Forbidden: Affiliate role required",
      },
    };
  }
  return { ok: true, userId: auth.userId };
}
