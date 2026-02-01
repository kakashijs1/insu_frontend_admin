import { prisma } from "@/server/libs/prisma";
import { IUserRepository } from "./user.repository";
import { User } from "@/server/domain/user";
import { RegisterInput } from "@/server/dto/auth.dto";
import { toResult } from "lyney";

export class UserPrismaRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return (await prisma.user.findUnique({ where: { email } })) as User | null;
  }

  async findById(id: string): Promise<User | null> {
    return (await prisma.user.findUnique({ where: { id } })) as User | null;
  }

  async create(data: RegisterInput & { passwordHash: string }): Promise<User> {
    const result = await toResult(
      prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          password: data.passwordHash,
          role: "Employee",
        },
      }),
    );

    if (!result.ok) {
      throw result.error.message;
    }
    return result.data as User;
  }
}
