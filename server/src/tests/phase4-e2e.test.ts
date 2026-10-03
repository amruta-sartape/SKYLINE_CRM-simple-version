import assert from 'assert';
import { seedDatabase } from '../db/seed.js';
import { AuthService } from '../services/auth.service.js';
import { SiteVisitService } from '../services/siteVisit.service.js';
import { FollowUpService } from '../services/followUp.service.js';
import { JWTPayload, UserRole } from '../types/index.js';

let adminPayload: JWTPayload;
let agentPayload: JWTPayload;

async function runTests() {
  console.log('\n================================================================');
  console.log('   SKYLINE CRM - SITE VISITS & FOLLOW-UPS TEST SUITE');
  console.log('================================================================\n');

  await seedDatabase();

  const adminAuth = await AuthService.login({ email: 'admin@skylinecrm.com', password: 'SkylineAdmin2026!' });
  const agentAuth = await AuthService.login({ email: 'agent@skylinecrm.com', password: 'SkylineAgent2026!' });

  adminPayload = { userId: adminAuth.user.id, email: adminAuth.user.email, roles: adminAuth.user.roles };
  agentPayload = { userId: agentAuth.user.id, email: agentAuth.user.email, roles: agentAuth.user.roles };

  console.log('--- 1. Site Visits List & Summary ---');
  const visits = await SiteVisitService.list({}, adminPayload);
  assert(visits.total >= 5, 'Site visits retrieved from MongoDB');
  console.log(`  ✅ PASS: Admin fetched ${visits.total} site visits.`);

  const summary = await SiteVisitService.getSummary(adminPayload);
  assert(summary.total_visits >= 5, 'Site visit summary calculated');
  console.log('  ✅ PASS: Site visit summary generated.');

  console.log('\n--- 2. Follow-ups List & Statuses ---');
  const followUps = await FollowUpService.list({ view: 'all' }, adminPayload);
  assert(followUps.total >= 5, 'Follow-ups retrieved from MongoDB');
  console.log(`  ✅ PASS: Fetched ${followUps.total} follow-ups.`);

  const folSummary = await FollowUpService.getSummary(adminPayload);
  assert(folSummary.today !== undefined, 'Follow-up summary today present');
  console.log('  ✅ PASS: Follow-up dashboard metrics computed.');

  console.log('\n================================================================');
  console.log('   SITE VISITS & FOLLOW-UPS SUITE PASSED');
  console.log('================================================================\n');
}

runTests().then(() => process.exit(0)).catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
