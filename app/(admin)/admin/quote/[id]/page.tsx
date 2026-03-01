import { getQuoteDetail } from "@/services/quote";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Handshake,
  User,
  Car,
  Shield,
  Building2,
  Calendar,
  CreditCard,
  UserCheck,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { STATUS_CONFIG, PAYMENT_METHOD_LABELS } from "@/types/quote";
import type { QuoteStatus } from "@/types/quote";

import { formatThaiDateLong, formatTHB } from "@/utils/format";
import QuoteReviewForm from "./QuoteReviewForm";
import InstallmentPanel from "./InstallmentPanel";

function isPaymentMethod(
  value: string,
): value is keyof typeof PAYMENT_METHOD_LABELS {
  return value in PAYMENT_METHOD_LABELS;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function InfoItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-text-light">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-text-light uppercase tracking-wider">
          {label}
        </p>
        <div className="text-sm font-semibold text-text-dark mt-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

const STATUS_STEPS: QuoteStatus[] = [
  "PENDING",
  "REVIEWING",
  "QUOTED",
  "APPROVED",
];

function StatusTimeline({ current }: { current: QuoteStatus }) {
  const isRejected = current === "REJECTED";
  const isCancelled = current === "CANCELLED";
  const isExpired = current === "EXPIRED";
  const isTerminal = isRejected || isCancelled || isExpired;

  const currentIndex = STATUS_STEPS.indexOf(current);
  const activeIndex = isTerminal ? -1 : currentIndex;

  return (
    <div className="flex items-center gap-1">
      {STATUS_STEPS.map((step, i) => {
        const config = STATUS_CONFIG[step];
        const isPast = !isTerminal && i < activeIndex;
        const isCurrent = !isTerminal && i === activeIndex;

        return (
          <div key={step} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={`w-6 h-0.5 rounded-full ${
                  isPast ? "bg-success" : "bg-border-light"
                }`}
              />
            )}
            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                isCurrent
                  ? config.cls
                  : isPast
                    ? "bg-success-light text-success border-success/20"
                    : "bg-bg-light text-text-light border-border-light"
              }`}
            >
              {config.label}
            </div>
          </div>
        );
      })}
      {isTerminal && (
        <>
          <div className="w-6 h-0.5 rounded-full bg-border-light" />
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_CONFIG[current].cls}`}
          >
            {STATUS_CONFIG[current].label}
          </div>
        </>
      )}
    </div>
  );
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const quote = await getQuoteDetail(id);

  if (!quote) {
    notFound();
  }

  const statusInfo = STATUS_CONFIG[quote.status] ?? STATUS_CONFIG.PENDING;
  const paymentLabel =
    quote.paymentMethod && isPaymentMethod(quote.paymentMethod)
      ? PAYMENT_METHOD_LABELS[quote.paymentMethod]
      : (quote.paymentMethod ?? null);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/quotes"
          className="p-2 mt-1 bg-white border border-border-light rounded-xl text-text-light hover:text-primary hover:border-primary/30 transition-all shrink-0"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-text-dark">
              {quote.firstName} {quote.lastName}
            </h1>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.cls}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <p className="text-xs text-text-light mt-1 font-mono">{quote.id}</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <StatusTimeline current={quote.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-border-light p-3">
          <p className="text-[10px] font-medium text-text-light uppercase tracking-wider">
            ชั้นประกัน
          </p>
          <p className="text-lg font-bold text-primary mt-0.5">{quote.tier}</p>
        </div>
        <div className="bg-white rounded-xl border border-border-light p-3">
          <p className="text-[10px] font-medium text-text-light uppercase tracking-wider">
            รถยนต์
          </p>
          <p className="text-sm font-bold text-text-dark mt-0.5 truncate">
            {quote.brand} {quote.model}
          </p>
          <p className="text-[10px] text-text-medium">{quote.year}</p>
        </div>
        <div className="bg-white rounded-xl border border-border-light p-3">
          <p className="text-[10px] font-medium text-text-light uppercase tracking-wider">
            เบี้ยรวม
          </p>
          <p className="text-lg font-bold text-teal mt-0.5">
            {quote.premiumAmount ? formatTHB(quote.premiumAmount) : "-"}
          </p>
        </div>
        {quote.referralCode && quote.netPremiumAmount ? (
          <div className="bg-white rounded-xl border border-border-light p-3">
            <p className="text-[10px] font-medium text-text-light uppercase tracking-wider">
              เบี้ยสุทธิ
            </p>
            <p className="text-lg font-bold text-info mt-0.5">
              {formatTHB(quote.netPremiumAmount)}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border-light p-3">
            <p className="text-[10px] font-medium text-text-light uppercase tracking-wider">
              บริษัทประกัน
            </p>
            <p className="text-sm font-bold text-text-dark mt-0.5 truncate">
              {quote.insuranceCompany || "-"}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-border-light shadow-sm p-5">
            <h2 className="text-sm font-bold text-text-dark mb-4 flex items-center gap-2">
              <User size={15} className="text-primary" />
              ข้อมูลลูกค้า
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoItem icon={User} label="ชื่อ-นามสกุล">
                {quote.firstName} {quote.lastName}
              </InfoItem>
              <InfoItem icon={CreditCard} label="เบอร์โทร">
                {quote.phone}
              </InfoItem>
              <InfoItem icon={UserCheck} label="บัญชีลูกค้า">
                {quote.customer?.name ?? "-"} ({quote.customer?.phone ?? "-"})
              </InfoItem>
              <InfoItem icon={Handshake} label="แหล่งที่มา">
                {quote.referralCode ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-info-light text-info border border-info/20">
                    <Handshake size={10} />
                    {quote.referralCode}
                  </span>
                ) : (
                  <span className="text-text-medium">Direct</span>
                )}
              </InfoItem>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-light shadow-sm p-5">
            <h2 className="text-sm font-bold text-text-dark mb-4 flex items-center gap-2">
              <Car size={15} className="text-primary" />
              ข้อมูลรถ
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoItem icon={Shield} label="ชั้นประกัน">
                {quote.tier}
              </InfoItem>
              <InfoItem icon={Car} label="ยี่ห้อ / รุ่น">
                {quote.brand} {quote.model}
              </InfoItem>
              <InfoItem icon={Calendar} label="ปี">
                {quote.year}
              </InfoItem>
              <InfoItem icon={Car} label="รุ่นย่อย">
                {quote.variant === "unknown"
                  ? "ไม่ระบุรุ่นย่อย"
                  : quote.variant}
              </InfoItem>
            </div>
          </div>

          {quote.documents.length > 0 && (
            <div className="bg-white rounded-2xl border border-border-light shadow-sm p-5">
              <h2 className="text-sm font-bold text-text-dark mb-3 flex items-center gap-2">
                <FileText size={15} className="text-primary" />
                เอกสารแนบ
                <span className="text-[10px] font-medium text-text-light bg-bg-light px-2 py-0.5 rounded-full">
                  {quote.documents.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quote.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-bg-light border border-border-light hover:bg-bg-soft hover:border-primary/20 transition group"
                  >
                    <FileText
                      size={16}
                      className="text-text-light group-hover:text-primary shrink-0 transition"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-dark truncate">
                        {doc.fileName}
                      </p>
                      <p className="text-[10px] text-text-light">
                        {doc.type} / {doc.mimeType}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {quote.reviewedAt && (
            <div className="bg-white rounded-2xl border border-border-light shadow-sm p-5">
              <h2 className="text-sm font-bold text-text-dark mb-4 flex items-center gap-2">
                <Clock size={15} className="text-primary" />
                ข้อมูลประกัน
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <InfoItem icon={Building2} label="บริษัทประกัน">
                  {quote.insuranceCompany || "-"}
                </InfoItem>
                <InfoItem icon={CreditCard} label="เบี้ยรวม">
                  {quote.premiumAmount ? formatTHB(quote.premiumAmount) : "-"}
                </InfoItem>
                {quote.referralCode && (
                  <InfoItem icon={CreditCard} label="เบี้ยสุทธิ">
                    {quote.netPremiumAmount
                      ? formatTHB(quote.netPremiumAmount)
                      : "-"}
                  </InfoItem>
                )}
                <InfoItem icon={Calendar} label="วันที่ซื้อ">
                  {quote.purchaseDate
                    ? formatThaiDateLong(quote.purchaseDate)
                    : "-"}
                </InfoItem>
                <InfoItem icon={Calendar} label="วันหมดอายุ">
                  {quote.expiryDate
                    ? formatThaiDateLong(quote.expiryDate)
                    : "-"}
                </InfoItem>
                <InfoItem icon={CreditCard} label="วิธีชำระเงิน">
                  {paymentLabel ?? "-"}
                </InfoItem>
                <InfoItem icon={UserCheck} label="รีวิวโดย">
                  {quote.reviewedBy?.username ?? "-"}
                </InfoItem>
                <div className="col-span-2">
                  <InfoItem icon={Clock} label="รีวิวเมื่อ">
                    {quote.reviewedAt
                      ? formatThaiDateLong(quote.reviewedAt)
                      : "-"}
                  </InfoItem>
                </div>
                {quote.paymentEvidence && (
                  <div className="col-span-2 pt-2 border-t border-border-light">
                    <p className="text-[11px] font-medium text-text-light uppercase tracking-wider mb-2">
                      หลักฐานชำระเงิน
                    </p>
                    <a
                      href={quote.paymentEvidence}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-border-light overflow-hidden hover:border-primary/40 transition"
                    >
                      <Image
                        src={quote.paymentEvidence}
                        alt="หลักฐานชำระเงิน"
                        width={600}
                        height={400}
                        className="w-full h-auto max-h-56 object-contain bg-bg-light"
                        sizes="(max-width: 768px) 100vw, 600px"
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-6">
            <QuoteReviewForm
              quoteId={quote.id}
              currentStatus={quote.status}
              referralCode={quote.referralCode ?? null}
              initialData={{
                insuranceCompany: quote.insuranceCompany ?? "",
                premiumAmount: quote.premiumAmount ?? 0,
                netPremiumAmount: quote.netPremiumAmount ?? 0,
                purchaseDate: quote.purchaseDate
                  ? String(quote.purchaseDate)
                  : "",
                expiryDate: quote.expiryDate ? String(quote.expiryDate) : "",
                paymentMethod: quote.paymentMethod ?? "",
                paymentEvidence: quote.paymentEvidence ?? "",
                policyDocumentUrl: quote.policyDocumentUrl ?? "",
              }}
            />

            {quote.installmentPlan &&
              quote.premiumAmount &&
              quote.installments &&
              quote.installments.length > 0 && (
                <InstallmentPanel
                  quoteId={quote.id}
                  premiumAmount={quote.premiumAmount}
                  installmentPlan={quote.installmentPlan}
                  installments={quote.installments}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
