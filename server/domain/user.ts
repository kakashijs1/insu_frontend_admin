export type UserRole = "Employee" | "Super" | "Affiliate";

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Don't retern password by default
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
