import { redirect } from "next/navigation";
import { getQuoteRequests, getQuoteStats } from "@/services/quote";
import { getAuthState } from "@/utils/auth";
import Link from "next/link";
import { FileText, Clock, CheckCircle2, Handshake, Eye } from "lucide-react";
import { STATUS_CONFIG } from "@/types/quote";
import { formatThaiDate } from "@/utils/format";

export default async function AdminPage() {
  const authState = await getAuthState();
  if (authState.role === "Affiliate") {
    redirect("/admin/my-cases");
  }

  const [statsResult, quotesResult] = await Promise.all([
    getQuoteStats(),
    getQuoteRequests(1),
  ]);

  const stats = statsResult ?? {
    total: 0,
    pending: 0,
    approved: 0,
    fromAffiliate: 0,
  };
  const quotes = quotesResult.data ?? [];

  const statCards = [
    {
      label: "คำขอทั้งหมด",
      value: stats.total,
      icon: FileText,
      cls: "text-info bg-info-light",
    },
    {
      label: "รอดำเนินการ",
      value: stats.pending,
      icon: Clock,
      cls: "text-warning bg-warning-light",
    },
    {
      label: "อนุมัติแล้ว",
      value: stats.approved,
      icon: CheckCircle2,
      cls: "text-success bg-success-light",
    },
    {
      label: "จาก Affiliate",
      value: stats.fromAffiliate,
      icon: Handshake,
      cls: "text-secondary bg-info-light",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">Dashboard</h1>
        <p className="text-text-medium text-sm mt-1">
          สรุปข้อมูลคำขอใบเสนอราคาประกันภัยจากลูกค้า
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl border border-border-light shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-text-dark mt-1">
                  {stat.value.toLocaleString("th-TH")}
                </p>
              </div>
              <div className={`${stat.cls} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quote Requests Table */}
      <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border-light/50 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-text-dark">คำขอใบเสนอราคาล่าสุด</h2>
            <p className="text-xs text-text-medium mt-1">
              ข้อมูลจากลูกค้าที่ส่งแบบฟอร์มประกันภัย
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-bg-light/50 text-text-medium font-medium">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  ลูกค้า
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  เบอร์โทร
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  ข้อมูลรถ
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  แหล่งที่มา
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  วันที่ส่ง
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/50">
              {quotes.map((q) => {
                const statusInfo =
                  STATUS_CONFIG[q.status] ?? STATUS_CONFIG.PENDING;

                return (
                  <tr
                    key={q.id}
                    className="hover:bg-bg-light/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="leading-tight">
                        <p className="font-medium text-text-dark">
                          {q.firstName} {q.lastName}
                        </p>
                        <p className="text-xs text-text-light">
                          {q.customer?.name ?? "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-medium">{q.phone}</td>
                    <td className="px-6 py-4">
                      <div className="leading-tight">
                        <p className="font-medium text-text-dark">
                          {q.brand} {q.model} {q.year}
                        </p>
                        <p className="text-xs text-text-light">
                          {q.tier} /{" "}
                          {q.variant === "unknown"
                            ? "ไม่ระบุรุ่นย่อย"
                            : q.variant}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.cls}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {q.referralCode ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-info-light text-info border border-info/20">
                          <Handshake size={12} />
                          {q.referralCode}
                        </span>
                      ) : (
                        <span className="text-xs text-text-light">Direct</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-medium">
                      {formatThaiDate(q.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/quote/${q.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-bg-light text-text-dark border border-border-light hover:bg-bg-soft transition"
                      >
                        <Eye size={14} />
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {quotes.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-text-medium"
                  >
                    ยังไม่มีคำขอใบเสนอราคา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
