import { getQuoteDetail } from "@/services/quote";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Handshake } from "lucide-react";
import Image from "next/image";
import { STATUS_CONFIG, PAYMENT_METHOD_LABELS } from "@/types/quote";
import type { PaymentMethod } from "@/types/quote";
import { formatThaiDateLong, formatTHB } from "@/utils/format";
import QuoteReviewForm from "./QuoteReviewForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

function InfoItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-text-light text-xs uppercase font-semibold">{label}</p>
      <div className="text-text-dark font-medium mt-1">{children}</div>
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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/quotes"
          className="p-2 bg-white border border-border-light rounded-xl text-text-light hover:text-primary transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-dark">
            รายละเอียดคำขอใบเสนอราคา
          </h1>
          <p className="text-sm text-text-medium">ID: {quote.id}</p>
        </div>
        <span
          className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${statusInfo.cls}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-border-light shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-text-dark">ข้อมูลลูกค้า</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoItem label="ชื่อ-นามสกุล">
                {quote.firstName} {quote.lastName}
              </InfoItem>
              <InfoItem label="เบอร์โทร">{quote.phone}</InfoItem>
              <InfoItem label="บัญชีลูกค้า">
                {quote.customer?.name ?? "-"} ({quote.customer?.phone ?? "-"})
              </InfoItem>
              <InfoItem label="แหล่งที่มา">
                {quote.referralCode ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-info-light text-info border border-info/20">
                    <Handshake size={12} />
                    {quote.referralCode}
                  </span>
                ) : (
                  <span className="text-text-medium font-medium">Direct</span>
                )}
              </InfoItem>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-light shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-text-dark">ข้อมูลรถ</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoItem label="ชั้นประกัน">{quote.tier}</InfoItem>
              <InfoItem label="ยี่ห้อ">{quote.brand}</InfoItem>
              <InfoItem label="รุ่น">{quote.model}</InfoItem>
              <InfoItem label="ปี">{quote.year}</InfoItem>
              <div className="col-span-2">
                <InfoItem label="รุ่นย่อย">
                  {quote.variant === "unknown"
                    ? "ไม่ระบุรุ่นย่อย"
                    : quote.variant}
                </InfoItem>
              </div>
            </div>
          </div>

          {quote.documents.length > 0 && (
            <div className="bg-white rounded-2xl border border-border-light shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-text-dark">เอกสารแนบ</h2>
              <div className="space-y-2">
                {quote.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-light border border-border-light hover:bg-bg-soft transition"
                  >
                    <FileText size={18} className="text-text-medium shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-dark truncate">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-text-light">
                        {doc.type} / {doc.mimeType}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {quote.reviewedAt && (
            <div className="bg-white rounded-2xl border border-border-light shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-text-dark">ข้อมูลรีวิว</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoItem label="บริษัทประกัน">
                  {quote.insuranceCompany || "-"}
                </InfoItem>
                <InfoItem label="ราคาประกัน">
                  {quote.premiumAmount ? formatTHB(quote.premiumAmount) : "-"}
                </InfoItem>
                <InfoItem label="วันที่ซื้อ">
                  {quote.purchaseDate
                    ? formatThaiDateLong(quote.purchaseDate)
                    : "-"}
                </InfoItem>
                <InfoItem label="วันหมดอายุ">
                  {quote.expiryDate
                    ? formatThaiDateLong(quote.expiryDate)
                    : "-"}
                </InfoItem>
                <InfoItem label="วิธีชำระเงิน">
                  {quote.paymentMethod &&
                  Object.hasOwn(PAYMENT_METHOD_LABELS, quote.paymentMethod)
                    ? PAYMENT_METHOD_LABELS[
                        quote.paymentMethod as PaymentMethod
                      ]
                    : (quote.paymentMethod ?? "-")}
                </InfoItem>
                <InfoItem label="รีวิวโดย">
                  {quote.reviewedBy?.username ?? "-"}
                </InfoItem>
                <InfoItem label="รีวิวเมื่อ">
                  {quote.reviewedAt
                    ? formatThaiDateLong(quote.reviewedAt)
                    : "-"}
                </InfoItem>
                {quote.paymentEvidence && (
                  <div className="col-span-2">
                    <p className="text-text-light text-xs uppercase font-semibold">
                      หลักฐานชำระเงิน
                    </p>
                    <a
                      href={quote.paymentEvidence}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 rounded-xl border border-border-light overflow-hidden hover:border-primary/40 transition"
                    >
                      <Image
                        src={quote.paymentEvidence}
                        alt="หลักฐานชำระเงิน"
                        width={600}
                        height={400}
                        className="w-full h-auto max-h-64 object-contain bg-bg-soft"
                        sizes="(max-width: 768px) 100vw, 600px"
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <QuoteReviewForm
            quoteId={quote.id}
            currentStatus={quote.status}
            initialData={{
              insuranceCompany: quote.insuranceCompany ?? "",
              premiumAmount: quote.premiumAmount ?? 0,
              purchaseDate: quote.purchaseDate
                ? String(quote.purchaseDate)
                : "",
              expiryDate: quote.expiryDate ? String(quote.expiryDate) : "",
              paymentMethod: quote.paymentMethod ?? "",
              paymentEvidence: quote.paymentEvidence ?? "",
              policyDocumentUrl: quote.policyDocumentUrl ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
