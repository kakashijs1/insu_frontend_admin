import Elysia from "elysia";
import { uploadSchema } from "./schema";
import { uploadPaymentEvidence } from "./handlers";

const uploadRoutes = new Elysia()
  .model(uploadSchema)
  .post(
    "/upload/payment-evidence",
    ({ body, cookie, set }) => uploadPaymentEvidence({ body, cookie, set }),
    { body: "upload.paymentEvidence" },
  );

export default uploadRoutes;
