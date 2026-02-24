export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "Employee" | "Super" | "Affiliate";
  referralCode: string | null;
  fullName: string | null;
  phone: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  commissionRate: number | null;
  passwordChanged: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SignInState {
  success: boolean;
  message: string;
}

export const signInInitialState: SignInState = {
  success: false,
  message: "",
};
