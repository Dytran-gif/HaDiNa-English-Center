export interface AdminProfile {
  userId: number;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  email: string;
  role: string;
}
