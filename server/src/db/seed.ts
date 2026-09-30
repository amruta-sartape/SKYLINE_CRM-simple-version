import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './database.js';
import { UserRole, UserStatus } from '../types/index.js';

export async function seedDatabase(): Promise<void> {
  console.log('[Seed] Starting database seed...');
  await db.initSchema();

  // 1. Seed Roles
  const rolesData = [
    {
      id: 'role_admin',
      name: UserRole.ADMIN,
      description: 'Full system administrator with unrestricted access to all modules and configurations',
    },
    {
      id: 'role_employee',
      name: UserRole.EMPLOYEE,
      description: 'Operations and staff member managing leads, site visits, customer follow-ups, and support',
    },
    {
      id: 'role_agent',
      name: UserRole.AGENT,
      description: 'Real estate sales agent managing inquiries, property deals, client visits, and commissions',
    },
  ];

  for (const role of rolesData) {
    const existing = await db.get('SELECT id FROM roles WHERE name = ?', [role.name]);
    if (!existing) {
      await db.run(
        'INSERT INTO roles (id, name, description) VALUES (?, ?, ?)',
        [role.id, role.name, role.description]
      );
      console.log(`[Seed] Created role: ${role.name}`);
    }
  }

  // 2. Seed Default Accounts
  const seedUsers = [
    {
      id: 'usr_admin_001',
      name: 'Alexander Wright (Admin)',
      email: 'admin@skylinecrm.com',
      phone: '+1 (555) 234-5678',
      password: 'SkylineAdmin2026!',
      role: UserRole.ADMIN,
      roleId: 'role_admin',
    },
    {
      id: 'usr_employee_001',
      name: 'Eleanor Vance (Operations)',
      email: 'employee@skylinecrm.com',
      phone: '+1 (555) 345-6789',
      password: 'SkylineEmployee2026!',
      role: UserRole.EMPLOYEE,
      roleId: 'role_employee',
    },
    {
      id: 'usr_agent_001',
      name: 'Marcus Sterling (Real Estate Agent)',
      email: 'agent@skylinecrm.com',
      phone: '+1 (555) 456-7890',
      password: 'SkylineAgent2026!',
      role: UserRole.AGENT,
      roleId: 'role_agent',
    },
  ];

  for (const u of seedUsers) {
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [u.email]);
    if (!existingUser) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await db.run(
        `INSERT INTO users (id, name, email, phone, password_hash, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [u.id, u.name, u.email, u.phone, passwordHash, UserStatus.ACTIVE]
      );

      await db.run(
        `INSERT OR IGNORE INTO user_roles (id, user_id, role_id)
         VALUES (?, ?, ?)`,
        [`ur_${crypto.randomUUID()}`, u.id, u.roleId]
      );

      console.log(`[Seed] Created user: ${u.email} [${u.role}]`);
    } else {
      console.log(`[Seed] User already exists: ${u.email}`);
    }
  }

  console.log('[Seed] Database seed completed successfully!');
}

// Allow direct execution
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}
