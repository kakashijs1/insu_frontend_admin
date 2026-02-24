import CreateAffiliateForm from "./CreateAffiliateForm";

export default function CreateAffiliatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          เพิ่ม Affiliate ใหม่
        </h1>
        <p className="text-slate-500 text-sm">
          กรอกข้อมูลเพื่อสร้าง Affiliate พาร์ทเนอร์ใหม่
        </p>
      </div>
      <CreateAffiliateForm />
    </div>
  );
}
