import { t } from "elysia";

export const uploadSchema = {
  "upload.paymentEvidence": t.Object({
    file: t.File({
      type: ["image/jpeg", "image/png"],
      maxSize: "10m",
    }),
  }),
};
