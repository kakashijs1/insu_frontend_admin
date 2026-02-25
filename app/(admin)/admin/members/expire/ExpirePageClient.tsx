"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarClock,
  Search,
  PhoneCall,
  MessageCircle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Filter,
} from "lucide-react";

type ExpireStatus = "expired" | "today" | "soon" | "ok";
type RangeFilter = "all" | "7" | "30" | "expired" | "today";
type SortOrder = "soonest" | "latest";

type MemberExpire = {
  id: string;
  fullName: string;
  phone: string;
  insuranceName: string;
  expiryDate: string;
};

function formatThaiDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function diffDaysFromToday(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function getStatus(daysLeft: number): ExpireStatus {
  if (daysLeft < 0) return "expired";
  if (daysLeft === 0) return "today";
  if (daysLeft <= 30) return "soon";
  return "ok";
}

function StatusBadge({
  status,
  daysLeft,
}: {
  status: ExpireStatus;
  daysLeft: number;
}) {
  const map = {
    expired: {
      label: "หมดอายุแล้ว",
      cls: "bg-danger-light text-danger border-danger/20",
      icon: ShieldX,
    },
    today: {
      label: "หมดอายุวันนี้",
      cls: "bg-warning-light text-warning border-warning/20",
      icon: ShieldAlert,
    },
    soon: {
      label: "ใกล้หมดอายุ",
      cls: "bg-warning-light text-warning border-warning/20",
      icon: CalendarClock,
    },
    ok: {
      label: "ยังไม่ใกล้หมด",
      cls: "bg-success-light text-success border-success/20",
      icon: ShieldCheck,
    },
  } satisfies Record<
    ExpireStatus,
    { label: string; cls: string; icon: React.ElementType }
  >;

  const item = map[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${item.cls}`}
    >
      <Icon size={14} />
      {item.label}
      {status !== "expired" ? (
        <span className="opacity-70">({daysLeft} วัน)</span>
      ) : null}
    </span>
  );
}

function CardStat({
  title,
  value,
  sub,
  icon: Icon,
  className = "",
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border-light bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-medium">{title}</p>
          <p className="mt-1 text-2xl font-bold text-text-dark">{value}</p>
          <p className="mt-1 text-xs text-text-medium">{sub}</p>
        </div>
        <div className="rounded-xl bg-bg-light p-3 text-text-dark">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function ExpirePageClient({ data }: { data: MemberExpire[] }) {
  const [q, setQ] = useState("");
  const [range, setRange] = useState<RangeFilter>("all");
  const [sort, setSort] = useState<SortOrder>("soonest");

  const rows = useMemo(() => {
    const filtered = data
      .map((m) => {
        const daysLeft = diffDaysFromToday(m.expiryDate);
        const status = getStatus(daysLeft);
        return { ...m, daysLeft, status };
      })
      .filter((m) => {
        const text =
          `${m.fullName} ${m.phone} ${m.insuranceName}`.toLowerCase();
        const okQ = text.includes(q.trim().toLowerCase());

        let okRange = true;
        if (range === "expired") okRange = m.daysLeft < 0;
        if (range === "today") okRange = m.daysLeft === 0;
        if (range === "7") okRange = m.daysLeft >= 0 && m.daysLeft <= 7;
        if (range === "30") okRange = m.daysLeft >= 0 && m.daysLeft <= 30;

        return okQ && okRange;
      });

    filtered.sort((a, b) =>
      sort === "soonest" ? a.daysLeft - b.daysLeft : b.daysLeft - a.daysLeft,
    );
    return filtered;
  }, [data, q, range, sort]);

  const stats = useMemo(() => {
    const enriched = data.map((m) => {
      const daysLeft = diffDaysFromToday(m.expiryDate);
      return { ...m, daysLeft, status: getStatus(daysLeft) };
    });

    const expired = enriched.filter((x) => x.status === "expired").length;
    const today = enriched.filter((x) => x.status === "today").length;
    const d7 = enriched.filter(
      (x) => x.daysLeft >= 0 && x.daysLeft <= 7,
    ).length;
    const d30 = enriched.filter(
      (x) => x.daysLeft >= 0 && x.daysLeft <= 30,
    ).length;

    return { expired, today, d7, d30, total: enriched.length };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-dark">
          เช็ควันหมดอายุประกัน
        </h1>
        <p className="mt-1 text-sm text-text-medium">
          ติดตามลูกค้าที่ใกล้หมดอายุ / หมดอายุแล้ว เพื่อโทรแจ้งและต่ออายุ
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardStat
          title="หมดอายุแล้ว"
          value={`${stats.expired}`}
          sub="ควรติดต่อด่วน"
          icon={ShieldX}
        />
        <CardStat
          title="หมดอายุวันนี้"
          value={`${stats.today}`}
          sub="ควรติดตามทันที"
          icon={ShieldAlert}
        />
        <CardStat
          title="ใกล้หมด (7 วัน)"
          value={`${stats.d7}`}
          sub="แนะนำโทรแจ้ง"
          icon={CalendarClock}
        />
        <CardStat
          title="ใกล้หมด (30 วัน)"
          value={`${stats.d30}`}
          sub={`จากทั้งหมด ${stats.total} ราย`}
          icon={ShieldCheck}
        />
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-border-light bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-2 rounded-xl border border-border-light bg-bg-light px-3 py-2 lg:max-w-md">
            <Search size={18} className="text-text-medium" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหา: ชื่อ / เบอร์ / ประเภทประกัน"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-white px-3 py-2">
              <Filter size={16} className="text-text-medium" />
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as RangeFilter)}
                className="text-sm font-semibold text-text-dark outline-none"
              >
                <option value="all">ทั้งหมด</option>
                <option value="today">หมดอายุวันนี้</option>
                <option value="7">ใกล้หมดใน 7 วัน</option>
                <option value="30">ใกล้หมดใน 30 วัน</option>
                <option value="expired">หมดอายุแล้ว</option>
              </select>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-white px-3 py-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
                className="text-sm font-semibold text-text-dark outline-none"
              >
                <option value="soonest">เรียง: ใกล้หมดก่อน</option>
                <option value="latest">เรียง: ไกลหมดก่อน</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
          <div>
            <p className="font-bold text-text-dark">รายการลูกค้า</p>
            <p className="text-xs text-text-medium mt-1">
              แสดงผล {rows.length} รายการ ตามตัวกรอง
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-bg-light/50 text-text-medium">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  ลูกค้า
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  เบอร์โทร
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  ประกัน
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  วันหมดอายุ
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">
                  จัดการ
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-light">
              {rows.map((m) => (
                <tr key={m.id} className="hover:bg-bg-light/40">
                  <td className="px-6 py-4">
                    <div className="leading-tight">
                      <p className="font-semibold text-text-dark">
                        {m.fullName}
                      </p>
                      <p className="text-xs text-text-light">
                        ID: {m.id.slice(0, 8)}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-text-dark">{m.phone}</td>

                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full border border-teal/20 bg-teal/5 px-3 py-1 text-xs font-semibold text-teal">
                      {m.insuranceName}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-text-dark">
                    {formatThaiDate(m.expiryDate)}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={m.status} daysLeft={m.daysLeft} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      <a
                        href={`tel:${m.phone.replace(/-/g, "")}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-white px-3 py-2 text-xs font-semibold text-text-dark hover:bg-bg-light"
                      >
                        <PhoneCall size={14} />
                        โทร
                      </a>

                      <a
                        href={`sms:${m.phone.replace(/-/g, "")}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-white px-3 py-2 text-xs font-semibold text-text-dark hover:bg-bg-light"
                      >
                        <MessageCircle size={14} />
                        ข้อความ
                      </a>

                      <a
                        href={`/admin/quote/${m.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-secondary"
                      >
                        รายละเอียด <ArrowRight size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-text-medium"
                  >
                    ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-text-medium">
        * แนะนำ: ตั้งค่าให้แอดมินกรอง &quot;ใกล้หมดใน 7 วัน&quot; ทุกเช้า
        เพื่อโทรแจ้งลูกค้าก่อนหมดอายุ
      </div>
    </div>
  );
}
