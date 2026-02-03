import { Handshake, TrendingUp, Users, Copy, ExternalLink } from 'lucide-react';

export default function AffiliatePage() {
  const stats = [
    { label: 'พาร์ทเนอร์ทั้งหมด', value: '124', icon: Users, color: 'text-blue-600' },
    { label: 'ยอดคลิกเดือนนี้', value: '45,200', icon: ExternalLink, color: 'text-purple-600' },
    { label: 'คอมมิชชั่นที่ค้างชำระ', value: '฿84,200', icon: TrendingUp, color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Affiliate พาร์ทเนอร์</h1>
          <p className="text-slate-500 text-sm">จัดการลิงก์และตรวจสอบรายได้ของตัวแทนจำหน่าย</p>
        </div>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all">
          + เพิ่มพาร์ทเนอร์ใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">ชื่อพาร์ทเนอร์</th>
              <th className="px-6 py-4">รหัสแนะนำ</th>
              <th className="px-6 py-4">จำนวนเคส</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3].map((_, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">Agent นามสมมติ {i+1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500 font-mono">
                    REF{2024 + i} <Copy size={14} className="cursor-pointer hover:text-teal-600" />
                  </div>
                </td>
                <td className="px-6 py-4">12 เคส</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Active</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-teal-600 font-semibold hover:underline">ดูรายละเอียด</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}