import assert from 'assert';
import { seedDatabase } from '../db/seed.js';
import { AuthService } from '../services/auth.service.js';
import { EnquiryService } from '../services/enquiry.service.js';
import { LeadService } from '../services/lead.service.js';
import { EnquiryModel, LeadModel } from '../models/index.js';
import { JWTPayload, UserRole } from '../types/index.js';

let adminPayload: JWTPayload;
let employeePayload: JWTPayload;
let agentPayload: JWTPayload;

async function runTests() {
  console.log('\n================================================================');
  console.log('   SKYLINE CRM - ENQUIRIES & LEADS PIPELINE TEST SUITE');
  console.log('================================================================\n');

  await seedDatabase();

  const adminAuth = await AuthService.login({ email: 'admin@skylinecrm.com', password: 'SkylineAdmin2026!' });
  const employeeAuth = await AuthService.login({ email: 'employee@skylinecrm.com', password: 'SkylineEmployee2026!' });
  const agentAuth = await AuthService.login({ email: 'agent@skylinecrm.com', password: 'SkylineAgent2026!' });

  adminPayload = { userId: adminAuth.user.id, email: adminAuth.user.email, roles: adminAuth.user.roles };
  employeePayload = { userId: employeeAuth.user.id, email: employeeAuth.user.email, roles: employeeAuth.user.roles };
  agentPayload = { userId: agentAuth.user.id, email: agentAuth.user.email, roles: agentAuth.user.roles };

  console.log('--- 1. Enquiries List & RBAC ---');
  const allEnquiries = await EnquiryService.getEnquiries({}, adminPayload);
  assert(allEnquiries.total >= 5, 'Admin sees all enquiries');
  console.log(`  ✅ PASS: Admin fetched ${allEnquiries.total} enquiries.`);

  const agentEnquiries = await EnquiryService.getEnquiries({}, agentPayload);
  assert(agentEnquiries.enquiries.every((e) => e.assigned_to === agentPayload.userId), 'Agent only sees assigned enquiries');
  console.log(`  ✅ PASS: Agent scoped to ${agentEnquiries.total} assigned enquiries.`);

  console.log('\n--- 2. Create & Convert Enquiry to Lead ---');
  const newEnq = await EnquiryService.createEnquiry({
    customer_name: 'Test Convert Client',
    phone: '+1 (555) 333-4444',
    email: 'convert.test@example.com',
    budget: 15000000,
    interested_property: 'Skyline Heights Grand Residences',
    configuration: '3 BHK',
    lead_source: 'Website',
    assigned_to: agentPayload.userId,
  }, adminPayload.userId);
  assert(newEnq.id, 'Enquiry created in MongoDB');

  const { enquiry: convertedEnq, lead } = await EnquiryService.convertToLead(newEnq.id, {
    purpose: 'Investment',
    priority: 'High',
  }, adminPayload.userId);
  assert(convertedEnq.status === 'Converted', 'Enquiry status updated to Converted');
  assert(lead.id, 'Lead record created');
  assert(lead.customer_name === 'Test Convert Client', 'Lead data matches enquiry');
  console.log('  ✅ PASS: Enquiry successfully converted to Pipeline Lead.');

  console.log('\n--- 3. Pipeline Board ---');
  const board = await LeadService.getPipelineBoard({}, adminPayload);
  assert(board.length === 7, 'Pipeline board contains all 7 stages');
  console.log('  ✅ PASS: Kanban board grouped cleanly across 7 stages.');

  console.log('\n================================================================');
  console.log('   ENQUIRIES & LEADS SUITE PASSED');
  console.log('================================================================\n');
}

runTests().then(() => process.exit(0)).catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
