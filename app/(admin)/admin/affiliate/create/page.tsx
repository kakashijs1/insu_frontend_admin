import { redirect } from "next/navigation";
import { getAuthState } from "@/utils/auth";
import CreateAffiliateForm from "./CreateAffiliateForm";

export default async function CreateAffiliatePage() {
  const authState = await getAuthState();

  if (authState.role !== "Super") {
    redirect("/admin/affiliate");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">
          เพิ่ม Affiliate ใหม่
        </h1>
        <p className="text-text-medium text-sm">
          กรอกข้อมูลเพื่อสร้าง Affiliate พาร์ทเนอร์ใหม่
        </p>
      </div>
      <CreateAffiliateForm />
    </div>
  );
}
