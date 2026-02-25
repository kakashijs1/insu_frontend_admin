import { t } from "elysia";

export const quoteSchema = {
  "quote.review": t.Object({
    insuranceCompany: t.Optional(t.String()),
    premiumAmount: t.Optional(t.Number()),
    purchaseDate: t.Optional(t.String({ format: "date-time" })),
    expiryDate: t.Optional(t.String({ format: "date-time" })),
    paymentMethod: t.Optional(
      t.Union([t.Literal("MOBILE_BANKING"), t.Literal("QR_PROMPTPAY")]),
    ),
    paymentEvidence: t.Optional(t.String()),
    policyDocumentUrl: t.Optional(t.String()),
  }),
  "quote.status": t.Object({
    status: t.Union([
      t.Literal("PENDING"),
      t.Literal("REVIEWING"),
      t.Literal("QUOTED"),
      t.Literal("APPROVED"),
      t.Literal("REJECTED"),
      t.Literal("EXPIRED"),
    ]),
  }),
  "installment.pay": t.Object({
    amountPaid: t.Number(),
    paymentEvidence: t.Optional(t.String()),
  }),
};
