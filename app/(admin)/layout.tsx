import AdminLayoutClient from "@/components/admin/admin-layout-client";
import { AuthGuard } from "@/components/auth";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <AuthGuard>
            <AdminLayoutClient>{children}</AdminLayoutClient>
        </AuthGuard>
    );
}
