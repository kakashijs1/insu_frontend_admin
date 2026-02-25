export interface AffiliateUser {
  id: string;
  username: string;
  email: string;
  role: "Affiliate";
  referralCode: string;
  fullName: string | null;
  phone: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  commissionRate: number | null;
  passwordChanged: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: { commissions: number };
}

export interface AffiliateCommission {
  id: string;
  premiumAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: "PENDING" | "PAID";
  paymentEvidence: string | null;
  paidAt: string | Date | null;
  paidById: string | null;
  createdAt: string | Date;
  quoteRequest: {
    id: string;
    firstName: string;
    lastName: string;
    brand: string;
    model: string;
    year: number;
    tier: string;
    status?: string;
  };
}

export interface AffiliateDetail extends AffiliateUser {
  commissions: AffiliateCommission[];
}

export interface AffiliateCaseListItem {
  id: string;
  tier: string;
  brand: string;
  model: string;
  year: number;
  variant: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  insuranceCompany: string | null;
  premiumAmount: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AffiliateCaseDetail {
  id: string;
  tier: string;
  brand: string;
  model: string;
  year: number;
  variant: string;
  firstName: string;
  lastName: string;
  phone: string;
  referralCode: string | null;
  status: string;
  insuranceCompany: string | null;
  premiumAmount: number | null;
  purchaseDate: string | Date | null;
  expiryDate: string | Date | null;
  paymentMethod: string | null;
  reviewedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  commissions: Omit<AffiliateCommission, "quoteRequest" | "paidById">[];
  customer: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface CommissionSummary {
  totalAmount: number;
  totalCount: number;
  pendingAmount: number;
  pendingCount: number;
  paidAmount: number;
  paidCount: number;
}

export interface AffiliateDashboardData {
  totalCases: number;
  approvedCases: number;
  totalCommission: number;
  totalCommissionCount: number;
  pendingCommission: number;
  pendingCommissionCount: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateAffiliateData {
  email: string;
  fullName: string;
  phone: string;
  referralCode: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  commissionRate: number;
}

export interface UpdateAffiliateData {
  fullName?: string;
  phone?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  commissionRate?: number;
  isActive?: boolean;
}
