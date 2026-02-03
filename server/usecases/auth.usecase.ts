import bcrypt from "bcrypt";
import { IUserRepository } from "@/server/repositories/user.repository";
import { RegisterInput, LoginInput } from "@/server/dto/auth.dto";
import { signAccessToken, signRefreshToken } from "@/server/libs/jwt";
import { verifyRefreshToken } from "@/server/libs/jwt";

export class AuthUseCase {
    constructor(private userRepo: IUserRepository) {}

    async register(input: RegisterInput) {
        // 1. Check existing user
        const existingUser = await this.userRepo.findByEmail(input.email);
        if (existingUser) throw new Error("Email already exists");

        // 2. Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // 3. Create user
        const user = await this.userRepo.create({ ...input, passwordHash });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async login(input: LoginInput) {
        // 1. Find user
        const user = await this.userRepo.findByEmail(input.email);
        if (!user || !user.password)
            throw new Error("Invalid email or password");

        // 2. Verify password
        const isMatch = await bcrypt.compare(input.password, user.password);
        if (!isMatch) throw new Error("Invalid email or password");

        if (!user.isActive) throw new Error("User is inactive");

        // 3. Generate Tokens
        const accessToken = signAccessToken({
            userId: user.id,
            role: user.role,
        });
        const refreshToken = signRefreshToken({
            userId: user.id,
            role: user.role,
        });

        const { password, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, accessToken, refreshToken };
    }

    async refreshToken(token: string) {
        const payload = await verifyRefreshToken(token);
        if (!payload) throw new Error("Invalid refresh token");

        const user = await this.userRepo.findById(payload.userId);
        if (!user) throw new Error("User not found");

        const accessToken = signAccessToken({
            userId: user.id,
            role: user.role,
        });
        return { accessToken };
    }

    async getUserById(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new Error("User not found");

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
