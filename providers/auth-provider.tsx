"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/stores";
import { useTokenRefresh } from "@/hooks";

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider Component
 * - Wraps app with auth context
 * - Auto refresh token on mount
 * - Handle token expiration
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const initialize = useAuthStore((state) => state.initialize);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const isLoading = useAuthStore((state) => state.isLoading);

    // Auto refresh token before expiration
    useTokenRefresh();

    useEffect(() => {
        // Initialize auth state on app mount
        initialize();
    }, [initialize]);

    // Show loading screen while initializing
    if (!isInitialized || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg-light">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-text-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
