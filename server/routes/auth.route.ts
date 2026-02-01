import { Hono } from "hono";
import { AuthController } from "@/server/controllers/auth.controller";
import { UserPrismaRepository } from "@/server/repositories/user.prisma";
import { AuthUseCase } from "@/server/usecases/auth.usecase";

const authApp = new Hono();

// DI Container (Simple manual injection)
const userRepo = new UserPrismaRepository();
const authUseCase = new AuthUseCase(userRepo);
const authController = new AuthController(authUseCase);

authApp.post("/register", authController.register);
authApp.post("/login", authController.login);
authApp.post("/refresh", authController.refresh);
authApp.post("/logout", authController.logout);

export default authApp;
