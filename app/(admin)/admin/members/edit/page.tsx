import {
  Search, Filter, Mail, Phone, Edit2,
  Trash2, MoreHorizontal, UserCheck, Calendar
} from 'lucide-react';

export default function EditMemberPage() {
  // จำลองข้อมูลสมาชิก
  const members = [
    { id: 1, name: 'คุณสมชาย ใจดีมาก', phone: '081-234-5678', email: 'somchai.j@gmail.com', type: 'ประกันรถยนต์ชั้น 1', status: 'Active', joined: '12 ธ.ค. 2025' },
    { id: 2, name: 'คุณวิภา รักษ์ดี', phone: '095-888-9999', email: 'wipa.r@hotmail.com', type: 'ประกันสุขภาพ', status: 'Active', joined: '05 ม.ค. 2026' },
    { id: 3, name: 'คุณมานะ มุ่งมั่น', phone: '082-111-2222', email: 'mana.m@outlook.com', type: 'ประกันชีวิต', status: 'Pending', joined: '10 ม.ค. 2026' },
    { id: 4, name: 'คุณรุ่งนภา ฟ้าใส', phone: '089-777-6666', email: 'rung.n@gmail.com', type: 'ประกันรถยนต์ชั้น 2+', status: 'Active', joined: '15 ม.ค. 2026' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">แก้ไขรายชื่อสมาชิก</h1>
        <p className="text-slate-500 text-sm">จัดการฐานข้อมูลลูกค้าของสบายใจประกันภัยทั้งหมด</p>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full font-sans">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อ, เบอร์โทร, อีเมล..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter size={18} /> ตัวกรอง
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-[0.1em] font-bold">
                <th className="px-6 py-4 border-b border-slate-100">สมาชิก</th>
                <th className="px-6 py-4 border-b border-slate-100">ประเภทประกัน</th>
                <th className="px-6 py-4 border-b border-slate-100">วันที่สมัคร</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center">สถานะ</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right uppercase">จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-teal-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-teal-600 group-hover:text-white transition-all">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{member.name}</span>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1"><Phone size={10} /> {member.phone}</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1"><Mail size={10} /> {member.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                      {member.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={14} className="text-slate-300" />
                      {member.joined}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${member.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm" title="แก้ไข">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-red-50 shadow-none hover:shadow-sm" title="ลบ">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
          <p>แสดง 4 จาก 1,205 รายการสมาชิก</p>
          <div className="flex gap-2 font-sans">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50">ก่อนหน้า</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">ถัดไป</button>
          </div>
        </div>
      </div>
    </div>
  );
}