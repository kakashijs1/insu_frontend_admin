"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useIsAuthenticated } from "@/stores";

export default function AdminLoginPage() {
    const router = useRouter();

    // Auth store
    const login = useAuthStore((state) => state.login);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const clearError = useAuthStore((state) => state.clearError);
    const isAuthenticated = useIsAuthenticated();

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/admin");
        }
    }, [isAuthenticated, router]);

    // Clear error when form changes
    useEffect(() => {
        if (error) {
            clearError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, password]);

    // Handle form submit
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Basic validation
        if (!email || !password) {
            return;
        }

        const success = await login({ email, password });

        if (success) {
            router.push("/admin");
        }
    };

    return (
        <>
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
                                <h1 className="mt-3 text-3xl font-bold">
                                    Internal Access
                                </h1>
                                <p className="mt-2 text-sm text-white/80">
                                    Authorized users only. Activity is
                                    monitored.
                                </p>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                                    <p className="font-semibold">
                                        Security reminder
                                    </p>
                                    <p className="text-white/80">
                                        Use company SSO or strong password. Do
                                        not share credentials.
                                    </p>
                                </div>
                                <p className="text-white/70">
                                    Need help? Contact IT support.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Login Form */}
                    <div className="p-8 sm:p-10">
                        <div className="mb-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                Sign in
                            </p>
                            <h2 className="text-2xl font-bold text-text-dark">
                                Admin login
                            </h2>
                            <p className="text-sm text-text-medium">
                                Enter your work email and password.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-semibold text-text-dark"
                                >
                                    Work email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@company.com"
                                    disabled={isLoading}
                                    required
                                    className="w-full rounded-xl border border-border-light bg-bg-light/60 px-4 py-3 text-sm text-text-dark placeholder:text-text-medium focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-text-dark"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    required
                                    minLength={8}
                                    className="w-full rounded-xl border border-border-light bg-bg-light/60 px-4 py-3 text-sm text-text-dark placeholder:text-text-medium focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-text-medium">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) =>
                                            setRememberMe(e.target.checked)
                                        }
                                        disabled={isLoading}
                                        className="checkbox-input"
                                    />
                                    Remember me
                                </label>
                                <button
                                    type="button"
                                    className="font-semibold text-primary hover:text-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isLoading}
                                    onClick={() =>
                                        console.log("Forgot password")
                                    }
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading ? (
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
        </>
    );
}
