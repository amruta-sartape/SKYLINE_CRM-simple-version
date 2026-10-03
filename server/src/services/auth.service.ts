import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';
import {
  UserModel,
  RoleModel,
  AuditLogModel,
  PasswordResetModel,
  EmailVerificationModel,
} from '../models/index.js';
import { EmailService } from './email.service.js';
import {
  User,
  UserDTO,
  UserRole,
  UserStatus,
  JWTPayload,
  AuthSuccessResponse,
} from '../types/index.js';

export class AuthService {
  /**
   * Register a new user.
   * - CUSTOMER: Auto-verified, returns JWT session immediately (100% untouched customer flow).
   * - AGENT / EMPLOYEE (Operations): Requires email verification before login. Returns success message without JWT.
   * - ADMIN: Public/Self-registration strictly forbidden.
   */
  public static async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole | string;
  }): Promise<AuthSuccessResponse> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if email already exists
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      const error: any = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      error.field = 'email';
      throw error;
    }

    const requestedRole = String(data.role || '').toUpperCase().trim();

    // Strictly forbid self-registration for Administrator
    if (requestedRole === UserRole.ADMIN) {
      const error: any = new Error('Self-registration for the Administrator role is strictly prohibited.');
      error.statusCode = 403;
      throw error;
    }

    const userId = `usr_${crypto.randomUUID()}`;
    const passwordHash = await bcrypt.hash(data.password, 10);
    const now = new Date().toISOString();

    // 1. CUSTOMER REGISTRATION: Auto-verified & persistent customer session
    if (requestedRole === UserRole.CUSTOMER) {
      const userDoc = await UserModel.create({
        _id: userId,
        name: data.name.trim(),
        email: normalizedEmail,
        phone: data.phone.trim(),
        password_hash: passwordHash,
        status: UserStatus.ACTIVE,
        roles: [UserRole.CUSTOMER],
        is_email_verified: true,
        email_verified_at: now,
        created_at: now,
        updated_at: now,
      });

      await AuditLogModel.create({
        _id: `log_${crypto.randomUUID()}`,
        user_id: userId,
        action: 'AUTH_REGISTER_CUSTOMER',
        resource: 'users',
        details: { email: normalizedEmail, role: UserRole.CUSTOMER },
      });

      const userDto: UserDTO = {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        status: userDoc.status,
        roles: userDoc.roles,
        is_email_verified: true,
        email_verified_at: now,
        created_at: now,
        last_login_at: null,
      };

      const token = this.generateToken({
        userId: userDto.id,
        email: userDto.email,
        roles: userDto.roles,
      });

      return { user: userDto, token };
    }

    // 2. STAFF REGISTRATION: Operations (EMPLOYEE) or AGENT
    const assignedRole =
      requestedRole === 'EMPLOYEE' || requestedRole === 'OPERATIONS'
        ? UserRole.EMPLOYEE
        : UserRole.AGENT;

    const userDoc = await UserModel.create({
      _id: userId,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
      password_hash: passwordHash,
      status: UserStatus.ACTIVE,
      roles: [assignedRole],
      is_email_verified: false,
      email_verified_at: null,
      created_at: now,
      updated_at: now,
    });

    // Generate single-use cryptographic verification token (24h expiry)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await EmailVerificationModel.create({
      _id: `emv_${crypto.randomUUID()}`,
      user_id: userId,
      email: normalizedEmail,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    const verificationLink = `${config.clientUrl}/verify-email?token=${rawToken}`;
    await EmailService.sendVerificationEmail({
      name: data.name.trim(),
      email: normalizedEmail,
      verificationLink,
      role: assignedRole,
    });

    await AuditLogModel.create({
      _id: `log_${crypto.randomUUID()}`,
      user_id: userId,
      action: 'AUTH_REGISTER_STAFF',
      resource: 'users',
      details: { email: normalizedEmail, role: assignedRole, requiresVerification: true },
    });

    const userDto: UserDTO = {
      id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone,
      status: userDoc.status,
      roles: userDoc.roles,
      is_email_verified: false,
      email_verified_at: null,
      created_at: now,
      last_login_at: null,
    };

    return {
      user: userDto,
      requiresVerification: true,
      message: 'Registration successful. Please check your email to verify your account before logging in.',
    };
  }

  /**
   * Verify staff account via single-use cryptographic token
   */
  public static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      const error: any = new Error('Verification token is required.');
      error.statusCode = 400;
      throw error;
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const now = new Date().toISOString();

    const verificationRecord = await EmailVerificationModel.findOne({
      token_hash: tokenHash,
      used_at: null,
      expires_at: { $gt: now },
    });

    if (!verificationRecord) {
      const error: any = new Error(
        'Verification link is invalid or has expired. Please request a new verification email.'
      );
      error.statusCode = 400;
      throw error;
    }

    // Activate and mark user as verified
    await UserModel.findByIdAndUpdate(verificationRecord.user_id, {
      is_email_verified: true,
      status: UserStatus.ACTIVE,
      email_verified_at: now,
      updated_at: now,
    });

    // Mark single-use token as used
    verificationRecord.used_at = now;
    await verificationRecord.save();

    // Audit log
    await AuditLogModel.create({
      _id: `log_${crypto.randomUUID()}`,
      user_id: verificationRecord.user_id,
      action: 'AUTH_EMAIL_VERIFIED',
      resource: 'users',
      details: { email: verificationRecord.email },
    });

    return {
      success: true,
      message: 'Email verified successfully. Your account is now active and you can log in.',
    };
  }

  /**
   * Resend email verification link to unverified staff
   */
  public static async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });

    // Anti-enumeration: Return generic message if user not found or already verified
    if (!user || user.is_email_verified) {
      return {
        success: true,
        message: 'If an unverified account exists with this email, a verification link has been sent.',
      };
    }

    // Invalidate existing unused tokens for this user
    await EmailVerificationModel.updateMany(
      { user_id: user._id, used_at: null },
      { used_at: new Date().toISOString() }
    );

    // Generate new single-use token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await EmailVerificationModel.create({
      _id: `emv_${crypto.randomUUID()}`,
      user_id: user._id,
      email: normalizedEmail,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    const verificationLink = `${config.clientUrl}/verify-email?token=${rawToken}`;
    const userRole = user.roles?.[0] || UserRole.AGENT;
    await EmailService.sendVerificationEmail({
      name: user.name,
      email: normalizedEmail,
      verificationLink,
      role: userRole,
    });

    return {
      success: true,
      message: 'If an unverified account exists with this email, a verification link has been sent.',
    };
  }

  /**
   * Authenticate user credentials and return session token.
   */
  public static async login(
    credentials: { email: string; password: string; rememberMe?: boolean },
    meta?: { ip?: string; userAgent?: string }
  ): Promise<AuthSuccessResponse> {
    const normalizedEmail = credentials.email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== UserStatus.ACTIVE && user.status !== ('PENDING_VERIFICATION' as any)) {
      const error: any = new Error('Account is deactivated or suspended. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Enforce email verification for Staff (Operations & Agents)
    const isStaff = user.roles?.some(
      (r) => r === UserRole.EMPLOYEE || r === UserRole.AGENT
    );

    if (isStaff && user.is_email_verified === false) {
      const error: any = new Error(
        'Please verify your email before logging in. Check your inbox for the verification link.'
      );
      error.statusCode = 403;
      error.requiresVerification = true;
      throw error;
    }

    // Update last login timestamp
    const now = new Date().toISOString();
    user.last_login_at = now;
    await user.save();

    // Audit log
    await AuditLogModel.create({
      _id: `log_${crypto.randomUUID()}`,
      user_id: user._id,
      action: 'AUTH_LOGIN',
      resource: 'auth',
      ip_address: meta?.ip || null,
      user_agent: meta?.userAgent || null,
      details: { rememberMe: !!credentials.rememberMe },
    });

    const userDto: UserDTO = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: user.roles,
      is_email_verified: user.is_email_verified ?? true,
      email_verified_at: user.email_verified_at ? String(user.email_verified_at) : null,
      created_at: typeof user.created_at === 'string' ? user.created_at : user.created_at.toISOString(),
      last_login_at: now,
    };

    const token = this.generateToken(
      {
        userId: userDto.id,
        email: userDto.email,
        roles: userDto.roles,
      },
      credentials.rememberMe ? '30d' : config.jwtExpiresIn
    );

    return { user: userDto, token };
  }

  /**
   * Fetch user by ID
   */
  public static async getUserById(userId: string): Promise<UserDTO | null> {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: user.roles,
      is_email_verified: user.is_email_verified ?? true,
      email_verified_at: user.email_verified_at ? String(user.email_verified_at) : null,
      created_at: typeof user.created_at === 'string' ? user.created_at : user.created_at.toISOString(),
      last_login_at: user.last_login_at
        ? typeof user.last_login_at === 'string'
          ? user.last_login_at
          : user.last_login_at.toISOString()
        : null,
    };
  }

  /**
   * Request password reset token
   */
  public static async requestPasswordReset(
    email: string
  ): Promise<{ success: boolean; previewToken?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });

    // Anti-enumeration: Return success even if email not found
    if (!user) {
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await PasswordResetModel.create({
      _id: `pr_${crypto.randomUUID()}`,
      user_id: user._id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    await AuditLogModel.create({
      _id: `log_${crypto.randomUUID()}`,
      user_id: user._id,
      action: 'AUTH_FORGOT_PW',
      resource: 'password_resets',
      details: { email: normalizedEmail },
    });

    const previewToken = config.nodeEnv !== 'production' ? resetToken : undefined;
    return { success: true, previewToken };
  }

  /**
   * Reset password with valid token
   */
  public static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const now = new Date().toISOString();

    const record = await PasswordResetModel.findOne({
      token_hash: tokenHash,
      used_at: null,
      expires_at: { $gt: now },
    });

    if (!record) {
      const error: any = new Error(
        'Password reset link is invalid or has expired. Please request a new one.'
      );
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await UserModel.findByIdAndUpdate(record.user_id, {
      password_hash: passwordHash,
      updated_at: now,
    });

    // Mark token as used
    record.used_at = now;
    await record.save();

    // Audit log
    await AuditLogModel.create({
      _id: `log_${crypto.randomUUID()}`,
      user_id: record.user_id,
      action: 'AUTH_RESET_PW_COMPLETE',
      resource: 'users',
    });

    return true;
  }

  /**
   * Helper: Generate JWT token
   */
  private static generateToken(
    payload: JWTPayload,
    expiresIn: string = config.jwtExpiresIn
  ): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: expiresIn as any,
    });
  }
}
