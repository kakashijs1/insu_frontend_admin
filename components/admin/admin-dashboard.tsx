'use client'

// @/components/admin/admin-dashboard.tsx
import { Users, FileCheck, AlertCircle, TrendingUp, ArrowRight, Pencil, Trash2 } from 'lucide-react'

type Member = {
  id: string
  fullName: string
  phone: string
  activeInsurance: string
  purchaseDate: string
  expiryDate: string

  // ✅ เพิ่มใหม่
  priceTotal: number // ราคารวม
  installmentTotal: number // แบ่งชำระทั้งหมดกี่งวด
  installmentPaid: number // ชำระแล้วกี่งวด
}

export default function AdminDashboard() {
  const stats = [
    { label: 'สมาชิกทั้งหมด', value: '2,840', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'กรมธรรม์อนุมัติแล้ว', value: '1,205', icon: FileCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'รอดำเนินการ', value: '18', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'ยอดขายเดือนนี้', value: '฿1.2M', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  // ✅ ตัวอย่างข้อมูลสมาชิก
  const members: Member[] = [
    {
      id: 'm001',
      fullName: 'สมพงษ์ ใจดีมาก',
      phone: '089-123-4567',
      activeInsurance: 'ประกันรถยนต์ชั้น 1',
      purchaseDate: '2025-12-10',
      expiryDate: '2026-12-09',
      priceTotal: 18900,
      installmentTotal: 6,
      installmentPaid: 2,
    },
    {
      id: 'm002',
      fullName: 'มานะ ตั้งใจ',
      phone: '081-555-9999',
      activeInsurance: 'ประกันสุขภาพ',
      purchaseDate: '2025-08-01',
      expiryDate: '2026-07-31',
      priceTotal: 9900,
      installmentTotal: 3,
      installmentPaid: 3,
    },
    {
      id: 'm003',
      fullName: 'สุดา ขยันมาก',
      phone: '092-777-1212',
      activeInsurance: 'ประกันอุบัติเหตุ',
      purchaseDate: '2025-11-20',
      expiryDate: '2026-11-19',
      priceTotal: 4500,
      installmentTotal: 12,
      installmentPaid: 1,
    },
  ]

  const formatThaiDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: '2-digit' })
  }

  const formatTHB = (n: number) => `฿${n.toLocaleString('th-TH')}`

  // ✅ คำนวณ "เหลือกี่งวด" (กันติดลบ)
  const getRemainingInstallments = (m: Member) => {
    const remain = m.installmentTotal - m.installmentPaid
    return remain < 0 ? 0 : remain
  }

  // ✅ % ความคืบหน้า (กันหาร 0)
  const getProgressPercent = (m: Member) => {
    if (m.installmentTotal <= 0) return 0
    const pct = (m.installmentPaid / m.installmentTotal) * 100
    return Math.max(0, Math.min(100, Math.round(pct)))
  }

  const handleEdit = (member: Member) => {
    alert(`แก้ไขสมาชิก: ${member.fullName} (${member.id})`)
  }

  const handleDelete = (member: Member) => {
    const ok = confirm(`ต้องการลบสมาชิก "${member.fullName}" ใช่ไหม?`)
    if (!ok) return
    alert(`ลบแล้ว (ตัวอย่าง): ${member.fullName} (${member.id})`)
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">สรุปข้อมูลระบบและสถิติภาพรวมของ สบายใจประกันภัย</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
              <span>+12.5% จากเดือนที่แล้ว</span>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Members Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">รายชื่อสมาชิก</h2>
            <p className="text-xs text-slate-500 mt-1">
              แสดงข้อมูล: ชื่อ เบอร์ ประกัน วันที่ซื้อ/หมดอายุ ราคา และงวดผ่อน
            </p>
          </div>

          <button className="text-teal-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            ดูทั้งหมด <ArrowRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 font-medium">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">เบอร์โทร</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">ประกันที่กำลังใช้งาน</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">วันที่ซื้อ</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">วันที่หมดอายุ</th>

                {/* ✅ เพิ่มคอลัมน์ใหม่ */}
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">ราคา</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">แบ่งชำระ</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">ชำระแล้ว</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">เหลือ</th>

                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {members.map((m) => {
                const remain = getRemainingInstallments(m)
                const pct = getProgressPercent(m)

                return (
                  <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* ชื่อ */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                        <div className="leading-tight">
                          <div className="font-medium text-slate-700">{m.fullName}</div>
                          <div className="text-xs text-slate-400">ID: {m.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* เบอร์ */}
                    <td className="px-6 py-4 text-slate-600">{m.phone}</td>

                    {/* ประกัน */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-100">
                        {m.activeInsurance}
                      </span>
                    </td>

                    {/* วันที่ซื้อ */}
                    <td className="px-6 py-4 text-slate-600">{formatThaiDate(m.purchaseDate)}</td>

                    {/* หมดอายุ */}
                    <td className="px-6 py-4 text-slate-600">{formatThaiDate(m.expiryDate)}</td>

                    {/* ✅ ราคา */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{formatTHB(m.priceTotal)}</span>
                    </td>

                    {/* ✅ แบ่งชำระทั้งหมด */}
                    <td className="px-6 py-4 text-slate-700">
                      {m.installmentTotal > 0 ? `${m.installmentTotal} งวด` : '-'}
                    </td>

                    {/* ✅ ชำระแล้ว + แถบความคืบหน้า */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="text-slate-700 font-semibold">
                          {m.installmentTotal > 0 ? `${m.installmentPaid} งวด` : '-'}
                        </div>

                        {/* progress bar แบบง่าย */}
                        {m.installmentTotal > 0 ? (
                          <div className="h-2 w-32 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-sky-600" style={{ width: `${pct}%` }} />
                          </div>
                        ) : null}

                        {m.installmentTotal > 0 ? (
                          <div className="text-xs text-slate-500">{pct}%</div>
                        ) : null}
                      </div>
                    </td>

                    {/* ✅ เหลือ */}
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${remain === 0 ? 'text-green-700' : 'text-slate-900'}`}>
                        {m.installmentTotal > 0 ? `${remain} งวด` : '-'}
                      </span>
                      {remain === 0 && m.installmentTotal > 0 ? (
                        <div className="text-xs text-green-700">ชำระครบแล้ว</div>
                      ) : null}
                    </td>

                    {/* จัดการ */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(m)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                                     bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition"
                          title="แก้ไข"
                          type="button"
                        >
                          <Pencil size={14} />
                          แก้ไข
                        </button>

                        <button
                          onClick={() => handleDelete(m)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                                     bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 transition"
                          title="ลบ"
                          type="button"
                        >
                          <Trash2 size={14} />
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {members.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-slate-500">
                    ยังไม่มีข้อมูลสมาชิก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
