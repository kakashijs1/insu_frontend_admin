import { redirect } from "next/navigation";
import { getAuthState } from "@/utils/auth";
import { listCustomers } from "@/services/customer";
import MembersEditClient from "./MembersEditClient";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function EditMemberPage({ searchParams }: PageProps) {
  const authState = await getAuthState();
  if (!authState.isLoggedIn) redirect("/login");

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";

  const { data: customers, pagination } = await listCustomers(page, search);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">
          แก้ไขรายชื่อสมาชิก
        </h1>
        <p className="text-text-medium text-sm">
          จัดการฐานข้อมูลลูกค้าของสบายใจประกันภัยทั้งหมด
        </p>
      </div>

      <MembersEditClient
        customers={customers}
        pagination={pagination}
        initialSearch={search}
      />
    </div>
  );
}
