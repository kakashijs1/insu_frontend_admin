import { redirect } from "next/navigation";
import { getAuthState } from "@/utils/auth";
import { getQuoteRequests } from "@/services/quote";
import ExpirePageClient from "./ExpirePageClient";

export default async function AdminExpirePage() {
  const authState = await getAuthState();
  if (!authState.isLoggedIn) redirect("/login");

  const { data: allQuotes } = await getQuoteRequests(1, "APPROVED");
  const quotesWithExpiry = allQuotes.filter((q) => q.expiryDate);

  const expireData = quotesWithExpiry.map((q) => ({
    id: q.id,
    fullName: `${q.firstName} ${q.lastName}`,
    phone: q.customer.phone,
    insuranceName: `ประกันชั้น ${q.tier}`,
    expiryDate:
      typeof q.expiryDate === "string"
        ? q.expiryDate
        : new Date(q.expiryDate!).toISOString().split("T")[0],
  }));

  return <ExpirePageClient data={expireData} />;
}
