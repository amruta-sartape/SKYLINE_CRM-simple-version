import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { AuthService } from '../services/auth.service.js';
import { UserModel, RoleModel, AuditLogModel } from '../models/index.js';
import { UserRole } from '../types/index.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

async function runAllTests() {
  console.log('================================================================');
  console.log('   SKYLINE CRM - AUTH & RBAC AUTOMATED VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // 1. Database Initialization & Seeding
  console.log('--- 1. MongoDB Database & Seed Verification ---');
  await seedDatabase();
  const roles = await RoleModel.find();
  assert(roles.length >= 3, 'Roles initialized in MongoDB', `Found ${roles.length} roles`);

  const adminUser = await UserModel.findOne({ email: 'admin@skylinecrm.com' });
  assert(!!adminUser, 'Admin account seeded in MongoDB');

  const employeeUser = await UserModel.findOne({ email: 'employee@skylinecrm.com' });
  assert(!!employeeUser, 'Employee account seeded in MongoDB');

  const agentUser = await UserModel.findOne({ email: 'agent@skylinecrm.com' });
  assert(!!agentUser, 'Agent account seeded in MongoDB');

  // 2. Authentication: Login Tests
  console.log('\n--- 2. Login Verification ---');
  const adminLogin = await AuthService.login({
    email: 'admin@skylinecrm.com',
    password: 'SkylineAdmin2026!',
    rememberMe: true,
  });
  assert(adminLogin.user.roles.includes(UserRole.ADMIN), 'Admin login successful and returned ADMIN role');
  assert(!!adminLogin.token, 'Admin login issued signed JWT token');

  const decodedAdmin: any = jwt.verify(adminLogin.token!, config.jwtSecret);
  assert(decodedAdmin.userId === adminLogin.user.id, 'JWT payload matches authenticated user ID');
  assert(decodedAdmin.roles.includes(UserRole.ADMIN), 'JWT claims contain ADMIN role');

  const employeeLogin = await AuthService.login({
    email: 'employee@skylinecrm.com',
    password: 'SkylineEmployee2026!',
  });
  assert(employeeLogin.user.roles.includes(UserRole.EMPLOYEE), 'Employee login successful and returned EMPLOYEE role');

  const agentLogin = await AuthService.login({
    email: 'agent@skylinecrm.com',
    password: 'SkylineAgent2026!',
  });
  assert(agentLogin.user.roles.includes(UserRole.AGENT), 'Agent login successful and returned AGENT role');

  // 3. Negative Login Tests
  console.log('\n--- 3. Negative Login & Validation Checks ---');
  try {
    await AuthService.login({ email: 'admin@skylinecrm.com', password: 'WrongPassword!' });
    assert(false, 'Rejected invalid password');
  } catch (err: any) {
    assert(err.statusCode === 401, 'Rejected invalid password with HTTP 401');
  }

  try {
    await AuthService.login({ email: 'nonexistent@skylinecrm.com', password: 'SomePassword123!' });
    assert(false, 'Rejected non-existent user');
  } catch (err: any) {
    assert(err.statusCode === 401, 'Rejected non-existent user with HTTP 401');
  }

  // 4. Registration
  console.log('\n--- 4. Registration Flow ---');
  const uniqueEmail = `new.agent.${Date.now()}@skylinecrm.com`;
  const regResult = await AuthService.register({
    name: 'New Test Agent',
    email: uniqueEmail,
    phone: '+1 (555) 777-8899',
    password: 'SecureAgentPass2026!',
  });
  assert(regResult.user.roles.includes(UserRole.AGENT), 'Public registration securely assigned AGENT role');
  assert(regResult.user.email === uniqueEmail.toLowerCase(), 'User email registered correctly');

  // 5. Customer Registration
  const customerEmail = `new.customer.${Date.now()}@skylinecrm.com`;
  const customerReg = await AuthService.register({
    name: 'Portal Customer',
    email: customerEmail,
    phone: '+1 (555) 999-0000',
    password: 'CustomerPass2026!',
    role: UserRole.CUSTOMER,
  });
  assert(customerReg.user.roles.includes(UserRole.CUSTOMER), 'Customer registration assigned CUSTOMER role');

  // 6. Audit Logging
  console.log('\n--- 6. Security Audit Trail ---');
  const auditLogs = await AuditLogModel.find({ user_id: regResult.user.id });
  assert(auditLogs.length > 0, 'Audit log recorded for user registration in MongoDB');

  console.log(`\n================================================================`);
  console.log(`   AUTH TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().then(() => process.exit(0)).catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
