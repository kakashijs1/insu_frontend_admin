import { verifyAccessToken } from "@/utils/jwt";

export async function extractUserIdFromHeaders(
  headers: Record<string, string | undefined>,
): Promise<{ ok: true; userId: string; role: string } | { ok: false }> {
  const authHeader = headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false };
  }

  const token = authHeader.slice(7);
  const verified = await verifyAccessToken(token);
  if (!verified.ok) {
    return { ok: false };
  }

  return { ok: true, userId: verified.data.sub, role: verified.data.role };
}
