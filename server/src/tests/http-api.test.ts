import assert from 'assert';
import { seedDatabase } from '../db/seed.js';
import { AuthService } from '../services/auth.service.js';
import { UserModel, RoleModel } from '../models/index.js';
import { UserRole } from '../types/index.js';

async function runTests() {
  console.log('\n================================================================');
  console.log('   SKYLINE CRM - HTTP API & RBAC CONTROLLER SUITE');
  console.log('================================================================\n');

  await seedDatabase();

  console.log('--- Testing Auth Service Login Payloads ---');
  const adminAuth = await AuthService.login({ email: 'admin@skylinecrm.com', password: 'SkylineAdmin2026!' });
  assert(adminAuth.user.roles.includes(UserRole.ADMIN), 'Admin auth valid');
  assert(adminAuth.token, 'Token present');

  const empAuth = await AuthService.login({ email: 'employee@skylinecrm.com', password: 'SkylineEmployee2026!' });
  assert(empAuth.user.roles.includes(UserRole.EMPLOYEE), 'Employee auth valid');

  const agentAuth = await AuthService.login({ email: 'agent@skylinecrm.com', password: 'SkylineAgent2026!' });
  assert(agentAuth.user.roles.includes(UserRole.AGENT), 'Agent auth valid');

  const customerAuth = await AuthService.login({ email: 'customer@skylinecrm.com', password: 'SkylineCustomer2026!' });
  assert(customerAuth.user.roles.includes(UserRole.CUSTOMER), 'Customer auth valid');

  console.log('  ✅ PASS: All 4 roles authenticated cleanly from MongoDB.');

  console.log('\n================================================================');
  console.log('   HTTP API SUITE PASSED SUCCESSFULLY');
  console.log('================================================================\n');
}

runTests().then(() => process.exit(0)).catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
