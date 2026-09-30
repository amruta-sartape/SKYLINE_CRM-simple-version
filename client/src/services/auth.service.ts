import api from './api';
import {
  AuthResponse,
  LoginCredentials,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ApiResponse,
  User,
} from '../types/auth.types';

export const authService = {
  /**
   * Register a new agent account
   */
  async register(data: RegisterFormData): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data!;
  },

  /**
   * Authenticate user credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data!;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getProfile(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data!.user;
  },

  /**
   * Initiate forgot password flow
   */
  async forgotPassword(data: ForgotPasswordFormData): Promise<{ message: string; previewToken?: string }> {
    const res = await api.post<ApiResponse<{ previewToken?: string }>>('/auth/forgot-password', data);
    return {
      message: res.data.message || 'Password reset link sent.',
      previewToken: res.data.data?.previewToken,
    };
  },

  /**
   * Submit new password with reset token
   */
  async resetPassword(data: ResetPasswordFormData): Promise<string> {
    const res = await api.post<ApiResponse<null>>('/auth/reset-password', data);
    return res.data.message || 'Password reset successfully.';
  },

  /**
   * Terminate active session
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clean local storage even if backend call fails
    }
  },

  /**
   * Sample role testing endpoints to verify backend role enforcement
   */
  async testAdminAccess(): Promise<any> {
    const res = await api.get('/portal/admin-only');
    return res.data;
  },

  async testEmployeeAccess(): Promise<any> {
    const res = await api.get('/portal/employee-access');
    return res.data;
  },

  async testAgentAccess(): Promise<any> {
    const res = await api.get('/portal/agent-access');
    return res.data;
  },

  async testSessionCheck(): Promise<any> {
    const res = await api.get('/portal/session-check');
    return res.data;
  },
};
