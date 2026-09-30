import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { AuthService } from '../services/auth.service.js';
import { UserRole } from '../types/index.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

async function runAllTests() {
  console.log('================================================================');
  console.log('   SKYLINE CRM - PHASE 1 AUTOMATED VERIFICATION SUITE');
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
  console.log('--- 1. Database & Seed Verification ---');
  await seedDatabase();
  const roles = await db.all('SELECT * FROM roles');
  assert(roles.length >= 3, 'Roles initialized', `Found ${roles.length} roles`);

  const adminUser = await db.get('SELECT * FROM users WHERE email = ?', ['admin@skylinecrm.com']);
  assert(!!adminUser, 'Admin account seeded in database');

  const employeeUser = await db.get('SELECT * FROM users WHERE email = ?', ['employee@skylinecrm.com']);
  assert(!!employeeUser, 'Employee account seeded in database');

  const agentUser = await db.get('SELECT * FROM users WHERE email = ?', ['agent@skylinecrm.com']);
  assert(!!agentUser, 'Agent account seeded in database');

  // 2. Authentication: Login Tests
  console.log('\n--- 2. Login Verification ---');
  const adminLogin = await AuthService.login({
    email: 'admin@skylinecrm.com',
    password: 'SkylineAdmin2026!',
    rememberMe: true,
  });
  assert(adminLogin.user.roles.includes(UserRole.ADMIN), 'Admin login successful and returned ADMIN role');
  assert(!!adminLogin.token, 'Admin login issued signed JWT token');

  const decodedAdmin: any = jwt.verify(adminLogin.token, config.jwtSecret);
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

  // Negative test: Invalid credentials
  try {
    await AuthService.login({ email: 'admin@skylinecrm.com', password: 'WrongPassword123!' });
    assert(false, 'Invalid password should throw error');
  } catch (err: any) {
    assert(err.statusCode === 401, 'Invalid password correctly rejected with 401');
  }

  // 3. Registration Flow & Role Security
  console.log('\n--- 3. Registration & Public Role Hardening ---');
  const testEmail = `agent_${Date.now()}@skylinecrm.com`;
  const regResult = await AuthService.register({
    name: 'Test Estate Agent',
    email: testEmail,
    phone: '+1 (555) 888-9999',
    password: 'Password@2026!',
  });
  assert(regResult.user.roles.includes(UserRole.AGENT), 'New public registration assigned AGENT role');
  assert(!regResult.user.roles.includes(UserRole.ADMIN), 'Security rule: New public registration CANNOT be ADMIN');
  assert(regResult.user.email === testEmail, 'Registered user email normalized and stored');

  // Duplicate email registration should fail
  try {
    await AuthService.register({
      name: 'Duplicate Agent',
      email: testEmail,
      phone: '+1 (555) 888-9999',
      password: 'Password@2026!',
    });
    assert(false, 'Duplicate registration should throw 409 conflict');
  } catch (err: any) {
    assert(err.statusCode === 409, 'Duplicate registration correctly rejected with 409');
  }

  // 4. Password Reset Token Workflow
  console.log('\n--- 4. Password Reset & Token Lifecycle ---');
  const forgotRes = await AuthService.requestPasswordReset(testEmail);
  assert(forgotRes.success === true, 'Forgot password request succeeded');
  assert(!!forgotRes.previewToken, 'Password reset token generated and returned in non-prod');

  const resetToken = forgotRes.previewToken!;
  const newPassword = 'NewSecretPassword@2026!';
  const resetSuccess = await AuthService.resetPassword(resetToken, newPassword);
  assert(resetSuccess === true, 'Password reset executed successfully with valid token');

  // Old password should now fail
  try {
    await AuthService.login({ email: testEmail, password: 'Password@2026!' });
    assert(false, 'Old password should no longer work after reset');
  } catch (err: any) {
    assert(err.statusCode === 401, 'Old password rejected with 401');
  }

  // New password should work
  const newLogin = await AuthService.login({ email: testEmail, password: newPassword });
  assert(newLogin.user.email === testEmail, 'Login with new password succeeded');

  // Replaying the same token should fail
  try {
    await AuthService.resetPassword(resetToken, 'AnotherPassword@2026!');
    assert(false, 'Used password reset token cannot be reused');
  } catch (err: any) {
    assert(err.statusCode === 400, 'Reused reset token correctly rejected with 400');
  }

  // 5. Audit Logging Verification
  console.log('\n--- 5. Audit & Activity Logging ---');
  const auditLogs = await db.all('SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC', [regResult.user.id]);
  assert(auditLogs.length >= 3, 'Audit log recorded actions for user (Register, Forgot PW, Reset PW, Login)', `Logged ${auditLogs.length} events`);

  const actions = auditLogs.map(l => l.action);
  assert(actions.includes('AUTH_REGISTER'), 'Audit log contains AUTH_REGISTER event');
  assert(actions.includes('AUTH_FORGOT_PW'), 'Audit log contains AUTH_FORGOT_PW event');
  assert(actions.includes('AUTH_RESET_PW_COMPLETE'), 'Audit log contains AUTH_RESET_PW_COMPLETE event');

  console.log('\n================================================================');
  console.log(`   SUITE SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
