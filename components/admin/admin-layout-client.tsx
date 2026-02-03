// @/components/admin/admin-layout-client.tsx
"use client";

import React, { useState } from "react";
import {
    LayoutDashboard,
    Users,
    UserPlus,
    UserCog,
    ShieldPlus,
    Handshake,
    Menu,
    X,
    LogOut,
    Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, useUser } from "@/stores";

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    // เริ่มต้นให้เปิดเฉพาะจอใหญ่
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Auth store
    const user = useUser();
    const logout = useAuthStore((state) => state.logout);

    // Handle logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            router.push("/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user) return "A";
        if (user.username) {
            return user.username.charAt(0).toUpperCase();
        }
        if (user.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return "A";
    };

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        {
            title: "จัดการสมาชิก",
            items: [
                {
                    name: "สมาชิกใหม่",
                    href: "/admin/members/create",
                    icon: UserPlus,
                },
                {
                    name: "แก้ไขรายชื่อ",
                    href: "/admin/members/edit",
                    icon: Users,
                },
                {
                    name: "เช็ควันหมดอายุ",
                    href: "/admin/members/expire",
                    icon: UserCog,
                },
            ],
        },
        {
            title: "พาร์ทเนอร์",
            items: [
                {
                    name: "Affiliate พาร์ทเนอร์",
                    href: "/admin/affiliate",
                    icon: Handshake,
                },
            ],
        },
        {
            title: "ผลิตภัณฑ์",
            items: [
                {
                    name: "สร้างโปรดักประกันภัย",
                    href: "/admin/products/create",
                    icon: ShieldPlus,
                },
            ],
        },
        {
            title: "ตั้งค่าระบบ",
            items: [
                {
                    name: "สร้าง User ใหม่",
                    href: "/admin/users/create",
                    icon: UserPlus,
                },
                {
                    name: "แก้ไข User / สิทธิ์",
                    href: "/admin/users/manage",
                    icon: UserCog,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* 1. Mobile Overlay: แก้ z-index เป็น 50 */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-[50] bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* 2. Sidebar: ปรับ z-index เป็น 60 (สูงที่สุด) และใช้ transition-all */}
            <aside
                className={`fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 ${!isSidebarOpen ? "lg:w-0 lg:invisible" : "lg:w-72"}
        `}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Logo Section */}
                    <div className="p-6 border-b border-slate-50 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-teal-600 font-bold text-xl">
                                <div className="bg-teal-600 p-1.5 rounded-lg text-white">
                                    <ShieldPlus size={20} />
                                </div>
                                <span className="tracking-tight text-slate-800">
                                    SABUYJAI{" "}
                                    <span className="text-teal-600 uppercase">
                                        Admin
                                    </span>
                                </span>
                            </div>
                            {/* ปุ่มปิดสำหรับ Mobile */}
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-1 text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                        {navigation.map((group, idx) => (
                            <div key={idx}>
                                {group.title && (
                                    <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                        {group.title}
                                    </p>
                                )}
                                <div className="space-y-1">
                                    {(group.items || [group]).map(
                                        (item: any) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    pathname === item.href
                                                        ? "bg-teal-50 text-teal-700 shadow-sm"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-teal-600"
                                                }`}
                                            >
                                                <item.icon
                                                    size={18}
                                                    className={
                                                        pathname === item.href
                                                            ? "text-teal-600"
                                                            : "text-slate-400"
                                                    }
                                                />
                                                <span className="truncate">
                                                    {item.name}
                                                </span>
                                            </Link>
                                        ),
                                    )}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* User Profile Section */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-3 p-2">
                            <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium shrink-0">
                                {getUserInitials()}
                            </div>
                            <div className="flex-1 min-w-0 leading-tight">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {user?.username || "Administrator"}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                    {user?.email || "admin@sabuyjai.com"}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="ออกจากระบบ"
                            >
                                {isLoggingOut ? (
                                    <div className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                                ) : (
                                    <LogOut size={18} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 3. Main Content: ใช้ padding-left แบบ Dynamic ขยับตาม Sidebar */}
            <div
                className={`transition-all duration-300 min-h-screen flex flex-col ${isSidebarOpen ? "lg:pl-72" : "lg:pl-0"}`}
            >
                {/* Top Navbar: ปรับ z-index เป็น 40 */}
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-teal-600 relative transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                System Status
                            </span>
                            <span className="text-xs font-medium text-emerald-600">
                                Online
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-[1600px] mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
