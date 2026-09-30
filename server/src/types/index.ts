export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  AGENT = 'AGENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  created_at: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  roles: UserRole[];
  created_at: string;
  last_login_at: string | null;
}

export interface JWTPayload {
  userId: string;
  email: string;
  roles: UserRole[];
}

export interface AuthSuccessResponse {
  user: UserDTO;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}
