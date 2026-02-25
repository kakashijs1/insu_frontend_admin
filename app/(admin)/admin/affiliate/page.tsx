import Link from "next/link";
import { Handshake, Users, Plus } from "lucide-react";
import { getAffiliates } from "@/services/affiliate";
import { getAuthState } from "@/utils/auth";

export default async function AffiliatePage() {
  const [authState, { data: affiliates, pagination }] = await Promise.all([
    getAuthState(),
    getAffiliates(),
  ]);
  const isSuper = authState.role === "Super";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">
            จัดการ Affiliate
          </h1>
          <p className="text-text-medium text-sm">
            สร้างและจัดการ Affiliate พาร์ทเนอร์ทั้งหมด
          </p>
        </div>
        {isSuper && (
          <Link
            href="/admin/affiliate/create"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary transition-all"
          >
            <Plus size={16} />
            เพิ่ม Affiliate ใหม่
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-text-medium">
              Affiliate ทั้งหมด
            </p>
            <Users size={20} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-text-dark mt-2">
            {pagination?.total ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-text-medium">Active</p>
            <Handshake size={20} className="text-success" />
          </div>
          <p className="text-2xl font-bold text-text-dark mt-2">
            {Array.isArray(affiliates)
              ? affiliates.filter((a: { isActive?: boolean }) => a.isActive)
                  .length
              : 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-light text-text-medium uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">ชื่อ</th>
                <th className="px-6 py-4">รหัสแนะนำ</th>
                <th className="px-6 py-4">เบอร์โทร</th>
                <th className="px-6 py-4">ค่าคอม %</th>
                <th className="px-6 py-4">จำนวนเคส</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {Array.isArray(affiliates) && affiliates.length > 0 ? (
                affiliates.map(
                  (a: {
                    id: string;
                    fullName?: string | null;
                    username?: string;
                    referralCode?: string | null;
                    phone?: string | null;
                    commissionRate?: number | null;
                    isActive?: boolean;
                    _count?: { commissions?: number };
                  }) => (
                    <tr
                      key={a.id}
                      className="hover:bg-bg-light/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-text-dark">
                        {a.fullName || a.username || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-bg-light px-2 py-1 rounded-lg">
                          {a.referralCode || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-medium">
                        {a.phone || "-"}
                      </td>
                      <td className="px-6 py-4 text-text-medium">
                        {a.commissionRate != null
                          ? `${a.commissionRate}%`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-text-medium">
                        {a._count?.commissions ?? 0} เคส
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            a.isActive
                              ? "bg-success-light text-success border border-success/20"
                              : "bg-bg-light text-text-medium border border-border-light"
                          }`}
                        >
                          {a.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/affiliate/${a.id}`}
                          className="text-teal font-semibold hover:underline text-xs"
                        >
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-text-light"
                  >
                    ยังไม่มี Affiliate ในระบบ
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
