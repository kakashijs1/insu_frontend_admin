"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCog,
  Handshake,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  FileText,
  Briefcase,
  Wallet,
  KeyRound,
} from "lucide-react";
import NotificationDropdown from "@/components/admin/NotificationDropdown";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/services/auth";
import type { AdminUser } from "@/types/auth";
import type { PendingQuoteNotification } from "@/types/quote";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: AdminUser | null;
  pendingCount: number;
  pendingQuotes: PendingQuoteNotification[];
}

export default function AdminLayoutClient({
  children,
  user,
  pendingCount,
  pendingQuotes,
}: AdminLayoutClientProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

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

  const isAffiliate = user?.role === "Affiliate";
  const isSuper = user?.role === "Super";

  const adminNavigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "คำขอใบเสนอราคา", href: "/admin/quotes", icon: FileText },
    {
      title: "จัดการสมาชิก",
      items: [
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
          name: "จัดการ Affiliate",
          href: "/admin/affiliate",
          icon: Handshake,
        },
      ],
    },
    ...(isSuper
      ? [
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
        ]
      : []),
  ];

  const affiliateNavigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "เคสของฉัน", href: "/admin/my-cases", icon: Briefcase },
    { name: "ค่าคอมมิชชั่น", href: "/admin/my-commissions", icon: Wallet },
    {
      title: "บัญชี",
      items: [
        {
          name: "เปลี่ยนรหัสผ่าน",
          href: "/admin/change-password",
          icon: KeyRound,
        },
      ],
    },
  ];

  const navigation = isAffiliate ? affiliateNavigation : adminNavigation;

  return (
    <div className="min-h-screen bg-muted-light">
      {/* 1. Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[50] bg-overlay backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-72 bg-sidebar-bg border-r border-sidebar-border transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 ${!isSidebarOpen ? "lg:w-0 lg:invisible" : "lg:w-72"}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className="p-6 border-b border-bg-light shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sidebar-brand font-bold text-xl">
                <div className="bg-sidebar-brand p-1.5 rounded-lg text-white">
                  <ShieldCheck size={20} />
                </div>
                <span className="tracking-tight text-text-dark">
                  SABUYJAI{" "}
                  <span className="text-sidebar-brand uppercase">
                    {isAffiliate ? "Partner" : "Admin"}
                  </span>
                </span>
              </div>
              {/* Mobile close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-sidebar-text-muted"
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
                  <p className="px-4 mb-2 text-[10px] font-bold text-sidebar-text-muted uppercase tracking-[0.2em]">
                    {group.title}
                  </p>
                )}
                <div className="space-y-1">
                  {(group.items || [group]).map(
                    (item: {
                      name: string;
                      href: string;
                      icon: React.ElementType;
                    }) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          pathname === item.href
                            ? "bg-sidebar-active-bg text-sidebar-active-text shadow-sm"
                            : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-brand"
                        }`}
                      >
                        <item.icon
                          size={18}
                          className={
                            pathname === item.href
                              ? "text-sidebar-brand"
                              : "text-sidebar-text-muted"
                          }
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    ),
                  )}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-border-light bg-muted-light shrink-0">
            <div className="flex items-center gap-3 p-2">
              <div className="w-9 h-9 rounded-full bg-sidebar-brand flex items-center justify-center text-white font-medium shrink-0">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0 leading-tight">
                <p className="text-sm font-semibold text-text-dark truncate">
                  {user?.username || "Administrator"}
                </p>
                <p className="text-[11px] text-text-medium truncate">
                  {user?.email || "admin@sabuyjai.com"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sidebar-text-muted hover:text-danger transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="ออกจากระบบ"
              >
                {isLoggingOut ? (
                  <div className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-sidebar-text-muted border-t-transparent" />
                ) : (
                  <LogOut size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 3. Main Content */}
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col ${isSidebarOpen ? "lg:pl-72" : "lg:pl-0"}`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-navbar-border bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-navbar-text hover:bg-sidebar-hover hover:text-navbar-text-hover transition-all active:scale-95"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4">
            <NotificationDropdown
              pendingCount={pendingCount}
              pendingQuotes={pendingQuotes}
            />
            <div className="h-6 w-px bg-navbar-border" />
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[10px] font-bold text-sidebar-text-muted uppercase tracking-tight">
                System Status
              </span>
              <span className="text-xs font-medium text-status-online">
                Online
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        {children}
      </div>
    </div>
  );
}
