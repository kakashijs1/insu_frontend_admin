import { z } from "zod";

const ApiErrorSchema = z.object({
  message: z.string(),
});

export function parseApiError(value: unknown, defaultMessage: string): string {
  if (typeof value === "string") return value;

  const parsed = ApiErrorSchema.safeParse(value);
  if (parsed.success) return parsed.data.message;

  return defaultMessage;
}
