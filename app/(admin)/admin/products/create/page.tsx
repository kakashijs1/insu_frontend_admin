import { ShieldPlus, Image as ImageIcon, Plus, Info } from 'lucide-react';

export default function AdminProductsCreatePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <div className="bg-teal-600 p-3 rounded-2xl text-white shadow-lg shadow-teal-100">
          <ShieldPlus size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">สร้างโปรดักประกันภัย</h1>
          <p className="text-slate-500 text-sm">กำหนดรายละเอียดแผนความคุ้มครองและเบี้ยประกัน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">ชื่อผลิตภัณฑ์ / แผนประกัน</label>
              <input type="text" placeholder="เช่น ประกันรถยนต์ชั้น 1 Sabuyjai Care" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">หมวดหมู่</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  <option>ประกันรถยนต์</option>
                  <option>ประกันสุขภาพ</option>
                  <option>ประกันชีวิต</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">เบี้ยเริ่มต้น (บาท)</label>
                <input type="number" placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">รายละเอียดความคุ้มครองย่อ</label>
              <textarea rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" placeholder="ระบุจุดเด่นของแผนประกัน..."></textarea>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ImageIcon size={18} className="text-teal-600" /> รูปภาพหน้าปก
            </h3>
            <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-all group">
               <Plus className="group-hover:scale-110 transition-transform" />
               <span className="text-[10px] mt-2 font-bold uppercase tracking-wider">Upload Image</span>
            </div>
          </div>
          <button className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all">
            ยืนยันการสร้างโปรดัก
          </button>
        </div>
      </div>
    </div>
  );
}