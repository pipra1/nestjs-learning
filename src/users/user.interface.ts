export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  refreshTokenHash?: string | null;
}
