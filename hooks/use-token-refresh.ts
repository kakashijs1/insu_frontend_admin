"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores";
import { getAccessToken } from "@/lib/api";

// Refresh token 1 minute before expiration
const REFRESH_BUFFER_MS = 60 * 1000;

// Default token lifetime if we can't decode (15 minutes)
const DEFAULT_TOKEN_LIFETIME_MS = 15 * 60 * 1000;

// Minimum refresh interval (5 minutes)
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Decode JWT token to get expiration time
 * Returns null if token is invalid or can't be decoded
 */
function getTokenExpiration(token: string): number | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1]));
        if (typeof payload.exp === "number") {
            return payload.exp * 1000; // Convert to milliseconds
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Calculate time until token refresh is needed
 */
function getTimeUntilRefresh(token: string | null): number {
    if (!token) return MIN_REFRESH_INTERVAL_MS;

    const expiration = getTokenExpiration(token);
    if (!expiration) {
        // If we can't decode, use default lifetime
        return DEFAULT_TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS;
    }

    const now = Date.now();
    const timeUntilExpiry = expiration - now;
    const timeUntilRefresh = timeUntilExpiry - REFRESH_BUFFER_MS;

    // Ensure minimum interval
    return Math.max(timeUntilRefresh, MIN_REFRESH_INTERVAL_MS);
}

/**
 * useTokenRefresh Hook
 * - Automatically refreshes access token before expiration
 * - Handles refresh failure by logging out
 * - Only runs when authenticated
 */
export function useTokenRefresh() {
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const logout = useAuthStore((state) => state.logout);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitialized = useAuthStore((state) => state.isInitialized);

    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    const scheduleRefresh = useCallback(() => {
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }

        // Don't schedule if not authenticated
        if (!isAuthenticated) return;

        const token = getAccessToken();
        const timeUntilRefresh = getTimeUntilRefresh(token);

        console.log(
            `[TokenRefresh] Scheduling refresh in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`,
        );

        refreshTimeoutRef.current = setTimeout(async () => {
            // Prevent concurrent refreshes
            if (isRefreshingRef.current) return;
            isRefreshingRef.current = true;

            console.log("[TokenRefresh] Refreshing token...");

            try {
                const success = await refreshToken();

                if (success) {
                    console.log("[TokenRefresh] Token refreshed successfully");
                    // Schedule next refresh
                    scheduleRefresh();
                } else {
                    console.log(
                        "[TokenRefresh] Refresh failed, logging out...",
                    );
                    await logout();
                }
            } catch (error) {
                console.error("[TokenRefresh] Error refreshing token:", error);
                await logout();
            } finally {
                isRefreshingRef.current = false;
            }
        }, timeUntilRefresh);
    }, [isAuthenticated, refreshToken, logout]);

    useEffect(() => {
        // Only start scheduling after initialization and if authenticated
        if (isInitialized && isAuthenticated) {
            scheduleRefresh();
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
                refreshTimeoutRef.current = null;
            }
        };
    }, [isInitialized, isAuthenticated, scheduleRefresh]);

    // Also refresh when window regains focus (user comes back to tab)
    useEffect(() => {
        if (!isInitialized || !isAuthenticated) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                console.log(
                    "[TokenRefresh] Tab became visible, checking token...",
                );

                const token = getAccessToken();
                if (token) {
                    const expiration = getTokenExpiration(token);
                    if (expiration && expiration < Date.now() + REFRESH_BUFFER_MS) {
                        // Token is about to expire or already expired, refresh now
                        console.log(
                            "[TokenRefresh] Token expiring soon, refreshing...",
                        );
                        refreshToken();
                    }
                }

                // Reschedule refresh
                scheduleRefresh();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, [isInitialized, isAuthenticated, refreshToken, scheduleRefresh]);
}
