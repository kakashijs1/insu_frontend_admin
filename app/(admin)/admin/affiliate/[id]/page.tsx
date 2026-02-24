import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  CreditCard,
  Percent,
  Hash,
  User,
} from "lucide-react";
import { getAffiliateById } from "@/services/affiliate";
import AffiliateActions from "./AffiliateActions";

interface AffiliateDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function AffiliateDetailPage({
  params,
}: AffiliateDetailPageProps) {
  const { id } = await params;
  const affiliate = await getAffiliateById(id);

  if (!affiliate) {
    redirect("/admin/affiliate");
  }

  const commissions = affiliate.commissions ?? [];

  const totalCommission = commissions.reduce(
    (sum, c) => sum + c.commissionAmount,
    0,
  );
  const pendingCommission = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/affiliate"
          className="p-2 rounded-lg text-text-light hover:text-text-dark hover:bg-bg-light transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-dark">
            {affiliate.fullName || affiliate.username || "Affiliate"}
          </h1>
          <p className="text-text-medium text-sm">รายละเอียด Affiliate</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="font-semibold text-text-dark mb-4">ข้อมูลส่วนตัว</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: User,
                  label: "ชื่อ-นามสกุล",
                  value: affiliate.fullName,
                },
                { icon: Mail, label: "Email", value: affiliate.email },
                { icon: Phone, label: "เบอร์โทร", value: affiliate.phone },
                {
                  icon: Hash,
                  label: "รหัสแนะนำ",
                  value: affiliate.referralCode,
                },
                { icon: Building2, label: "ธนาคาร", value: affiliate.bankName },
                {
                  icon: CreditCard,
                  label: "เลขบัญชี",
                  value: affiliate.bankAccountNumber,
                },
                {
                  icon: User,
                  label: "ชื่อบัญชี",
                  value: affiliate.bankAccountName,
                },
                {
                  icon: Percent,
                  label: "ค่าคอม",
                  value:
                    affiliate.commissionRate != null
                      ? `${affiliate.commissionRate}%`
                      : "-",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-xl border border-border-light bg-bg-light/50 p-3"
                >
                  <item.icon
                    size={16}
                    className="mt-0.5 text-text-light shrink-0"
                  />
                  <div>
                    <p className="text-[11px] font-medium text-text-light uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-text-dark mt-0.5">
                      {item.value || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border-light/50">
              <h2 className="font-semibold text-text-dark">ค่าคอมมิชชั่น</h2>
              <p className="text-xs text-text-medium mt-1">
                ทั้งหมด {commissions.length} รายการ
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-light/80 text-text-medium text-[10px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3">ลูกค้า / รถ</th>
                    <th className="px-6 py-3">เบี้ยประกัน</th>
                    <th className="px-6 py-3">ค่าคอม</th>
                    <th className="px-6 py-3">สถานะ</th>
                    <th className="px-6 py-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/50">
                  {commissions.length > 0 ? (
                    commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-bg-light/40">
                        <td className="px-6 py-4">
                          <p className="font-medium text-text-dark">
                            {c.quoteRequest.firstName} {c.quoteRequest.lastName}
                          </p>
                          <p className="text-xs text-text-medium">
                            {c.quoteRequest.brand} {c.quoteRequest.model}{" "}
                            {c.quoteRequest.year}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-text-medium">
                          {formatCurrency(c.premiumAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-primary">
                            {formatCurrency(c.commissionAmount)}
                          </p>
                          <p className="text-[10px] text-text-light">
                            {c.commissionRate}%
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
                        <td className="px-6 py-4 text-right">
                          {c.status === "PENDING" && (
                            <AffiliateActions commissionId={c.id} />
                          )}
                          {c.status === "PAID" && c.paidAt && (
                            <span className="text-xs text-text-light">
                              {formatDate(c.paidAt)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-text-light"
                      >
                        ยังไม่มีค่าคอมมิชชั่น
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-text-dark">สรุป</h2>
            <div className="space-y-3">
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs font-medium text-primary">ค่าคอมรวม</p>
                <p className="text-xl font-bold text-primary mt-1">
                  {formatCurrency(totalCommission)}
                </p>
              </div>
              <div className="rounded-xl bg-warning-light border border-warning/20 p-4">
                <p className="text-xs font-medium text-warning">รอจ่าย</p>
                <p className="text-xl font-bold text-warning mt-1">
                  {formatCurrency(pendingCommission)}
                </p>
              </div>
              <div className="rounded-xl bg-bg-light border border-border-light p-4">
                <p className="text-xs font-medium text-text-medium">สถานะ</p>
                <p className="text-sm font-bold text-text-dark mt-1">
                  {affiliate.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
