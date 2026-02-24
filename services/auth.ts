"use server";

import { api, getAuthHeaders } from "@/libs/api";
import {
  setAccessTokenToCookies,
  setRefreshTokenToCookies,
  getRefreshTokenFromCookies,
  clearAuthCookies,
} from "@/utils/auth";
import { redirect } from "next/navigation";
import { parseApiError } from "@/utils/error";

interface SignInState {
  success: boolean;
  message: string;
}

async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Please fill in all fields" };
  }

  const { data, error } = await api.login.post({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: parseApiError(error.value, "Login failed"),
    };
  }

  if (!data?.success || !data.data) {
    return { success: false, message: data?.message ?? "Login failed" };
  }

  await setAccessTokenToCookies(data.data.accessToken);
  await setRefreshTokenToCookies(data.data.refreshToken);

  redirect("/admin");
}

async function signOut(): Promise<void> {
  const refreshToken = await getRefreshTokenFromCookies();

  if (refreshToken) {
    await api["sign-out"].post({ refreshToken });
  }

  await clearAuthCookies();

  redirect("/login");
}

async function getCurrentUser() {
  const headers = await getAuthHeaders();
  const { data, error } = await api.auth.me.get({
    headers,
  });

  if (error || !data?.success) {
    return null;
  }

  return data.data?.user ?? null;
}

export { signIn, signOut, getCurrentUser };
