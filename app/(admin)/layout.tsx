import { redirect } from "next/navigation";
import { getAuthState } from "@/utils/auth";
import { getCurrentUser } from "@/services/auth";
import { getQuoteRequests, getQuoteStats } from "@/services/quote";
import AdminLayoutClient from "@/components/admin/admin-layout-client";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const authState = await getAuthState();

  if (!authState.isLoggedIn) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  const isAffiliate = user?.role === "Affiliate";

  let pendingCount = 0;
  let recentPending: {
    id: string;
    firstName: string;
    lastName: string;
    tier: string;
    brand: string;
    model: string;
    createdAt: string;
  }[] = [];

  if (!isAffiliate) {
    const [stats, pendingQuotes] = await Promise.all([
      getQuoteStats(),
      getQuoteRequests(1, "PENDING"),
    ]);

    pendingCount = stats?.pending ?? 0;
    recentPending = (pendingQuotes.data ?? []).slice(0, 5).map((q) => ({
      id: q.id,
      firstName: q.firstName,
      lastName: q.lastName,
      tier: q.tier,
      brand: q.brand,
      model: q.model,
      createdAt: String(q.createdAt),
    }));
  }

  return (
    <AdminLayoutClient
      user={user}
      pendingCount={pendingCount}
      pendingQuotes={recentPending}
    >
      <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-[1600px] mx-auto">
        {children}
      </main>
    </AdminLayoutClient>
  );
}
