import { UserCog, Shield, Lock, Check } from 'lucide-react';

export default function AdminUserEditPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
          <UserCog size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการสิทธิ์ผู้ดูแลระบบ</h1>
          <p className="text-slate-500 text-sm">กำหนดสิทธิ์การเข้าถึงข้อมูลของเจ้าหน้าที่ภายใน</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 font-sans">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Username</label>
            <input type="text" defaultValue="admin_staff_01" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
          </div>
          <div className="space-y-2 font-sans">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role / ตำแหน่ง</label>
            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <option>Super Admin</option>
              <option>Editor</option>
              <option>Viewer (Read Only)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 font-sans">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 underline decoration-teal-500 decoration-4 underline-offset-4">
            <Shield size={18} /> สิทธิ์การเข้าถึง (Permissions)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['จัดการสมาชิก', 'สร้างโปรดัก', 'ดูรายงานการเงิน', 'จัดการพาร์ทเนอร์', 'แก้ไขระบบ'].map((p, i) => (
              <label key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-teal-50 transition-colors group">
                <div className="w-5 h-5 rounded border-2 border-slate-200 group-hover:border-teal-500 flex items-center justify-center bg-white transition-all">
                   <Check size={12} className="text-teal-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:shadow-xl transition-all">บันทึกการเปลี่ยนแปลง</button>
          <button className="px-6 py-4 border border-slate-200 text-slate-400 rounded-2xl font-bold hover:bg-red-50 hover:text-red-500 transition-all">ยกเลิก</button>
        </div>
      </div>
    </div>
  );
}