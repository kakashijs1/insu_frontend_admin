import { redirect } from "next/navigation";
import { getAuthState } from "@/utils/auth";
import { listAdminUsers } from "@/services/user";
import UsersManageClient from "./UsersManageClient";

export default async function ManageUsersPage() {
  const authState = await getAuthState();
  if (!authState.isLoggedIn) redirect("/login");
  if (authState.role !== "Super") redirect("/admin");

  const users = await listAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">จัดการเจ้าหน้าที่</h1>
        <p className="text-text-medium text-sm">
          ดู สร้าง แก้ไข และจัดการผู้ใช้ระบบทั้งหมด
        </p>
      </div>

      <UsersManageClient users={users} currentUserId={authState.userId!} />
    </div>
  );
}
