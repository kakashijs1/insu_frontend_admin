import { z } from "zod";

/* ---------- Login ---------- */
export const LoginDto = z.object({
    email: z.email(),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long",
    }),
});

export type LoginInput = z.infer<typeof LoginDto>;

/* ---------- Register ---------- */
export const RegisterDto = z.object({
    username: z.string().min(3, {
        message: "Username must be at least 3 characters long",
    }),
    email: z.email(),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long",
    }),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
