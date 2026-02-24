import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getMyCases } from "@/services/affiliate";

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

export default async function MyCasesPage() {
  const { data: cases, pagination } = await getMyCases();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">เคสของฉัน</h1>
        <p className="text-slate-500 text-sm">
          รายการลูกค้าที่ใช้รหัสแนะนำของคุณ ({pagination?.total ?? 0} เคส)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">ลูกค้า</th>
                <th className="px-6 py-4">รถยนต์</th>
                <th className="px-6 py-4">เบี้ยประกัน</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4 text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.isArray(cases) && cases.length > 0 ? (
                cases.map(
                  (c: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    brand: string;
                    model: string;
                    year: number;
                    tier: string;
                    premiumAmount: number | null;
                    status: string;
                    createdAt: string | Date;
                  }) => {
                    const statusInfo = STATUS_MAP[c.status] ?? {
                      label: c.status,
                      cls: "bg-slate-100 text-slate-500 border-slate-200",
                    };
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">
                            {c.firstName} {c.lastName}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <p>
                            {c.brand} {c.model} {c.year}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ชั้น {c.tier}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {c.premiumAmount
                            ? formatCurrency(c.premiumAmount)
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.cls}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/my-cases/${c.id}`}
                            className="text-teal-600 font-semibold hover:underline text-xs"
                          >
                            ดูรายละเอียด
                          </Link>
                        </td>
                      </tr>
                    );
                  },
                )
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Briefcase
                      size={40}
                      className="mx-auto text-slate-300 mb-3"
                    />
                    <p className="text-sm text-slate-500">
                      ยังไม่มีเคสที่ใช้รหัสแนะนำของคุณ
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
