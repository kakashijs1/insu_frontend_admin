"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PendingQuoteNotification } from "@/types/quote";

interface NotificationDropdownProps {
  pendingCount: number;
  pendingQuotes: PendingQuoteNotification[];
}

function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} วันที่แล้ว`;
}

export default function NotificationDropdown({
  pendingCount,
  pendingQuotes,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-teal-600 relative transition-colors"
      >
        <Bell size={20} />
        {pendingCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full px-1 border-2 border-white">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-[100] overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">แจ้งเตือน</h3>
              {pendingCount > 0 && (
                <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                  {pendingCount} รายการใหม่
                </span>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {pendingQuotes.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                ไม่มีคำขอใหม่
              </div>
            ) : (
              pendingQuotes.map((q) => (
                <Link
                  key={q.id}
                  href={`/admin/quote/${q.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <FileText size={16} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {q.firstName} {q.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {q.tier} — {q.brand} {q.model}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {timeAgo(q.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-amber-400" />
                </Link>
              ))
            )}
          </div>

          {pendingCount > 0 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                ดูทั้งหมด
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
