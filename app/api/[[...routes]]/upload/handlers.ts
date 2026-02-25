import { cloudinary } from "@/libs/cloudinary";
import { verifyAccessToken } from "@/utils/jwt";
import { toResult } from "lyney";
import { Readable } from "stream";
import { z } from "zod";

const CloudinaryUploadResponseSchema = z.object({
  secure_url: z.string().url(),
  public_id: z.string().min(1),
});

interface UploadPaymentEvidenceParams {
  body: {
    file: File;
  };
  cookie: Record<string, { value: unknown }>;
  set: { status?: number | string };
}

export const uploadPaymentEvidence = async ({
  body,
  cookie,
  set,
}: UploadPaymentEvidenceParams) => {
  const rawToken = cookie?.admin_access_token?.value;
  const accessToken = typeof rawToken === "string" ? rawToken : null;
  if (!accessToken) {
    set.status = 401;
    return { success: false, message: "กรุณาเข้าสู่ระบบ" };
  }

  const verified = await verifyAccessToken(accessToken);
  if (!verified.ok) {
    set.status = 401;
    return { success: false, message: "Token ไม่ถูกต้องหรือหมดอายุ" };
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const { file } = body;
  if (file.size > MAX_FILE_SIZE) {
    set.status = 400;
    return { success: false, message: "ไฟล์มีขนาดเกิน 5MB" };
  }
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadResult = await toResult(
    new Promise<z.infer<typeof CloudinaryUploadResponseSchema>>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `insu/admin/payment-evidence`,
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png"],
          },
          (
            error: Error | undefined,
            rawResult: Record<string, unknown> | undefined,
          ) => {
            if (error || !rawResult) {
              reject(error ?? new Error("Upload failed"));
              return;
            }
            const parsed = CloudinaryUploadResponseSchema.safeParse(rawResult);
            if (!parsed.success) {
              reject(new Error("Invalid Cloudinary response"));
              return;
            }
            resolve(parsed.data);
          },
        );

        const readable = Readable.from(buffer);
        readable.pipe(stream);
      },
    ),
  );

  if (!uploadResult.ok) {
    set.status = 500;
    return { success: false, message: "อัพโหลดไฟล์ไม่สำเร็จ" };
  }

  return {
    success: true,
    data: {
      cloudinaryUrl: uploadResult.data.secure_url,
      publicId: uploadResult.data.public_id,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    },
  };
};
