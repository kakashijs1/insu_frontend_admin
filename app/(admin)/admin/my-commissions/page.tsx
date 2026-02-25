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
        <h1 className="text-2xl font-bold text-text-dark">ค่าคอมมิชชั่น</h1>
        <p className="text-text-medium text-sm">
          รายการค่าคอมมิชชั่นทั้งหมดของคุณ
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-teal/20 bg-teal/5 p-5 shadow-sm">
            <p className="text-sm font-medium text-teal">ค่าคอมรวม</p>
            <p className="mt-1 text-2xl font-bold text-text-dark">
              {formatCurrency(summary.totalAmount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-teal">
              {summary.totalCount ?? 0} รายการ
            </p>
          </div>
          <div className="rounded-2xl border border-warning/20 bg-warning-light p-5 shadow-sm">
            <p className="text-sm font-medium text-warning">รอจ่าย</p>
            <p className="mt-1 text-2xl font-bold text-text-dark">
              {formatCurrency(summary.pendingAmount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-warning">
              {summary.pendingCount ?? 0} รายการ
            </p>
          </div>
          <div className="rounded-2xl border border-success/20 bg-success-light p-5 shadow-sm">
            <p className="text-sm font-medium text-success">จ่ายแล้ว</p>
            <p className="mt-1 text-2xl font-bold text-text-dark">
              {formatCurrency(summary.paidAmount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-success">
              {summary.paidCount ?? 0} รายการ
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-light text-text-medium uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">ลูกค้า / รถ</th>
                <th className="px-6 py-4">เบี้ยประกัน</th>
                <th className="px-6 py-4">อัตรา</th>
                <th className="px-6 py-4">ค่าคอม</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">วันที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
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
                      className="hover:bg-bg-light/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-text-dark">
                          {qr ? `${qr.firstName} ${qr.lastName}` : "-"}
                        </p>
                        <p className="text-xs text-text-medium">
                          {qr ? `${qr.brand} ${qr.model} ${qr.year}` : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-text-dark">
                        {formatCurrency(c.premiumAmount)}
                      </td>
                      <td className="px-6 py-4 text-text-medium">
                        {c.commissionRate}%
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-teal">
                          {formatCurrency(c.commissionAmount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            c.status === "PAID"
                              ? "bg-success-light text-success border-success/20"
                              : "bg-warning-light text-warning border-warning/20"
                          }`}
                        >
                          {c.status === "PAID" ? "จ่ายแล้ว" : "รอจ่าย"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-medium">
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
                    <Wallet
                      size={40}
                      className="mx-auto text-text-light mb-3"
                    />
                    <p className="text-sm text-text-medium">
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
