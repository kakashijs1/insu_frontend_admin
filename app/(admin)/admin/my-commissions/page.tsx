import { Wallet } from "lucide-react";
import { getMyCommissions } from "@/services/affiliate";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default async function MyCommissionsPage() {
  const { data: commissions, summary, pagination } = await getMyCommissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ค่าคอมมิชชั่น</h1>
        <p className="text-slate-500 text-sm">
          รายการค่าคอมมิชชั่นทั้งหมดของคุณ
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-teal-600">ค่าคอมรวม</p>
            <p className="mt-1 text-2xl font-bold text-teal-800">
              {formatCurrency(summary.totalAmount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-teal-600">
              {summary.totalCount ?? 0} รายการ
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-600">รอจ่าย</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">
              {formatCurrency(summary.pendingAmount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-amber-600">
              {summary.pendingCount ?? 0} รายการ
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-600">จ่ายแล้ว</p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">
              {formatCurrency(summary.paidAmount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-emerald-600">
              {summary.paidCount ?? 0} รายการ
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">ลูกค้า / รถ</th>
                <th className="px-6 py-4">เบี้ยประกัน</th>
                <th className="px-6 py-4">อัตรา</th>
                <th className="px-6 py-4">ค่าคอม</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">วันที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.isArray(commissions) && commissions.length > 0 ? (
                commissions.map((c) => {
                  const qr =
                    "quoteRequest" in c
                      ? (c.quoteRequest as {
                          firstName: string;
                          lastName: string;
                          brand: string;
                          model: string;
                          year: number;
                        })
                      : null;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">
                          {qr ? `${qr.firstName} ${qr.lastName}` : "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {qr ? `${qr.brand} ${qr.model} ${qr.year}` : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatCurrency(c.premiumAmount)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {c.commissionRate}%
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-teal-700">
                          {formatCurrency(c.commissionAmount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            c.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}
                        >
                          {c.status === "PAID" ? "จ่ายแล้ว" : "รอจ่าย"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {c.status === "PAID" && c.paidAt
                          ? formatDate(c.paidAt)
                          : formatDate(c.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Wallet size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500">
                      ยังไม่มีค่าคอมมิชชั่น
                    </p>
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
