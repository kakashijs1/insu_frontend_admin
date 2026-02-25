import ChangePasswordForm from "./ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">เปลี่ยนรหัสผ่าน</h1>
        <p className="text-text-medium text-sm">
          เปลี่ยนรหัสผ่านได้ 1 ครั้ง หากลืมต้องแจ้ง Super Admin รีเซ็ตให้
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
