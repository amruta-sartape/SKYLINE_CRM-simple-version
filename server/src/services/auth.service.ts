import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db/database.js';
import { config } from '../config/env.js';
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
   * Public registration always assigns the AGENT role for security.
   */
  public static async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthSuccessResponse> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if email already exists
    const existing = await db.get<User>('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      const error: any = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      error.field = 'email';
      throw error;
    }

    const userId = `usr_${crypto.randomUUID()}`;
    const passwordHash = await bcrypt.hash(data.password, 10);
    const now = new Date().toISOString();

    // Insert user
    await db.run(
      `INSERT INTO users (id, name, email, phone, password_hash, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, data.name.trim(), normalizedEmail, data.phone.trim(), passwordHash, UserStatus.ACTIVE, now, now]
    );

    // Securely assign default role: AGENT (Never allow public registration to assign ADMIN)
    const agentRole = await db.get<{ id: string }>('SELECT id FROM roles WHERE name = ?', [UserRole.AGENT]);
    const roleId = agentRole?.id || 'role_agent';

    await db.run(
      `INSERT INTO user_roles (id, user_id, role_id, assigned_at)
       VALUES (?, ?, ?, ?)`,
      [`ur_${crypto.randomUUID()}`, userId, roleId, now]
    );

    // Create Audit Log
    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource, details)
       VALUES (?, ?, ?, ?, ?)`,
      [`log_${crypto.randomUUID()}`, userId, 'AUTH_REGISTER', 'users', JSON.stringify({ email: normalizedEmail, role: UserRole.AGENT })]
    );

    const userDto: UserDTO = {
      id: userId,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
      status: UserStatus.ACTIVE,
      roles: [UserRole.AGENT],
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

  /**
   * Authenticate user credentials and return session token.
   */
  public static async login(
    credentials: { email: string; password: string; rememberMe?: boolean },
    meta?: { ip?: string; userAgent?: string }
  ): Promise<AuthSuccessResponse> {
    const normalizedEmail = credentials.email.trim().toLowerCase();

    const user = await db.get<User>(
      'SELECT id, name, email, phone, password_hash, status, created_at, last_login_at FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!user) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== UserStatus.ACTIVE) {
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

    // Update last login timestamp
    const now = new Date().toISOString();
    await db.run('UPDATE users SET last_login_at = ? WHERE id = ?', [now, user.id]);

    // Retrieve roles
    const roles = await this.getUserRoles(user.id);

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `log_${crypto.randomUUID()}`,
        user.id,
        'AUTH_LOGIN',
        'auth',
        meta?.ip || null,
        meta?.userAgent || null,
        JSON.stringify({ rememberMe: !!credentials.rememberMe }),
      ]
    );

    const userDto: UserDTO = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles,
      created_at: user.created_at,
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
    const user = await db.get<User>(
      'SELECT id, name, email, phone, status, created_at, last_login_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) return null;

    const roles = await this.getUserRoles(user.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    };
  }

  /**
   * Request password reset token
   */
  public static async requestPasswordReset(email: string): Promise<{ success: boolean; previewToken?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.get<User>('SELECT id FROM users WHERE email = ?', [normalizedEmail]);

    // Anti-enumeration: Return success even if email not found
    if (!user) {
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await db.run(
      `INSERT INTO password_resets (id, user_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
      [`pr_${crypto.randomUUID()}`, user.id, tokenHash, expiresAt]
    );

    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource, details)
       VALUES (?, ?, ?, ?, ?)`,
      [`log_${crypto.randomUUID()}`, user.id, 'AUTH_FORGOT_PW', 'password_resets', JSON.stringify({ email: normalizedEmail })]
    );

    // In non-production, return preview token to facilitate developer testing
    const previewToken = config.nodeEnv !== 'production' ? resetToken : undefined;

    return { success: true, previewToken };
  }

  /**
   * Reset password with valid token
   */
  public static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const now = new Date().toISOString();

    const record = await db.get<{ id: string; user_id: string; expires_at: string; used_at: string | null }>(
      'SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?',
      [tokenHash]
    );

    if (!record || record.used_at || new Date(record.expires_at) < new Date()) {
      const error: any = new Error('Password reset link is invalid or has expired. Please request a new one.');
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [
      passwordHash,
      now,
      record.user_id,
    ]);

    // Mark token as used
    await db.run('UPDATE password_resets SET used_at = ? WHERE id = ?', [now, record.id]);

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (id, user_id, action, resource)
       VALUES (?, ?, ?, ?)`,
      [`log_${crypto.randomUUID()}`, record.user_id, 'AUTH_RESET_PW_COMPLETE', 'users']
    );

    return true;
  }

  /**
   * Helper: Retrieve assigned roles for a user
   */
  private static async getUserRoles(userId: string): Promise<UserRole[]> {
    const rows = await db.all<{ name: UserRole }>(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [userId]
    );

    return rows.map((r) => r.name);
  }

  /**
   * Helper: Generate JWT token
   */
  private static generateToken(payload: JWTPayload, expiresIn: string = config.jwtExpiresIn): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: expiresIn as any,
    });
  }
}
