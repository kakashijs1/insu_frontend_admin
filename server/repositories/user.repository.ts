import { User } from "@/server/domain/user";
import { RegisterInput } from "@/server/dto/auth.dto";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: RegisterInput & { passwordHash: string }): Promise<User>;
}
