export type QuoteStatus =
  | "PENDING"
  | "REVIEWING"
  | "QUOTED"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type PaymentMethod = "MOBILE_BANKING" | "QR_PROMPTPAY";

export interface QuoteCustomer {
  id: string;
  name: string;
  phone: string;
}

export interface QuoteReviewer {
  id: string;
  username: string;
  email: string;
}

export interface QuoteDocumentSummary {
  id: string;
  type: string;
  fileName: string;
}

export interface QuoteDocumentDetail extends QuoteDocumentSummary {
  cloudinaryUrl: string;
  mimeType: string;
  fileSize: number;
  createdAt: string | Date;
}

export interface QuoteListItem {
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
  status: QuoteStatus;
  insuranceCompany: string | null;
  premiumAmount: number | null;
  purchaseDate: string | Date | null;
  expiryDate: string | Date | null;
  paymentMethod: PaymentMethod | null;
  paymentEvidence: string | null;
  policyDocumentUrl: string | null;
  reviewedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  customer: QuoteCustomer;
  reviewedBy: QuoteReviewer | null;
  documents: QuoteDocumentSummary[];
}

export interface QuoteDetail extends Omit<QuoteListItem, "documents"> {
  documents: QuoteDocumentDetail[];
}

export interface QuotePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuoteStats {
  total: number;
  pending: number;
  approved: number;
  fromAffiliate: number;
}

export interface PendingQuoteNotification {
  id: string;
  firstName: string;
  lastName: string;
  tier: string;
  brand: string;
  model: string;
  createdAt: string;
}

export const TERMINAL_STATUSES: readonly QuoteStatus[] = [
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

export const ALLOWED_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  PENDING: ["REVIEWING"],
  REVIEWING: ["QUOTED", "REJECTED"],
  QUOTED: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export const STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; cls: string }
> = {
  PENDING: {
    label: "รอดำเนินการ",
    cls: "bg-warning-light text-warning border-warning/20",
  },
  REVIEWING: {
    label: "กำลังตรวจสอบ",
    cls: "bg-info-light text-info border-info/20",
  },
  QUOTED: {
    label: "เสนอราคาแล้ว",
    cls: "bg-info-light text-secondary border-secondary/20",
  },
  APPROVED: {
    label: "อนุมัติ",
    cls: "bg-success-light text-success border-success/20",
  },
  REJECTED: {
    label: "ปฏิเสธ",
    cls: "bg-danger-light text-danger border-danger/20",
  },
  EXPIRED: {
    label: "หมดอายุ",
    cls: "bg-bg-soft text-text-medium border-border-light",
  },
  CANCELLED: {
    label: "ลูกค้ายกเลิก",
    cls: "bg-bg-soft text-text-medium border-border-light",
  },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  MOBILE_BANKING: "Mobile Banking",
  QR_PROMPTPAY: "QR PromptPay",
};
