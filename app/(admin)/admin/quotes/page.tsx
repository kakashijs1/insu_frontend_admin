import { getQuoteRequests } from "@/services/quote";
import Link from "next/link";
import { Eye, Handshake, FileText, CreditCard } from "lucide-react";
import { STATUS_CONFIG } from "@/types/quote";
import { formatThaiDate } from "@/utils/format";
import QuoteFilterBar from "./QuoteFilterBar";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    installment?: string;
  }>;
}

export default async function QuotesListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const status = params.status || undefined;
  const installment = params.installment || undefined;

  const { data: quotes, pagination } = await getQuoteRequests(
    page,
    status,
    undefined,
    installment,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">
          คำขอใบเสนอราคาทั้งหมด
        </h1>
        <p className="text-text-medium text-sm mt-1">
          จัดการคำขอใบเสนอราคาจากลูกค้าทั้งหมดในระบบ
        </p>
      </div>

      <QuoteFilterBar currentStatus={status} currentInstallment={installment} />

      <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
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
                  การชำระ
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  แหล่งที่มา
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">
                  กรมธรรม์
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
                      {q.installmentPlan ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                          <CreditCard size={12} />
                          ผ่อน {q.installmentPlan} งวด
                        </span>
                      ) : (
                        <span className="text-xs text-text-light">
                          จ่ายเต็ม
                        </span>
                      )}
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
                    <td className="px-6 py-4">
                      {q.policyDocumentUrl ? (
                        <a
                          href={q.policyDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <FileText size={14} />
                          PDF
                        </a>
                      ) : (
                        <span className="text-xs text-text-light">-</span>
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
                    colSpan={9}
                    className="px-6 py-10 text-center text-text-medium"
                  >
                    ไม่พบข้อมูลคำขอใบเสนอราคา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border-light/50 flex items-center justify-between text-xs text-text-medium font-medium">
            <p>
              หน้า {pagination.page} จาก {pagination.totalPages} (
              {pagination.total} รายการ)
            </p>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Link
                  href={`/admin/quotes?page=${pagination.page - 1}${status ? `&status=${status}` : ""}${installment ? `&installment=${installment}` : ""}`}
                  className="px-4 py-2 bg-white border border-border-light rounded-xl hover:bg-bg-light transition-colors"
                >
                  ก่อนหน้า
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link
                  href={`/admin/quotes?page=${pagination.page + 1}${status ? `&status=${status}` : ""}${installment ? `&installment=${installment}` : ""}`}
                  className="px-4 py-2 bg-white border border-border-light rounded-xl hover:bg-bg-light transition-colors"
                >
                  ถัดไป
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
