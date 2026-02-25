import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Car,
  Shield,
  Building2,
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getMyCaseById } from "@/services/affiliate";

interface MyCaseDetailPageProps {
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

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING: {
    label: "รอดำเนินการ",
    cls: "bg-warning-light text-warning border-warning/20",
  },
  REVIEWING: {
    label: "กำลังตรวจสอบ",
    cls: "bg-info-light text-info border-info/20",
  },
  QUOTED: {
    label: "เสนอราคาแล้ว",
    cls: "bg-info-light text-secondary border-secondary/20",
  },
  APPROVED: {
    label: "อนุมัติแล้ว",
    cls: "bg-success-light text-success border-success/20",
  },
  REJECTED: {
    label: "ปฏิเสธ",
    cls: "bg-danger-light text-danger border-danger/20",
  },
  CANCELLED: {
    label: "ยกเลิก",
    cls: "bg-bg-light text-text-medium border-border-light",
  },
  EXPIRED: {
    label: "หมดอายุ",
    cls: "bg-bg-light text-text-medium border-border-light",
  },
};

export default async function MyCaseDetailPage({
  params,
}: MyCaseDetailPageProps) {
  const { id } = await params;
  const caseData = await getMyCaseById(id);

  if (!caseData) {
    notFound();
  }

  const commissions = caseData.commissions ?? [];
  const statusInfo = STATUS_MAP[caseData.status] ?? {
    label: caseData.status,
    cls: "bg-bg-light text-text-medium border-border-light",
  };

  const totalCommission = commissions.reduce(
    (sum, c) => sum + c.commissionAmount,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/my-cases"
          className="p-2 rounded-lg text-text-light hover:text-text-dark hover:bg-bg-light transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-dark">
            {caseData.firstName} {caseData.lastName}
          </h1>
          <p className="text-text-medium text-sm">รายละเอียดเคส</p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusInfo.cls}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="font-semibold text-text-dark mb-4">ข้อมูลรถยนต์</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Car, label: "ยี่ห้อ", value: caseData.brand },
                { icon: Car, label: "รุ่น", value: caseData.model },
                {
                  icon: Calendar,
                  label: "ปี",
                  value: String(caseData.year),
                },
                {
                  icon: Car,
                  label: "รุ่นย่อย",
                  value:
                    caseData.variant === "unknown"
                      ? "ไม่ระบุ"
                      : caseData.variant,
                },
                { icon: Shield, label: "ชั้นประกัน", value: caseData.tier },
                {
                  icon: Building2,
                  label: "บริษัทประกัน",
                  value: caseData.insuranceCompany,
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

          <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="font-semibold text-text-dark mb-4">ข้อมูลลูกค้า</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: User,
                  label: "ชื่อผู้ติดต่อ",
                  value: `${caseData.firstName} ${caseData.lastName}`,
                },
                { icon: Phone, label: "เบอร์โทร", value: caseData.phone },
                {
                  icon: User,
                  label: "ลูกค้าในระบบ",
                  value: caseData.customer?.name,
                },
                {
                  icon: Phone,
                  label: "เบอร์ลูกค้า",
                  value: caseData.customer?.phone,
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

          {commissions.length > 0 && (
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
                      <th className="px-6 py-3">เบี้ยประกัน</th>
                      <th className="px-6 py-3">อัตราคอม</th>
                      <th className="px-6 py-3">ค่าคอมมิชชั่น</th>
                      <th className="px-6 py-3">สถานะ</th>
                      <th className="px-6 py-3 text-right">วันที่</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light/50">
                    {commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-bg-light/40">
                        <td className="px-6 py-4 text-text-medium">
                          {formatCurrency(c.premiumAmount)}
                        </td>
                        <td className="px-6 py-4 text-text-medium">
                          {c.commissionRate}%
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-primary">
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
                        <td className="px-6 py-4 text-right text-xs text-text-light">
                          {c.paidAt
                            ? formatDate(c.paidAt)
                            : formatDate(c.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-text-dark">สรุป</h2>
            <div className="space-y-3">
              {caseData.premiumAmount != null && (
                <div className="rounded-xl bg-info-light border border-info/20 p-4">
                  <p className="text-xs font-medium text-info">เบี้ยประกัน</p>
                  <p className="text-xl font-bold text-info mt-1">
                    {formatCurrency(caseData.premiumAmount)}
                  </p>
                </div>
              )}
              {totalCommission > 0 && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                  <p className="text-xs font-medium text-primary">ค่าคอมรวม</p>
                  <p className="text-xl font-bold text-primary mt-1">
                    {formatCurrency(totalCommission)}
                  </p>
                </div>
              )}
              <div className="rounded-xl bg-bg-light border border-border-light p-4">
                <p className="text-xs font-medium text-text-medium">สถานะเคส</p>
                <p className="text-sm font-bold text-text-dark mt-1 flex items-center gap-2">
                  {caseData.status === "APPROVED" ? (
                    <CheckCircle2 size={14} className="text-success" />
                  ) : (
                    <Clock size={14} className="text-warning" />
                  )}
                  {statusInfo.label}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm space-y-3">
            <h2 className="font-semibold text-text-dark">ไทม์ไลน์</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-medium">วันที่สร้าง</span>
                <span className="font-medium text-text-dark">
                  {formatDate(caseData.createdAt)}
                </span>
              </div>
              {caseData.reviewedAt && (
                <div className="flex justify-between">
                  <span className="text-text-medium">วันที่ตรวจสอบ</span>
                  <span className="font-medium text-text-dark">
                    {formatDate(caseData.reviewedAt)}
                  </span>
                </div>
              )}
              {caseData.purchaseDate && (
                <div className="flex justify-between">
                  <span className="text-text-medium">วันที่ซื้อ</span>
                  <span className="font-medium text-text-dark">
                    {formatDate(caseData.purchaseDate)}
                  </span>
                </div>
              )}
              {caseData.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-text-medium">วันหมดอายุ</span>
                  <span className="font-medium text-text-dark">
                    {formatDate(caseData.expiryDate)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-medium">อัพเดทล่าสุด</span>
                <span className="font-medium text-text-dark">
                  {formatDate(caseData.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
