import { treaty } from "@elysiajs/eden";
import { app } from "../app/api";
import { getAccessTokenFromCookies } from "@/utils/auth";

export const api = treaty(app).api;

export async function getAuthHeaders(): Promise<{
  authorization: string;
}> {
  const token = await getAccessTokenFromCookies();
  return { authorization: token ? `Bearer ${token}` : "" };
}
