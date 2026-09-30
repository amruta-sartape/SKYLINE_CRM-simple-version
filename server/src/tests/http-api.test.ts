import express from 'express';
import cors from 'cors';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import authRoutes from '../routes/auth.routes.js';
import portalRoutes from '../routes/protected-sample.routes.js';
import { errorHandler } from '../middleware/error.middleware.js';
import { AuthService } from '../services/auth.service.js';

async function runHttpTests() {
  console.log('================================================================');
  console.log('   SKYLINE CRM - HTTP REST API & MIDDLEWARE VERIFICATION');
  console.log('================================================================\n');

  await seedDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/portal', portalRoutes);
  app.use(errorHandler);

  const server = app.listen(0);
  const address: any = server.address();
  const port = address.port;
  const baseUrl = `http://localhost:${port}`;

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

  try {
    // 1. Get auth tokens for testing
    const adminAuth = await AuthService.login({ email: 'admin@skylinecrm.com', password: 'SkylineAdmin2026!' });
    const employeeAuth = await AuthService.login({ email: 'employee@skylinecrm.com', password: 'SkylineEmployee2026!' });
    const agentAuth = await AuthService.login({ email: 'agent@skylinecrm.com', password: 'SkylineAgent2026!' });

    // 2. Test GET /api/auth/me (Profile endpoint)
    console.log('--- 1. Protected /api/auth/me Endpoint ---');
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    const meJson: any = await meRes.json();
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 with valid token');
    assert(meJson.data.user.email === 'admin@skylinecrm.com', 'Profile returned correct user email');

    // Unauthenticated request
    const unauthRes = await fetch(`${baseUrl}/api/auth/me`);
    assert(unauthRes.status === 401, 'Unauthenticated request to /api/auth/me returns 401');

    // 3. Test RBAC on /api/portal/admin-only
    console.log('\n--- 2. RBAC Guard: /api/portal/admin-only ---');
    const adminOnlyWithAdmin = await fetch(`${baseUrl}/api/portal/admin-only`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    assert(adminOnlyWithAdmin.status === 200, 'ADMIN role accesses /api/portal/admin-only -> 200 OK');

    const adminOnlyWithEmployee = await fetch(`${baseUrl}/api/portal/admin-only`, {
      headers: { Authorization: `Bearer ${employeeAuth.token}` },
    });
    assert(adminOnlyWithEmployee.status === 403, 'EMPLOYEE role blocked from /api/portal/admin-only -> 403 Forbidden');

    const adminOnlyWithAgent = await fetch(`${baseUrl}/api/portal/admin-only`, {
      headers: { Authorization: `Bearer ${agentAuth.token}` },
    });
    assert(adminOnlyWithAgent.status === 403, 'AGENT role blocked from /api/portal/admin-only -> 403 Forbidden');

    // 4. Test RBAC on /api/portal/employee-access
    console.log('\n--- 3. RBAC Guard: /api/portal/employee-access ---');
    const empWithAdmin = await fetch(`${baseUrl}/api/portal/employee-access`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    assert(empWithAdmin.status === 200, 'ADMIN role accesses /api/portal/employee-access -> 200 OK');

    const empWithEmployee = await fetch(`${baseUrl}/api/portal/employee-access`, {
      headers: { Authorization: `Bearer ${employeeAuth.token}` },
    });
    assert(empWithEmployee.status === 200, 'EMPLOYEE role accesses /api/portal/employee-access -> 200 OK');

    const empWithAgent = await fetch(`${baseUrl}/api/portal/employee-access`, {
      headers: { Authorization: `Bearer ${agentAuth.token}` },
    });
    assert(empWithAgent.status === 403, 'AGENT role blocked from /api/portal/employee-access -> 403 Forbidden');

    // 5. Test RBAC on /api/portal/agent-access
    console.log('\n--- 4. RBAC Guard: /api/portal/agent-access ---');
    const agentWithAdmin = await fetch(`${baseUrl}/api/portal/agent-access`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    assert(agentWithAdmin.status === 200, 'ADMIN role accesses /api/portal/agent-access -> 200 OK');

    const agentWithAgent = await fetch(`${baseUrl}/api/portal/agent-access`, {
      headers: { Authorization: `Bearer ${agentAuth.token}` },
    });
    assert(agentWithAgent.status === 200, 'AGENT role accesses /api/portal/agent-access -> 200 OK');

    // 6. Test Zod Validation on POST /api/auth/register
    console.log('\n--- 5. Zod Request Body Validation ---');
    const invalidRegRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A', // too short
        email: 'invalid-email',
        phone: '123',
        password: 'weak',
        confirmPassword: 'mismatch',
        termsAccepted: false,
      }),
    });
    const invalidJson: any = await invalidRegRes.json();
    assert(invalidRegRes.status === 400, 'Invalid registration payload rejected with 400 Bad Request');
    assert(!!invalidJson.errors, 'Structured field-level validation errors returned');
    assert(!!invalidJson.errors.name, 'Name field validation error present');
    assert(!!invalidJson.errors.email, 'Email field validation error present');
    assert(!!invalidJson.errors.password, 'Password field validation error present');
    assert(!!invalidJson.errors.confirmPassword, 'Confirm password match error present');
    assert(!!invalidJson.errors.termsAccepted, 'Terms acceptance error present');

    console.log('\n================================================================');
    console.log(`   HTTP SUITE SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================\n');
  } finally {
    server.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runHttpTests().catch((err) => {
  console.error('HTTP test suite failed:', err);
  process.exit(1);
});
