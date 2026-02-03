"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";

interface AuthGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
}

/**
 * AuthGuard Component
 * - Client-side protection for authenticated routes
 * - Shows loading state while checking auth
 * - Redirects to login if not authenticated
 */
export function AuthGuard({
    children,
    fallback,
    redirectTo = "/login",
}: AuthGuardProps) {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const isLoading = useAuthStore((state) => state.isLoading);

    useEffect(() => {
        // Wait until auth is initialized before checking
        if (isInitialized && !isLoading && !isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, isInitialized, isLoading, router, redirectTo]);

    // Show loading while initializing or checking auth
    if (!isInitialized || isLoading) {
        return (
            fallback ?? (
                <div className="flex min-h-screen items-center justify-center bg-bg-light">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-text-medium">
                            Verifying access...
                        </p>
                    </div>
                </div>
            )
        );
    }

    // Not authenticated - will redirect (show nothing to prevent flash)
    if (!isAuthenticated) {
        return (
            fallback ?? (
                <div className="flex min-h-screen items-center justify-center bg-bg-light">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-text-medium">
                            Redirecting to login...
                        </p>
                    </div>
                </div>
            )
        );
    }

    // Authenticated - render children
    return <>{children}</>;
}

/**
 * withAuthGuard HOC
 * - Wraps a component with AuthGuard
 * - Useful for page-level protection
 */
export function withAuthGuard<P extends object>(
    Component: React.ComponentType<P>,
    options?: Omit<AuthGuardProps, "children">,
) {
    return function AuthGuardedComponent(props: P) {
        return (
            <AuthGuard {...options}>
                <Component {...props} />
            </AuthGuard>
        );
    };
}
