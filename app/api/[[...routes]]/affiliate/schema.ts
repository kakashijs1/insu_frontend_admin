import { t } from "elysia";

export const affiliateSchema = {
  "affiliate.create": t.Object({
    email: t.String({ format: "email" }),
    fullName: t.String({ minLength: 2 }),
    phone: t.String({ minLength: 9 }),
    referralCode: t.String({ minLength: 6, maxLength: 6 }),
    bankName: t.String({ minLength: 1 }),
    bankAccountNumber: t.String({ minLength: 1 }),
    bankAccountName: t.String({ minLength: 1 }),
    commissionRate: t.Number({ minimum: 1, maximum: 20 }),
  }),
  "affiliate.update": t.Object({
    fullName: t.Optional(t.String({ minLength: 2 })),
    phone: t.Optional(t.String({ minLength: 9 })),
    bankName: t.Optional(t.String({ minLength: 1 })),
    bankAccountNumber: t.Optional(t.String({ minLength: 1 })),
    bankAccountName: t.Optional(t.String({ minLength: 1 })),
    commissionRate: t.Optional(t.Number({ minimum: 1, maximum: 20 })),
    isActive: t.Optional(t.Boolean()),
  }),
};
