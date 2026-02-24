import Link from "next/link";
import { Handshake, Users, Plus } from "lucide-react";
import { getAffiliates } from "@/services/affiliate";

export default async function AffiliatePage() {
  const { data: affiliates, pagination } = await getAffiliates();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            จัดการ Affiliate
          </h1>
          <p className="text-slate-500 text-sm">
            สร้างและจัดการ Affiliate พาร์ทเนอร์ทั้งหมด
          </p>
        </div>
        <Link
          href="/admin/affiliate/create"
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all"
        >
          <Plus size={16} />
          เพิ่ม Affiliate ใหม่
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">
              Affiliate ทั้งหมด
            </p>
            <Users size={20} className="text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {pagination?.total ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">Active</p>
            <Handshake size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {Array.isArray(affiliates)
              ? affiliates.filter((a: { isActive?: boolean }) => a.isActive)
                  .length
              : 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
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
            <tbody className="divide-y divide-slate-100">
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
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {a.fullName || a.username || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-lg">
                          {a.referralCode || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {a.phone || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {a.commissionRate != null
                          ? `${a.commissionRate}%`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {a._count?.commissions ?? 0} เคส
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            a.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {a.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/affiliate/${a.id}`}
                          className="text-teal-600 font-semibold hover:underline text-xs"
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
                    className="px-6 py-10 text-center text-slate-400"
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
