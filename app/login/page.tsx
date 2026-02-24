"use client";

import { useActionState } from "react";
import { signIn } from "@/services/auth";
import { signInInitialState } from "@/types/auth";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(
    signIn,
    signInInitialState,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-light px-4">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-border-light bg-white shadow-xl lg:grid-cols-[1.1fr,0.9fr]">
        {/* Left Panel - Branding */}
        <div className="relative hidden h-full bg-linear-to-br from-primary/90 to-secondary/80 p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.12),transparent_30%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
                Admin Console
              </p>
              <h1 className="mt-3 text-3xl font-bold">Internal Access</h1>
              <p className="mt-2 text-sm text-white/80">
                Authorized users only. Activity is monitored.
              </p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="font-semibold">Security reminder</p>
                <p className="text-white/80">
                  Use strong password. Do not share credentials.
                </p>
              </div>
              <p className="text-white/70">Need help? Contact IT support.</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="p-8 sm:p-10">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Sign in
            </p>
            <h2 className="text-2xl font-bold text-text-dark">Admin login</h2>
            <p className="text-sm text-text-medium">
              Enter your work email and password.
            </p>
          </div>

          {state.message && !state.success && (
            <div className="mb-4 rounded-xl border border-accent-red/20 bg-accent-red/10 px-4 py-3 text-sm text-accent-red">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-text-dark"
              >
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@company.com"
                disabled={isPending}
                required
                className="w-full rounded-xl border border-border-light bg-bg-light/60 px-4 py-3 text-sm text-text-dark placeholder:text-text-medium focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-text-dark"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                required
                minLength={8}
                className="w-full rounded-xl border border-border-light bg-bg-light/60 px-4 py-3 text-sm text-text-dark placeholder:text-text-medium focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
